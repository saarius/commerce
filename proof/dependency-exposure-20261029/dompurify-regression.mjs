// Explicit browser proof, not part of npm test's browser-free unit globs.
// Benign adaptations of the public advisories linked in REPORT.md: no evaluator,
// dialogs, external requests, malicious media, or real application data are used.
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { chromium } from '@playwright/test';

// Resolve from the actual EmDash admin importer, not an assumed hoisted copy.
const adminRequire = createRequire(import.meta.resolve('@emdash-cms/admin'));
const browserScript = join(dirname(adminRequire.resolve('dompurify')), 'purify.js');
let browser;
before(async () => { browser = await chromium.launch({ headless: true }); });
after(async () => { await browser?.close(); });

async function pageFor(t) {
  const page = await browser.newPage();
  t.after(() => page.close());
  await page.route('**/*', route => route.abort());
  await page.addScriptTag({ path: browserScript });
  return page;
}

test('SAFE_FOR_TEMPLATES scrubs expressions merged inside an attached shadow root', async t => {
  const page = await pageFor(t);
  const result = await page.evaluate(() => {
    const host = document.createElement('div');
    const root = host.attachShadow({ mode: 'open' });
    root.append(document.createTextNode('$'), document.createElement('object'), document.createTextNode('{6*7}'));
    DOMPurify.sanitize(host, { IN_PLACE: true, SAFE_FOR_TEMPLATES: true });
    root.normalize();
    return { version: DOMPurify.version, text: root.textContent };
  });
  t.diagnostic(`DOMPurify ${result.version}; Chromium ${browser.version()}`);
  assert.equal(result.text.includes('${6*7}'), false, 'never evaluate this diagnostic expression');
});

for (const detach of ['parent', 'nextSibling', 'self']) {
  test(`IN_PLACE neutralizes retained references when a hook detaches ${detach}`, async t => {
    const page = await pageFor(t);
    const handler = await page.evaluate(mode => {
      const root = document.createElement('div');
      root.innerHTML = '<figure><img class="marker"><img id="later" onerror="void 0"></figure><p>safe</p>';
      const later = root.querySelector('#later');
      DOMPurify.addHook('afterSanitizeAttributes', node => {
        if (node.getAttribute?.('class') !== 'marker') return;
        if (mode === 'parent') node.parentNode.remove();
        else if (mode === 'nextSibling') node.nextElementSibling.remove();
        else node.remove();
      });
      DOMPurify.sanitize(root, { IN_PLACE: true });
      return later.getAttribute('onerror');
    }, detach);
    assert.equal(handler, null);
  });
}

test('XHTML mode removes an explicitly allowed SMIL href rewrite attribute', async t => {
  const page = await pageFor(t);
  const attribute = await page.evaluate(() => {
    const clean = DOMPurify.sanitize(
      '<svg xmlns="http://www.w3.org/2000/svg"><a><animate attributeName="href" values="x;javascript:void(0)"/></a></svg>',
      { PARSER_MEDIA_TYPE: 'application/xhtml+xml', ALLOWED_TAGS: ['svg', 'a', 'animate'], ALLOWED_ATTR: ['attributeName', 'values'] },
    );
    // Inspect only; never insert the SVG into the live document or activate it.
    const parsed = new DOMParser().parseFromString(clean, 'application/xhtml+xml');
    if (parsed.querySelector('parsererror')) throw new Error('sanitized XHTML must parse');
    return parsed.querySelector('animate')?.getAttribute('attributeName') ?? null;
  });
  assert.equal(attribute, null);
});

test('ordinary HTML-string allowlist sanitization preserves safe markup and removes active content', async t => {
  const page = await pageFor(t);
  const result = await page.evaluate(() => DOMPurify.sanitize(
    '<p>Safe <strong>text</strong> <a href="https://example.test/">link</a><img onerror="void 0"><script>void 0</script></p>',
    { ALLOWED_TAGS: ['p', 'strong', 'a'], ALLOWED_ATTR: ['href'] },
  ));
  assert.equal(typeof result, 'string');
  assert.equal(result, '<p>Safe <strong>text</strong> <a href="https://example.test/">link</a></p>');
});
