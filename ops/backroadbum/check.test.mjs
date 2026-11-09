import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { connectState, refreshCheckoutSettings, storeKey } from '../../.tmp/backroadbum-profile/dist/features/checkout/registry-connect.js';
import { tradeStoreKey } from '../../.tmp/backroadbum-profile/dist/features/checkout/registry-credential.js';
const origin = 'https://backroadbum.com';
const config = { schema: 'dinkuskit.commerce.registry-checkout/v1', enabled: true, commerceOrigin: origin,
  siteId: 'backroadbum', paymentsOrigin: origin, issuer: origin, audience: 'backroadbum-payments', mode: 'test',
  providerId: 'stripe', stripeAccountId: 'acct_fixture', bindingRef: 'test_binding', pricingSchema: 'dinkuskit.commerce.checkout-pricing/v1',
  shipping: { configurationId: 'free_fixture', revision: 1, mode: 'free' } };
const token = (audience, scope) => {
  const part = value => Buffer.from(JSON.stringify(value)).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  return `${part({ alg: 'ES256' })}.${part({ iss: origin, sub: 'fixture', aud: audience, scope, site_id: 'backroadbum', iat: now, exp: now + 300 })}.fixture`;
};
function fixture(overrides = {}) {
  const values = new Map([['connection', { value: JSON.stringify({ siteId: 'backroadbum', storeKey: `dk_store_${'a'.repeat(43)}` }), revision: '1' }]]);
  const calls = [];
  const ctx = { site: { url: origin }, plugin: { id: 'r_gshdrqaldna3r7sn' }, settings: {
    getVersioned: async key => values.get(key) ?? null,
    compareAndSet: async (key, revision, value) => { assert.equal(revision, values.get(key)?.revision ?? null); values.set(key, { value, revision: '2' }); return { applied: true }; },
  }, http: { fetch: async (url, init) => {
    calls.push(url); assert.equal(new URL(url).origin, origin); assert.equal(init.redirect, 'error');
    if (url.endsWith('/api/store-passes')) return Response.json({ access_token: token('backroadbum-commerce', 'commerce:settings') });
    assert.equal(init.headers['x-dinkus-site'], 'backroadbum');
    return Response.json({ ...config, ...overrides });
  } } };
  return { ctx, values, calls };
}
test('merchant build changes only its staged trust profile', () => {
  assert.match(readFileSync(new URL('../../src/features/checkout/registry-credential.ts', import.meta.url), 'utf8'), /https:\/\/dinkuskit.com\/api\/store-passes/);
  const manifest = JSON.parse(readFileSync(new URL('../../dist/backroadbum/dist/sandbox/manifest.json', import.meta.url)));
  assert.deepEqual(manifest.allowedHosts, ['backroadbum.com']);
});
test('merchant adapter reads the existing encrypted setting only for its exact store and runtime', async () => {
  const f = fixture(); assert.equal((await storeKey(f.ctx)).siteId, 'backroadbum');
  assert.equal((await connectState(f.ctx)).state, 'connected');
  for (const ctx of [{ ...f.ctx, site: { url: 'https://other.invalid' } }, { ...f.ctx, plugin: { id: 'dinkus-commerce' } }]) assert.equal(await storeKey(ctx), null);
});
test('merchant pass trade has a single fixed destination, never a settings-selected issuer', async () => {
  const pass = token(config.audience, 'payments:checkout');
  assert.equal(await tradeStoreKey('synthetic-key', config, async (url, init) => {
    assert.equal(url, origin + '/api/store-passes'); assert.equal(init.redirect, 'error'); return Response.json({ access_token: pass });
  }, 'payments:checkout', config.audience), pass);
});
test('settings refresh validates TEST identity and saves through versioned CAS', async () => {
  const f = fixture(); assert.equal(await refreshCheckoutSettings(f.ctx), null);
  assert.deepEqual(JSON.parse(f.values.get('installedCheckout').value), config);
  assert.deepEqual(f.calls, [origin + '/api/store-passes', origin + '/api/commerce-settings']);
});
test('wrong origin, issuer, mode and service profiles never replace saved settings', async () => {
  for (const overrides of [{ commerceOrigin: 'https://other.invalid' }, { issuer: 'https://other.invalid' }, { paymentsOrigin: 'https://other.invalid' }, { mode: 'live' }, { siteId: 'other' }, { audience: 'other' }]) {
    const f = fixture(overrides); assert.equal(await refreshCheckoutSettings(f.ctx), 'unavailable'); assert.equal(f.values.has('installedCheckout'), false);
  }
});
