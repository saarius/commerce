import test from 'node:test';
import assert from 'node:assert/strict';
import { withGuestOrderFulfillment } from '../../../dist/features/orders/guest-receipt.js';
const money = { currency: 'USD', minor: '2200' };
const order = { orderId: 'order:fixture', receiptId: 'receipt:fixture', test: true,
  lines: [{ catalogItemId: 'mug', name: 'Mug', quantity: 1, unitPrice: money }], total: money };
const result = () => ({ ok: true, capabilityId: 'cap', checkout: { state: 'paid', order: structuredClone(order) } });
const record = () => ({ paidOrder: { ...structuredClone(order), mode: 'test' },
  completed: { at: '2026-11-10T01:00:00.000Z', carrier: 'Demo carrier', tracking: 'TEST-NOT-A-SHIPMENT' },
  emailKey: 'private@example.test', shipPin: 'private', revision: 2 });

test('projects only the authorized paid order and allowlisted completion fields', async () => {
  const input = result();
  const answer = await withGuestOrderFulfillment(input, { get: async id => { assert.equal(id, order.orderId); return record(); } });
  assert.deepEqual(answer.checkout.order.fulfillment, { status: 'completed', completedAt: record().completed.at,
    carrier: 'Demo carrier', tracking: 'TEST-NOT-A-SHIPMENT' });
  assert.equal(JSON.stringify(answer).includes('private'), false);
  assert.equal(input.checkout.order.fulfillment, undefined);
  assert.deepEqual(answer.checkout.order.total, money);
});
test('reopening removes stale tracking on the next read', async () => {
  const reopened = record(); delete reopened.completed;
  const answer = await withGuestOrderFulfillment(result(), { get: async () => reopened });
  assert.deepEqual(answer.checkout.order.fulfillment, { status: 'processing' });
});
test('denied and unpaid results cannot read Orders', async () => {
  for (const input of [{ ok: false, error: { code: 'UNAVAILABLE' } }, { ok: true, checkout: { state: 'pending', order: null } }]) {
    assert.equal(await withGuestOrderFulfillment(input, { get: () => { throw Error('must not read'); } }), input);
  }
});
test('unavailable or mismatched Orders leaves paid evidence intact without inventing processing', async () => {
  const wrong = [null, { ...record(), paidOrder: { ...record().paidOrder, orderId: 'other' } },
    { ...record(), paidOrder: { ...record().paidOrder, receiptId: 'other' } },
    { ...record(), paidOrder: { ...record().paidOrder, mode: 'live' } },
    { ...record(), paidOrder: { ...record().paidOrder, total: { ...money, minor: '1' } } },
    { ...record(), paidOrder: { ...record().paidOrder, lines: [] } },
    ...[null, {}, { at: 'invalid' }, { at: record().completed.at, tracking: 'x'.repeat(65) },
      { at: record().completed.at, carrier: 'bad\ncarrier' }].map(completed => ({ ...record(), completed }))];
  for (const row of wrong) {
    const input = result(); assert.equal(await withGuestOrderFulfillment(input, { get: async () => row }), input);
  }
  const input = result();
  assert.equal(await withGuestOrderFulfillment(input, { get: async () => { throw Error('offline'); } }), input);
  assert.equal(await withGuestOrderFulfillment(input), input);
});
