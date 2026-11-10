// Cross-fork merchant composition proof in disposable storage. No operator files/provider network.
// Run from the peer Ship repo with the peer Payments tsx loader; see README.
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { commerceShipAdmission } from '../../../payments/ops/backroadbum/commerce-ship.mjs';
import BetterSqlite3 from 'better-sqlite3';
import { Kysely, SqliteDialect } from 'kysely';
import { PluginStorageRepository, createSettingsAccess } from 'emdash';
import { OptionsRepository } from 'emdash/internal/plugins/host';
import { WorkerdSandboxRunner } from '@emdash-cms/sandbox-workerd/sandbox';
import { generateKeyPair, exportPKCS8, exportSPKI } from 'jose';
import { createMerchantRuntime, merchantCheckoutSettings } from '../../../payments/ops/backroadbum/runtime.mjs';
import { createPracticeHost } from '../../../ship/ops/backroadbum/runtime.mjs';
import { createPaidOrderReceiver } from '../../.tmp/backroadbum-profile/dist/features/orders/index.js';
const ORIGIN = 'https://backroadbum.com', ID = 'r_gshdrqaldna3r7sn';
process.env.EMDASH_ENCRYPTION_KEY = 'emdash_enc_v1_' + randomBytes(32).toString('base64url');
const originalFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = new URL(input instanceof Request ? input.url : String(input));
  if (url.hostname === '127.0.0.1' || url.hostname === 'localhost') return originalFetch(input, init);
  assert.equal(url.origin + url.pathname, 'https://cloudflare-dns.com/dns-query', 'provider/network disabled');
  return Response.json({ Status: 0, Answer: url.searchParams.get('name') === 'backroadbum.com' ? [{ type: 1, data: '9.9.9.9' }] : [] });
};
test('actual merchant sandbox → scoped issuer → real practice host → canonical completion/ACK, excluding historical Orders', async () => {
  const pair = await generateKeyPair('ES256', { extractable: true });
  const config = { schema: 'backroadbum.payments-node/v1', mode: 'test', origin: ORIGIN, issuer: ORIGIN, subject: 'synthetic-owner', siteId: 'backroadbum',
    audience: 'backroadbum-payments', bindingRef: 'fixture', stripeAccountId: 'acct_fixture', storeKey: 'dk_store_' + 'a'.repeat(43),
    privateKey: await exportPKCS8(pair.privateKey), publicKey: await exportSPKI(pair.publicKey) };
  const shipKey = 'dk_store_' + 'b'.repeat(43);
  const admissionDb = new DatabaseSync(':memory:');
  const control = commerceShipAdmission(admissionDb, config, 'synthetic-sandbox'); control.initialize();
  let admission = control.change({ revision: 0, orderId: 'synthetic-selected', enabled: true });
  const issuer = await createMerchantRuntime({ config, apiKey: 'sk_test_fixture', store: { listWakes: () => [] }, provider: {},
    accountStatus: async () => ({ object: 'account', id: 'acct_fixture' }), commerceShip: () => control.read(),
    shipGrant: () => ({ schema: 'backroadbum.ship-grant/v1', siteId: 'backroadbum', storeKey: shipKey, enabled: true }) });
  const ship = await createPracticeHost({ config: { schema: 'backroadbum.ship-node/v1', generation: admission.generation, allowedOrderId: '', sessionSecret: 'synthetic-secret-for-local-proof-only-not-a-deployed-key' },
    fetchJwks: async () => issuer.fetch(new Request(ORIGIN + '/.well-known/jwks.json')) });
  const trade = async (key, scope, audience) => {
    const r = await issuer.fetch(new Request(ORIGIN + '/api/store-passes', { method: 'POST', headers: { authorization: 'Bearer ' + key }, body: JSON.stringify({ site_id: 'backroadbum', scope, audience }) }));
    assert.equal(r.status, 200); return (await r.json()).access_token;
  };
  const adminPass = await trade(shipKey, 'ship:admin', 'backroadbum-ship');
  const admin = (path, body) => ship.fetch('/v1/admin/' + path, { method: body ? 'POST' : 'GET', headers: { authorization: 'Bearer ' + adminPass, 'content-type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
  let runner, db;
  const machine = [];
  try {
    await admin('practice-settings', { action: 'ship-from', fields: { name: 'Fixture store', line1: '2 Example Way', city: 'Example', region: 'CA', postalCode: '90000' } });
    const packing = await (await admin('practice-settings', { action: 'add-box', fields: { name: 'Fixture box', lengthIn: '6', widthIn: '4', heightIn: '3', weightOz: '1' } })).json();
    assert.equal((await admin('admission', { revision: 0, orderId: admission.orderId, enabled: true })).status, 200);
    const sqlite = new BetterSqlite3(':memory:');
    sqlite.exec(`CREATE TABLE options (name TEXT PRIMARY KEY, value TEXT NOT NULL, revision TEXT NOT NULL);
      CREATE TABLE _plugin_storage (plugin_id TEXT NOT NULL, collection TEXT NOT NULL, id TEXT NOT NULL, data TEXT NOT NULL, revision TEXT NOT NULL DEFAULT '0', created_at TEXT NOT NULL, updated_at TEXT NOT NULL, PRIMARY KEY(plugin_id,collection,id));
      CREATE TABLE _emdash_cron_tasks (id TEXT PRIMARY KEY, plugin_id TEXT NOT NULL, task_name TEXT NOT NULL, schedule TEXT NOT NULL, is_oneshot INTEGER NOT NULL DEFAULT 0, data TEXT, next_run_at TEXT NOT NULL, last_run_at TEXT, status TEXT NOT NULL DEFAULT 'idle', locked_at TEXT, enabled INTEGER NOT NULL DEFAULT 1, created_at TEXT, UNIQUE(plugin_id, task_name));`);
    db = new Kysely({ dialect: new SqliteDialect({ database: sqlite }) });
    const manifest = JSON.parse(readFileSync(new URL('../../dist/backroadbum/dist/sandbox/manifest.json', import.meta.url))); manifest.id = ID;
    assert.deepEqual(manifest.allowedHosts, ['backroadbum.com']);
    const collections = Object.fromEntries(Object.entries(manifest.storage).map(([name, spec]) => [name, new PluginStorageRepository(db, ID, name, [...spec.indexes, ...(spec.uniqueIndexes ?? [])])]));
    const settings = createSettingsAccess(new OptionsRepository(db), ID, manifest.admin.settingsSchema);
    await settings.set('connection', JSON.stringify({ siteId: config.siteId, storeKey: config.storeKey }));
    await settings.set('installedCheckout', JSON.stringify(merchantCheckoutSettings(config)));
    const receiver = createPaidOrderReceiver(collections.orders, collections.order_numbers);
    const paid = (id, paidAt = new Date().toISOString()) => ({ schema: 'dinkuskit.commerce.paid-order/v1', orderId: id, receiptId: 'receipt-' + id, attemptId: 'attempt-' + id,
      paymentId: 'pi_synthetic', paidAt, mode: 'test', lines: [{ catalogItemId: 'hat', name: 'Fixture hat', quantity: 1, unitPrice: { currency: 'USD', minor: '2400' } }], total: { currency: 'USD', minor: '2400' },
      contactSnapshot: { schema: 'dinkuskit.commerce.checkout-contact/v1', revision: null, requirePhoneNumber: false, contact: { email: 'fixture@example.test', delivery: { name: 'Fixture', line1: '1 Example Way', city: 'Example', region: 'CA', postalCode: '90000', country: 'US' } } } });
    const canonical = paid(admission.orderId); await receiver.receive(canonical); await receiver.receive(paid('synthetic-history', '2026-01-01T00:00:00.000Z'));
    runner = new WorkerdSandboxRunner({ db, siteInfo: { name: 'Synthetic merchant', url: ORIGIN, locale: 'en' }, limits: { wallTimeMs: 25000 },
      httpFetch: async (url, init) => {
        assert.equal(new URL(url).origin, ORIGIN);
        const request = new Request(url, init);
        if (new URL(url).pathname.startsWith('/api/ship/')) {
          machine.push({ path: new URL(url).pathname, method: init.method, body: init.body ? JSON.parse(await request.clone().text()) : null });
          return ship.fetch(new URL(url).pathname.slice('/api/ship'.length), { method: request.method, headers: request.headers, ...(request.method === 'GET' ? {} : { body: await request.arrayBuffer() }) });
        }
        return issuer.fetch(request);
      } });
    const backend = readFileSync(new URL('../../dist/backroadbum/dist/sandbox/plugin.mjs', import.meta.url), 'utf8');
    const plugin = await runner.load(manifest, backend);
    const cron = () => plugin.invokeHook('cron', { name: 'commerce-checkout-wakes' });
    await cron();
    assert.equal(machine.filter(c => c.path.endsWith('/orders')).length, 1);
    assert.equal(machine.find(c => c.path.endsWith('/orders')).body.orderId, admission.orderId);
    assert.equal(machine.find(c => c.path.endsWith('/orders')).body.email, null);
    assert.equal((await collections.orders.get('synthetic-history')).shipVersion, undefined);
    assert.equal((await collections.orders.get(admission.orderId)).shipVersion, 1);
    const view = JSON.stringify(await plugin.invokeRoute('admin', { type: 'block_action', action_id: 'orders.open:' + admission.orderId }, {
      url: ORIGIN + '/_emdash/api/plugins/' + ID + '/admin', method: 'POST', user: { id: 'fixture', role: 50 }, ui: { surface: 'admin-page' } }));
    assert.match(view, /Open practice shipping/); assert.match(view, /r_ehdlg5cxkb3ffqvr\/shipping/); assert.doesNotMatch(view, /\/stores\//);
    const created = await admin('practice-label', { action: 'create', revision: 1, orderId: admission.orderId, version: 1, boxId: packing.boxes[0].boxId, weightOz: 9, by: 'synthetic-merchant' });
    assert.equal(created.status, 201); const label = await created.json(); assert.equal(label.practice, true);
    const before = machine.length; admission = control.change({ revision: 1, orderId: admission.orderId, enabled: false }); await cron();
    assert.equal(machine.length, before); assert.equal((await collections.orders.get(admission.orderId)).revision, 1);
    admission = control.change({ revision: 2, orderId: admission.orderId, enabled: true }); await cron();
    const complete = await collections.orders.get(admission.orderId);
    assert.deepEqual([complete.revision, complete.completed.carrier, complete.completed.tracking, complete.shipVersion], [2, 'USPS', label.tracking, 2]);
    assert.deepEqual(complete.paidOrder, canonical);
    assert.equal(machine.filter(c => c.path.endsWith('/ack')).length, 1);
    assert.deepEqual(machine.filter(c => c.path.endsWith('/orders')).map(c => [c.body.orderId, c.body.version]), [[admission.orderId, 1], [admission.orderId, 2]]);
    assert.equal((await (await admin('orders')).json()).orders.length, 1);
    assert.equal(ship.network().refusedFetches, 0);
  } finally { await runner?.terminateAll(); await db?.destroy(); await ship.dispose(); admissionDb.close(); globalThis.fetch = originalFetch; }
});
