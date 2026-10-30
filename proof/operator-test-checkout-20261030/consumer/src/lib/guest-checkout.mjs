// Independent consumer of the published Commerce guest HTTP contract.
// No provider credentials, fallback provider, client prices or automatic retries.
export const READINESS_SCHEMA = 'dinkuskit.commerce.checkout-readiness/v1';
const PROJECTION_SCHEMA = 'dinkuskit.commerce.guest-checkout-projection/v1';
const capabilityPattern = /^[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/;

export function isTestReadiness(value) {
  return value?.schema === READINESS_SCHEMA && value.status === 'supported' && value.mode === 'test';
}
export function stripeTestRedirect(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'checkout.stripe.com' && !url.port && !url.username && !url.password && /^\/(?:c\/)?pay\/cs_test_[A-Za-z0-9_]+(?:\/|$)/.test(url.pathname) ? url.href : null;
  } catch { return null; }
}
export function createGuestCheckout({ pluginId, fetch: transport = globalThis.fetch, storage }) {
  if (!/^r_[a-z2-7]+$/.test(pluginId)) throw new Error('Invalid installed Registry identity');
  const base = '/_emdash/api/plugins/' + encodeURIComponent(pluginId) + '/checkout/guest/';
  const key = 'saarius.guest-checkout.v1.' + pluginId;
  let capability, phase = 'empty', checkout = null, busy = false;
  if (!storage?.getItem || !storage?.setItem) throw new Error('Tab storage is required for checkout recovery.');
  try {
    const stored = storage?.getItem(key);
    if (stored) {
      const record = JSON.parse(stored);
      if (!capabilityPattern.test(record.capability) || typeof record.requested !== 'boolean') throw new Error();
      capability = record.capability;
      // Reload never authorizes a second start, even if the first result was lost.
      phase = record.requested ? 'unknown' : 'prepared';
    }
  } catch { phase = 'blocked'; }
  const save = requested => storage?.setItem(key, JSON.stringify({ capability, requested }));
  async function request(path, input) {
    const response = await transport(base + path, {
      method: input === undefined ? 'GET' : 'POST', credentials: 'same-origin', cache: 'no-store', redirect: 'error',
      headers: { ...(input === undefined ? {} : { 'content-type': 'application/json' }), ...(capability && input !== undefined ? { 'x-commerce-guest-capability': capability } : {}) },
      ...(input === undefined ? {} : { body: JSON.stringify(input) }), signal: AbortSignal.timeout(30000),
    });
    const body = await response.json();
    if (!response.ok || body.success !== true || !body.data) throw new Error('Commerce could not confirm the request.');
    return body.data;
  }
  async function locked(operation) {
    if (busy) throw new Error('A checkout request is already in progress.');
    busy = true;
    try { return await operation(); } finally { busy = false; }
  }
  function projection(value) {
    const p = value?.checkout;
    const money = m => m === null || (m?.currency === 'USD' && typeof m.minor === 'string' && /^(0|[1-9][0-9]{0,19})$/.test(m.minor));
    const id = value => typeof value === 'string' && value.length > 0 && value.length <= 256;
    const paid = p?.state === 'paid';
    if (value?.ok !== true || p?.schema !== PROJECTION_SCHEMA || !['pending', 'paid', 'released-retry', 'recoverable-failure'].includes(p.state) ||
        !Array.isArray(p.lines) || !money(p.total) || !(p.attemptId === null || id(p.attemptId)) ||
        !(p.redirectUrl === null || typeof p.redirectUrl === 'string') ||
        (paid ? (!id(p.order?.orderId) || !id(p.order?.receiptId) || p.order.total === null || !money(p.order.total) || !p.total || p.order.total.minor !== p.total.minor) : p.order !== null)) {
      throw new Error('Commerce could not confirm the checkout. Check its status before doing anything else.');
    }
    checkout = p;
    return checkout;
  }
  return {
    snapshot: () => ({ phase, checkout, busy }),
    readiness: () => request('readiness'),
    prepare: () => locked(async () => {
      if (phase !== 'empty') throw new Error('A checkout is already retained. Check its status instead.');
      if (!isTestReadiness(await request('readiness'))) return false;
      phase = 'blocked'; // No implicit repeat when prepare's transport result is unknown.
      const value = await request('prepare', {});
      if (value.ok !== true || !capabilityPattern.test(value.capability) || typeof value.contactRequirements?.requirePhoneNumber !== 'boolean') throw new Error('Checkout preparation could not be confirmed.');
      capability = value.capability;
      save(false); // Storage failure blocks start; do not lose recovery information.
      phase = 'prepared';
      return { requirePhoneNumber: value.contactRequirements.requirePhoneNumber };
    }),
    start: (lines, contact) => locked(async () => {
      if (phase !== 'prepared') throw new Error('Do not submit again. Check the retained checkout status.');
      if (!isTestReadiness(await request('readiness'))) return false;
      // Persist unknown outcome BEFORE fetch dispatch. No start retry, even on timeout.
      save(true); phase = 'unknown';
      return projection(await request('start', { lines: lines.map(({ catalogItemId, quantity }) => ({ catalogItemId, quantity })), contact }));
    }),
    check: () => locked(async () => {
      if (!capability) throw new Error('No recoverable checkout is retained in this tab.');
      return projection(await request('status', {}));
    }),
  };
}
