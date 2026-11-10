// Merchant-only single-order wrapper. Generic Ship scanning and hosted links stay unchanged.
import type { PluginContext } from 'emdash';
import { storeKey, CHECKOUT_SETTING } from '../features/checkout/registry-connect.js';
import { admitRegistryCheckoutConfig } from '../features/checkout/registry-provider-admission.js';
import { admitCredential, tradeStoreKey } from '../features/checkout/registry-credential.js';
import { readBoundedPaymentsJson } from '../features/checkout/test-payments.js';
import { syncShip, listOrders, deliveryOf, type OrderRecord, type OrdersCollection } from '../features/orders/index.js';
import { resolveCatalogVariantMember, type CatalogStorageRecord } from '../features/catalog/kernel/index.js';
import type { StorageCollection } from 'emdash';
import { isRecord } from '../shared/record.js';
const ORIGIN = 'https://backroadbum.com', AUDIENCE = 'backroadbum-ship';
interface Admission { schema: string; revision: number; generation: string; notBefore: string; orderId: string | null; enabled: boolean }
function fail(): never { throw Error('Merchant Ship unavailable'); }
function admission(v: unknown): Admission {
  if (!isRecord(v) || Object.keys(v).sort().join() !== 'enabled,generation,notBefore,orderId,revision,schema' ||
      v.schema !== 'backroadbum.commerce-ship/v1' || !Number.isSafeInteger(v.revision) || (v.revision as number) < 0 ||
      typeof v.generation !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(v.generation) || typeof v.enabled !== 'boolean' ||
      v.orderId !== null && (typeof v.orderId !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,199}$/.test(v.orderId)) ||
      v.enabled && !v.orderId || v.revision === 0 && (v.orderId !== null || v.enabled) ||
      typeof v.notBefore !== 'string' || !Number.isFinite(Date.parse(v.notBefore)) || new Date(v.notBefore).toISOString() !== v.notBefore) fail();
  return v as unknown as Admission;
}
const fingerprint = (a: Admission) => JSON.stringify([a.revision, a.generation, a.notBefore, a.orderId, a.enabled]);
async function controller(ctx: PluginContext) {
  const found = await storeKey(ctx), snapshot = await ctx.settings?.getVersioned(CHECKOUT_SETTING);
  const config = admitRegistryCheckoutConfig(snapshot?.value, ORIGIN);
  if (!found || !snapshot || !ctx.http || !config || config.mode !== 'test' || config.issuer !== ORIGIN ||
      config.paymentsOrigin !== ORIGIN || config.siteId !== 'backroadbum' || config.audience !== 'backroadbum-payments' || config.providerId !== 'stripe' || config.ship || config.coupons) return null;
  const fetch = ctx.http.fetch.bind(ctx.http);
  const settingsPass = tradeStoreKey(found.key, config, fetch, 'commerce:settings', 'backroadbum-commerce');
  async function read() {
    const key = await storeKey(ctx), settings = await ctx.settings!.getVersioned(CHECKOUT_SETTING);
    if (!key || key.key !== found!.key || key.revision !== found!.revision || settings?.revision !== snapshot!.revision) fail();
    const pass = admitCredential(await settingsPass, config!, 'commerce:settings', 'backroadbum-commerce');
    const response = await fetch(ORIGIN + '/api/commerce-ship', { method: 'GET', cache: 'no-store', redirect: 'error',
      headers: { accept: 'application/json', authorization: 'Bearer ' + pass, 'x-dinkus-site': 'backroadbum' } });
    if (!response.ok) fail();
    return admission(await readBoundedPaymentsJson(response));
  }
  const selected = await read();
  if (!selected.enabled || !selected.orderId) return null;
  const current = async () => fingerprint(await read()) === fingerprint(selected);
  let ordersPass: Promise<string> | undefined;
  return { selected, current, fetch, credential: async () => admitCredential(await (ordersPass ??= tradeStoreKey(found.key, config, fetch, 'ship:orders', AUDIENCE)), config, 'ship:orders', AUDIENCE) };
}
/** No source query/scan is ever called. Only this admitted canonical ID is read. */
async function eligible(record: OrderRecord | null, a: Admission): Promise<OrderRecord | null> {
  const paid = record?.paidOrder;
  if (!record || !paid || paid.orderId !== a.orderId || paid.mode !== 'test' || record.shipPin !== undefined ||
      !paid.paymentId || !paid.paidAt || !Number.isFinite(Date.parse(paid.paidAt)) || Date.parse(paid.paidAt) < Date.parse(a.notBefore) ||
      Date.parse(paid.paidAt) > Date.now() + 300000 || !deliveryOf(record)) return null;
  // Reuse canonical Orders validation on one exact record, not on historical storage.
  await listOrders({ query: async () => ({ items: [{ id: a.orderId!, data: record }], hasMore: false }) });
  return record;
}
interface Event { eventId: string; orderId: string; version: number; carrier: string; tracking: string }
function event(v: unknown, a: Admission): Event {
  if (!isRecord(v) || Object.keys(v).sort().join() !== 'carrier,eventId,orderId,tracking,version' || v.orderId !== a.orderId ||
      typeof v.eventId !== 'string' || !/^lbl_[A-Za-z0-9-]{1,80}$/.test(v.eventId) || !Number.isSafeInteger(v.version) || (v.version as number) < 1 ||
      v.carrier !== 'USPS' || typeof v.tracking !== 'string' || !/^TEST[0-9]{18}$/.test(v.tracking)) fail();
  return v as unknown as Event;
}
function completedWith(record: OrderRecord | null, label: Event) {
  return record?.completed?.carrier === label.carrier && record.completed.tracking === label.tracking && (record.revision ?? 1) === label.version + 1;
}
export async function syncMerchantShip(ctx: PluginContext): Promise<void> {
  const host = await controller(ctx); if (!host) return;
  const a = host.selected, source = ctx.storage['orders'] as OrdersCollection;
  const get = async (id: string) => id === a.orderId ? eligible(await source.get(id), a) : null;
  if (!await get(a.orderId!)) fail();
  const collection: OrdersCollection = {
    get,
    async getVersioned(id) {
      if (id !== a.orderId) fail();
      const kept = await source.getVersioned(id);
      return kept && await eligible(kept.value, a) ? kept : null;
    },
    async compareAndSet(id, revision, value) {
      if (id !== a.orderId || !await eligible(value, a) || !await host.current()) fail();
      // No await between the independent admission check and CAS dispatch.
      return source.compareAndSet(id, revision, value);
    },
    async query() { const record = await get(a.orderId!); return { items: record ? [{ id: a.orderId!, data: record }] : [], hasMore: false }; },
  };
  let pending: Event | undefined;
  await syncShip(collection, { origin: ORIGIN, site: 'backroadbum', current: host.current, credential: host.credential,
    async read(response) {
      const values = await readBoundedPaymentsJson(response);
      if (!Array.isArray(values) || values.length > 1) fail();
      if (values.length) {
        const label = event(values[0], a), record = await get(a.orderId!);
        if (!record || !(completedWith(record, label) || !record.completed && (record.revision ?? 1) === label.version)) fail();
        pending = label;
      }
      return values;
    },
    async fetch(url, init) {
      const path = new URL(url).pathname;
      if (url !== ORIGIN + path || !['/v1/orders', '/v1/labels', '/v1/labels/ack'].includes(path)) fail();
      let body = init.body;
      if (path === '/v1/orders') {
        const sent = JSON.parse(String(body));
        if (sent.orderId !== a.orderId || sent.test !== true) fail();
        body = JSON.stringify({ ...sent, email: null });
      }
      if (path === '/v1/labels/ack') {
        if (!pending || JSON.parse(String(body)).eventId !== pending.eventId || !completedWith(await get(a.orderId!), pending)) fail();
      }
      if (!await host.current()) fail();
      return host.fetch(ORIGIN + '/api/ship' + path, { ...init, ...(body ? { body } : {}) });
    },
  }, async id => {
    const found = await resolveCatalogVariantMember(ctx.storage['catalog_items'] as StorageCollection<CatalogStorageRecord>, id);
    return found && { physical: (found.member?.fulfillment ?? found.item.fulfillment ?? 'physical') === 'physical', weightOz: found.item.weightOz };
  });
}
export async function merchantShipLabelPage(ctx: PluginContext, id: string): Promise<string | undefined> {
  const host = await controller(ctx);
  if (!host || host.selected.orderId !== id) return undefined;
  const record = await eligible(await (ctx.storage['orders'] as OrdersCollection).get(id), host.selected);
  return record && !record.completed && await host.current() ? ORIGIN + '/_emdash/admin/plugins/r_ehdlg5cxkb3ffqvr/shipping' : undefined;
}
