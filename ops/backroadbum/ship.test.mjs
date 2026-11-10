import assert from 'node:assert/strict';
import test from 'node:test';
import { syncMerchantShip, merchantShipLabelPage } from '../../.tmp/backroadbum-profile/dist/admin/merchant-ship.js';
import { ordersView } from '../../.tmp/backroadbum-profile/dist/features/orders/index.js';
const ORIGIN = 'https://backroadbum.com';
const config = { schema: 'dinkuskit.commerce.registry-checkout/v1', enabled: true, commerceOrigin: ORIGIN, siteId: 'backroadbum',
  paymentsOrigin: ORIGIN, issuer: ORIGIN, audience: 'backroadbum-payments', mode: 'test', providerId: 'stripe', stripeAccountId: 'acct_fixture',
  bindingRef: 'fixture', pricingSchema: 'dinkuskit.commerce.checkout-pricing/v1', shipping: { configurationId: 'fixture', revision: 1, mode: 'free' } };
const initial = { schema: 'backroadbum.commerce-ship/v1', generation: 'synthetic', revision: 1, orderId: 'fresh-order', enabled: true, notBefore: '2026-11-10T00:00:00.000Z' };
const usd = minor => ({ currency: 'USD', minor });
const record = (orderId = 'fresh-order', patch = {}) => ({ revision: 1, number: 1001, paidOrder: { schema: 'dinkuskit.commerce.paid-order/v1', orderId,
  receiptId: 'receipt-' + orderId, attemptId: 'attempt-' + orderId, paymentId: 'pi_fixture', mode: 'test', paidAt: '2026-11-10T01:00:00.000Z',
  total: usd('2400'), lines: [{ catalogItemId: 'hat', name: 'Demo hat', quantity: 1, unitPrice: usd('2400') }],
  contactSnapshot: { schema: 'dinkuskit.commerce.checkout-contact/v1', requirePhoneNumber: false, revision: null,
    contact: { email: 'fixture@example.test', delivery: { name: 'Fixture', line1: '1 Example Way', city: 'Example', region: 'CA', postalCode: '90000', country: 'US' } } }, ...patch } });
const label = { eventId: 'lbl_fixture', orderId: 'fresh-order', version: 1, carrier: 'USPS', tracking: 'TEST123456789012345678' };
const token = (scope, audience) => { const now = Math.floor(Date.now() / 1000), b64 = v => Buffer.from(JSON.stringify(v)).toString('base64url');
  return [b64({ alg: 'ES256' }), b64({ iss: ORIGIN, aud: audience, sub: 'fixture', site_id: 'backroadbum', scope, iat: now, exp: now + 300 }), 'fixture'].join('.'); };
