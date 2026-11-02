import assert from 'node:assert/strict';
import test from 'node:test';
import { buildGoogleMerchantFeed, buildMetaCatalogFeed } from '../../../dist/features/feeds/index.js';
import sandbox from '../../../dist/sandbox/plugin.mjs';

// The Registry build's storage collections, by their snake_case names.
const collections = [
  'catalog_items', 'catalog_prices', 'catalog_manual_availability', 'catalog_backorder_policies',
  'store_inventory_configurations', 'storefront_availability_settings', 'storefront_out_of_stock_listing',
  'catalog_media', 'storefront_placeholder_image', 'product_feed_eligibility', 'product_pages',
];

function fixture({ declared = true } = {}) {
  const products = new Map(['eligible', 'opted-out', 'unset'].map((id) => [id, {
    recordKind: 'catalog-item', itemId: id, name: id, sku: id.toUpperCase(),
    stockManagement: { mode: 'unmanaged' },
    commandId: 'internal-command', weightOz: 12,
  }]));
  const records = new Map([
    ['eligible', { recordKind: 'product-feed-eligibility', recordId: 'eligible', catalogItemId: 'eligible', channels: ['meta-catalog', 'google-merchant', 'google-merchant'], privateNote: 'not public' }],
    ['opted-out', { recordKind: 'product-feed-eligibility', recordId: 'opted-out', catalogItemId: 'opted-out', channels: [] }],
  ]);
  const collection = (rows) => ({
    async get(id) { return structuredClone(rows.get(id) ?? null); },
    async getMany(ids) { return new Map(ids.filter((id) => rows.has(id)).map((id) => [id, structuredClone(rows.get(id))])); },
    async query() { return { items: [...rows].map(([id, data]) => ({ id, data: structuredClone(data) })), hasMore: false }; },
    async put() { assert.fail('public catalog must not write storage'); },
  });
  const storage = Object.fromEntries(collections.map((name) => [name, collection(new Map())]));
  storage.catalog_items = collection(products);
  storage.catalog_prices = collection(new Map([...products.keys()].map((id) => [id, {
    recordKind: 'catalog-price', recordId: id, catalogItemId: id,
    regular: { currency: 'USD', minor: '1250' },
  }])));
  storage.product_feed_eligibility = collection(records);
  storage.product_pages = collection(new Map(['eligible', 'unset'].map((id) => ['p:page-' + id, { entryId: 'page-' + id, catalogItemId: id }])));
  if (!declared) delete storage.product_feed_eligibility;
  return {
    records, products,
    context(path) {
      return {
        storage,
        site: { url: 'https://shop.example.test' },
        request: new Request(`https://shop.example.test/${path}`),
      };
    },
  };
}

{
  const surface = 'Registry build';
  const list = sandbox.routes['catalog/public'];
  const item = sandbox.routes['catalog/public/item'];
  const invoke = (route, context) => route.handler({ request: context.request }, context);

  test(`${surface}: anonymous list and item expose only approved feed channels`, async () => {
    for (const route of [list, item]) {
      assert.equal(route.public, true);
      assert.equal(route.permission, undefined);
      assert.deepEqual(route.methods, ['GET']);
      assert.equal(route.cacheControl, 'no-store');
    }
    const f = fixture();
    const response = await invoke(list, f.context('catalog/public'));
    assert.deepEqual(response.products.map((product) => [product.id, product.feedChannels]), [
      ['eligible', ['google-merchant', 'meta-catalog']],
      ['opted-out', []],
      ['unset', []],
    ]);
    for (const product of response.products) {
      assert.deepEqual(Object.keys(product).sort(), ['availability', 'feedChannels', 'gallery', 'id', 'image', 'name', 'price', 'sku']);
      assert.deepEqual(await invoke(item, f.context(`catalog/public/item?itemId=${product.id}`)), product);
    }
    const facts = response.products.map((product) => ({
      product, eligibility: product.feedChannels ?? [],
      content: { canonicalUrl: `https://shop.example.test/products/${product.id}`, title: product.name },
    }));
    assert.match(buildGoogleMerchantFeed(facts), /<g:id>eligible<\/g:id>/);
    assert.doesNotMatch(buildGoogleMerchantFeed(facts), /<g:id>(opted-out|unset)<\/g:id>/);
    assert.match(buildMetaCatalogFeed(facts), /"eligible","eligible"/);
    assert.doesNotMatch(buildMetaCatalogFeed(facts), /"(opted-out|unset)","(opted-out|unset)"/);
    f.records.get('eligible').channels = [];
    assert.deepEqual((await invoke(item, f.context('catalog/public/item?itemId=eligible'))).feedChannels, []);
    assert.deepEqual((await invoke(list, f.context('catalog/public'))).products[0].feedChannels, []);
  });

  test(`${surface}: the item route finds a product by the page that sells it`, async () => {
    const f = fixture();
    f.products.get('eligible').pageId = 'page-eligible';
    const listed = (await invoke(list, f.context('catalog/public'))).products;
    assert.deepEqual(listed.map((product) => product.page), ['page-eligible', undefined, undefined]);
    assert.deepEqual(await invoke(item, f.context('catalog/public/item?pageId=page-eligible')), listed[0]);
    assert.equal(await invoke(item, f.context('catalog/public/item?pageId=page-unset')), null, 'a product that names another page');
    assert.equal(await invoke(item, f.context('catalog/public/item?pageId=page-none')), null);
    for (const query of ['pageId=page-eligible&itemId=eligible', 'pageId=a&pageId=b', 'pageId=']) {
      await assert.rejects(() => invoke(item, f.context(`catalog/public/item?${query}`)), /Invalid catalog item query|Catalog unavailable/);
    }
  });

  test(`${surface}: older adapters without eligibility storage never opt in`, async () => {
    const f = fixture({ declared: false });
    const response = await invoke(list, f.context('catalog/public'));
    assert.ok(response.products.every((product) => !('feedChannels' in product)));
    assert.equal('feedChannels' in await invoke(item, f.context('catalog/public/item?itemId=eligible')), false);
  });

  test(`${surface}: unsupported stored channel cannot escape on list or item`, async () => {
    const f = fixture();
    f.records.get('eligible').channels = ['unapproved-channel'];
    await assert.rejects(() => invoke(list, f.context('catalog/public')), /unsupported product feed channel/);
    await assert.rejects(() => invoke(item, f.context('catalog/public/item?itemId=eligible')), /unsupported product feed channel/);
  });
}
