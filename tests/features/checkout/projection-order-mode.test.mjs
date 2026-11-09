import assert from 'node:assert/strict';
import test from 'node:test';
import { projectGuestCheckout } from '@dinkuskit/commerce/features/checkout';

test('paid guest receipts preserve canonical test mode, including legacy orders', () => {
  for (const mode of [undefined, 'test', 'live']) {
    const total = { currency: 'USD', minor: '2200' };
    const attempt = { attemptId: 'attempt', phase: 'paid', payment: { lines: [], total },
      order: { orderId: 'order', receiptId: 'receipt', total, ...(mode ? { mode } : {}) } };
    const projection = projectGuestCheckout(attempt);
    assert.equal(projection.state, 'paid');
    assert.equal(projection.order.test, mode !== 'live');
    assert.equal(projection.order.mode, undefined);
    assert.equal(projectGuestCheckout({ ...attempt, phase: 'paying' }).order, null);
  }
});