function fixture({ admission = initial, kept = record(), labels = [] } = {}) {
  const state = { admission: structuredClone(admission), labels: structuredClone(labels), calls: [], reads: [], writes: [], ackStatus: 200, beforeRead: null, afterWrite: null, onTrade: null };
  let sequence = 0;
  const rows = new Map([['fresh-order', { value: structuredClone(kept), revision: 'r1' }], ['historical', { value: record('historical', { paidAt: '2026-11-09T00:00:00.000Z' }), revision: 'r2' }], ['live', { value: record('live', { mode: 'live' }), revision: 'r3' }]]);
  const values = new Map([['connection', { revision: 'key1', value: JSON.stringify({ siteId: 'backroadbum', storeKey: 'dk_store_' + 'k'.repeat(43) }) }], ['installedCheckout', { revision: 'config1', value: JSON.stringify(config) }]]);
  const orders = {
    async get(id) { state.reads.push(id); return structuredClone(rows.get(id)?.value ?? null); },
    async getVersioned(id) { state.reads.push(id); await state.beforeRead?.(); return structuredClone(rows.get(id) ?? null); },
    async compareAndSet(id, revision, value) {
      assert.equal(id, 'fresh-order'); if (rows.get(id)?.revision !== revision) return { applied: false };
      rows.set(id, { value: structuredClone(value), revision: 'w' + ++sequence }); state.writes.push(structuredClone(value));
      await state.afterWrite?.(value); return { applied: true, revision: 'w' + sequence };
    },
    async query() { assert.fail('Historical Orders scan was called'); },
  };
  const ctx = { site: { url: ORIGIN }, plugin: { id: 'r_gshdrqaldna3r7sn' }, settings: { getVersioned: async key => values.get(key) ?? null },
    storage: { orders, catalog_items: { get: async () => null } }, http: { async fetch(url, init) {
      assert.equal(new URL(url).origin, ORIGIN); assert.equal(init.cache, 'no-store'); assert.equal(init.redirect, 'error');
      state.calls.push({ url, init });
      if (url.endsWith('/api/store-passes')) { const body = JSON.parse(init.body); await state.onTrade?.(body); return Response.json({ access_token: token(body.scope, body.audience) }); }
      if (url.endsWith('/api/commerce-ship')) return Response.json(state.admission);
      assert.match(url, /\/api\/ship\/v1\//); assert.equal(init.headers.authorization, 'Bearer ' + token('ship:orders', 'backroadbum-ship'));
      if (url.endsWith('/v1/labels')) return Response.json(state.labels);
      if (url.endsWith('/v1/labels/ack')) {
        if (state.ackStatus !== 200) return new Response('{}', { status: state.ackStatus });
        state.labels = []; return Response.json({ acknowledged: true });
      }
      assert.ok(url.endsWith('/v1/orders')); return Response.json({ accepted: true });
    } } };
  return { ctx, state, rows, values, shipCalls: () => state.calls.filter(c => c.url.includes('/api/ship/')) };
}
test('disabled/unselected admission never touches Orders, Ship or the machine grant', async () => {
  const f = fixture({ admission: { ...initial, revision: 0, orderId: null, enabled: false } }); await syncMerchantShip(f.ctx);
  assert.deepEqual(f.state.reads, []); assert.deepEqual(f.shipCalls(), []);
  assert.equal(f.state.calls.filter(c => c.url.endsWith('/api/store-passes')).length, 1);
});
test('one canonical paid TEST ID is sent without historical queries, shopper email, receipts, payment or totals', async () => {
  const f = fixture(); const paid = structuredClone(f.rows.get('fresh-order').value.paidOrder); await syncMerchantShip(f.ctx);
  assert.ok(f.state.reads.every(id => id === 'fresh-order'));
  const sent = JSON.parse(f.shipCalls().find(c => c.url.endsWith('/v1/orders')).init.body);
  assert.equal(sent.orderId, 'fresh-order'); assert.equal(sent.test, true); assert.equal(sent.email, null);
  assert.doesNotMatch(JSON.stringify(sent), /fixture@example|pi_fixture|receipt-|attempt-|total|paymentId/);
  assert.deepEqual(f.rows.get('fresh-order').value.paidOrder, paid); assert.equal(f.rows.get('fresh-order').value.shipVersion, 1);
  assert.equal(f.rows.get('historical').value.shipVersion, undefined); assert.equal(f.rows.get('live').value.shipVersion, undefined);
});
test('historical, live, absent-mode, zero-payment, retired-pin and malformed canonical selections dispatch no Ship request', async () => {
  for (const kept of [record('fresh-order', { paidAt: '2026-11-09T00:00:00.000Z' }), record('fresh-order', { mode: 'live' }), record('fresh-order', { mode: undefined }),
    record('fresh-order', { paymentId: undefined }), { ...record(), shipPin: {} }, record('fresh-order', { lines: [] }), null]) {
    const f = fixture({ kept }); await assert.rejects(syncMerchantShip(f.ctx)); assert.deepEqual(f.shipCalls(), []); assert.deepEqual(f.state.writes, []);
  }
});
test('only exact current practice events can complete; foreign, live, future/stale, extra-field and oversized lists remain unacknowledged', async () => {
  for (const labels of [[{ ...label, orderId: 'historical' }], [{ ...label, tracking: '9400-live' }], [{ ...label, version: 2 }],
    [{ ...label, carrier: 'Other' }], [{ ...label, mode: 'live' }], [label, label], [null], [{ ...label, version: '1' }]]) {
    const f = fixture({ labels }); await assert.rejects(syncMerchantShip(f.ctx)); assert.deepEqual(f.state.writes, []);
    assert.equal(f.shipCalls().filter(c => c.init.method === 'POST').length, 0);
  }
  const f = fixture({ kept: { ...record(), revision: 2 }, labels: [label] }); await assert.rejects(syncMerchantShip(f.ctx)); assert.deepEqual(f.state.writes, []);
});
test('practice event completes canonically and ACKs only the matching completion; lost ACK replays without another completion', async () => {
  const f = fixture({ labels: [label] }), paid = structuredClone(f.rows.get('fresh-order').value.paidOrder);
  f.state.ackStatus = 503; await assert.rejects(syncMerchantShip(f.ctx));
  const first = structuredClone(f.rows.get('fresh-order').value); assert.equal(first.completed.tracking, label.tracking); assert.equal(first.revision, 2);
  assert.equal(first.shipVersion, undefined); assert.equal(f.state.labels.length, 1);
  f.state.ackStatus = 200; await syncMerchantShip(f.ctx);
  const after = f.rows.get('fresh-order').value; assert.deepEqual(after.completed, first.completed); assert.equal(after.revision, 2); assert.equal(after.shipVersion, 2);
  assert.deepEqual(after.paidOrder, paid); assert.deepEqual(f.state.labels, []);
});
test('disable while reading canonical storage prevents CAS and ACK from a previously picked-up event', async () => {
  const f = fixture({ labels: [label] }); f.state.beforeRead = () => { f.state.admission = { ...initial, revision: 2, enabled: false }; };
  await assert.rejects(syncMerchantShip(f.ctx)); assert.deepEqual(f.state.writes, []);
  assert.equal(f.shipCalls().some(c => c.url.endsWith('/ack')), false); assert.equal(f.state.labels.length, 1);
});
test('disable after a dispatched completion blocks ACK; same-order re-enable recovers it', async () => {
  const f = fixture({ labels: [label] }); f.state.afterWrite = value => { if (value.completed) f.state.admission = { ...initial, revision: 2, enabled: false }; };
  await assert.rejects(syncMerchantShip(f.ctx)); assert.equal(f.rows.get('fresh-order').value.revision, 2); assert.equal(f.state.labels.length, 1);
  assert.equal(f.shipCalls().some(c => c.url.endsWith('/ack')), false);
  f.state.afterWrite = null; f.state.admission = { ...initial, revision: 3 }; await syncMerchantShip(f.ctx); assert.equal(f.state.labels.length, 0);
});
test('connection/config rotation during the pass trade stops dispatch', async () => {
  for (const key of ['connection', 'installedCheckout']) {
    const f = fixture(); f.state.onTrade = body => { if (body.scope === 'ship:orders') f.values.set(key, { ...f.values.get(key), revision: 'rotated' }); };
    await assert.rejects(syncMerchantShip(f.ctx)); assert.deepEqual(f.shipCalls(), []);
  }
});
test('only the eligible Processing order gets the native practice link; no shared hosted link is rendered', async () => {
  const f = fixture(); const url = await merchantShipLabelPage(f.ctx, 'fresh-order'); assert.equal(url, ORIGIN + '/_emdash/admin/plugins/r_ehdlg5cxkb3ffqvr/shipping');
  assert.equal(await merchantShipLabelPage(f.ctx, 'historical'), undefined);
  const view = JSON.stringify(ordersView({ status: 'available', orders: [record()] }, 'fresh-order', url));
  assert.match(view, /Open practice shipping/); assert.doesNotMatch(view, /Create shipping label|\/stores\//);
  f.state.admission.enabled = false; assert.equal(await merchantShipLabelPage(f.ctx, 'fresh-order'), undefined);
});
