import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { shop } from '../../tests/features/catalog/catalog-store.mjs';

// Deliberately outside npm test's globs: these assert the stronger atomic
// guarantee previously implied by reference/help, NOT current behavior.
// The base CLI spec already acknowledged a race window. See FINDING.md.
const previewCode = value => createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 12);
const NEWER = {
  prices: { regular: '99.00', sale: '' }, weight: { weightOz: '99' }, feeds: { channels: ['google-merchant'] },
  identifiers: { brand: 'Newer brand' }, sku: { sku: 'NEWER-SKU' }, archive: { archived: true },
};
const STALE = {
  prices: { regular: '14.00', sale: '' }, weight: { weightOz: '14' }, feeds: { channels: ['meta-catalog'] },
  identifiers: { brand: 'Stale brand' }, sku: { sku: 'STALE-SKU' }, archive: { archived: false },
};

async function fixture() {
  const { ctx, call } = shop();
  const { catalogItemId } = await call({ op: 'create', commandId: 'fixture', name: 'Fixture', sku: 'FIXTURE' });
  await call({ op: 'prices', catalogItemId, regular: '12.00', sale: '' });
  const expected = previewCode(await call({ op: 'get', catalogItemId }));
  return { ctx, call, catalogItemId, expected };
}

async function refuses(work) {
  try {
    return (await work()).saved === false;
  } catch (error) {
    assert.equal(error.code, 'COMMAND_CONFLICT');
    return true;
  }
}

for (const op of Object.keys(NEWER)) {
  test(`a preview-bound ${op} write refuses an edit after the hash check`, async t => {
    const { ctx, call, catalogItemId, expected } = await fixture();
    const c = ctx.storage.catalog_items, getVersioned = c.getVersioned.bind(c), get = c.get.bind(c);
    let reads = 0, winner;
    c.getVersioned = async id => {
      // First root read: the route's preview validation. Second root read:
      // the mutation, after validation completed. Run the competing writer
      // before allowing that second read to observe the new revision.
      if (id === catalogItemId && ++reads === 2) {
        await call({ op, catalogItemId, ...NEWER[op] });
        winner = await get(catalogItemId);
      }
      return getVersioned(id);
    };
    const refused = await refuses(() => call({ op, catalogItemId, expected, ...STALE[op] }));
    assert.ok(winner, 'the competing write must commit after preview validation');
    const after = await get(catalogItemId);
    t.diagnostic(JSON.stringify({ op, refused, winnerPreserved: JSON.stringify(after) === JSON.stringify(winner) }));
    assert.equal(refused, true, 'DEFECT: a matching hash authorized overwriting a later revision');
    assert.deepEqual(after, winner, 'a refused request must preserve the newer edit');
  });
}

test('a preview-bound media write preserves a later image edit', async t => {
  const { ctx, call, catalogItemId, expected } = await fixture();
  const media = ctx.storage.catalog_media, get = media.get.bind(media);
  let reads = 0, winner;
  media.get = async id => {
    if (id === catalogItemId && ++reads === 2) {
      await call({ op: 'media', catalogItemId, image: 'newer-image' });
      winner = await get(catalogItemId);
    }
    return get(id);
  };
  const refused = await refuses(() => call({ op: 'media', catalogItemId, image: 'stale-image', expected }));
  assert.ok(winner, 'the competing image edit must commit after preview validation');
  const after = await get(catalogItemId);
  t.diagnostic(JSON.stringify({ op: 'media', refused, winner: winner.image.mediaId, after: after.image.mediaId }));
  assert.equal(refused, true, 'DEFECT: the preview hash is not bound to the media write');
  assert.deepEqual(after, winner);
});

for (const op of ['prices', 'identifiers']) {
  test(`a preview-bound ${op} write refuses a race at compare-and-set`, async t => {
    const { ctx, call, catalogItemId, expected } = await fixture();
    const c = ctx.storage.catalog_items, cas = c.compareAndSet.bind(c), get = c.get.bind(c);
    let pending = true, winner;
    c.compareAndSet = async (...args) => {
      if (args[0] === catalogItemId && pending) {
        pending = false;
        await call({ op, catalogItemId, ...NEWER[op] });
        winner = await get(catalogItemId);
      }
      return cas(...args);
    };
    const refused = await refuses(() => call({ op, catalogItemId, expected, ...STALE[op] }));
    assert.ok(winner, 'the competing write must commit before the original CAS');
    const after = await get(catalogItemId);
    t.diagnostic(JSON.stringify({ phase: 'CAS', op, refused, winnerPreserved: JSON.stringify(after) === JSON.stringify(winner) }));
    assert.equal(refused, true, 'DEFECT: retrying a failed CAS rebased a preview-bound edit');
    assert.deepEqual(after, winner);
  });
}

test('control: an edit before the hash check is refused without touching the winner', async () => {
  const { ctx, call, catalogItemId, expected } = await fixture();
  await call({ op: 'prices', catalogItemId, ...NEWER.prices });
  const winner = await ctx.storage.catalog_items.get(catalogItemId);
  assert.equal(await refuses(() => call({ op: 'prices', catalogItemId, expected, ...STALE.prices })), true);
  assert.deepEqual(await ctx.storage.catalog_items.get(catalogItemId), winner);
});
