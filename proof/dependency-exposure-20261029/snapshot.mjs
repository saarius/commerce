// Read-only, public-safe installed-resolution evidence; emits no environment or credentials.
// Run from the repository root after npm ci and build. This is not a security gate.
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve('.');
const lock = JSON.parse(readFileSync('package-lock.json', 'utf8'));
const manifest = JSON.parse(readFileSync('package.json', 'utf8'));
const hash = path => createHash('sha256').update(readFileSync(path)).digest('hex');
function packageAt(entry) {
  let directory = dirname(entry);
  while (directory !== dirname(directory)) {
    try {
      const file = join(directory, 'package.json');
      const value = JSON.parse(readFileSync(file, 'utf8'));
      if (value.name && value.version) return { directory, value };
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    directory = dirname(directory);
  }
  throw new Error('resolved entry has no package manifest');
}
function sharpFrom(importer) {
  const require = createRequire(importer);
  const entry = require.resolve('sharp');
  const sharp = require('sharp');
  return { path: relative(root, entry), versions: { sharp: sharp.versions.sharp, vips: sharp.versions.vips, heif: sharp.versions.heif } };
}
const adminEntry = import.meta.resolve('@emdash-cms/admin');
const admin = packageAt(fileURLToPath(adminEntry));
const adminRequire = createRequire(adminEntry);
const purifyEntry = adminRequire.resolve('dompurify');
const purify = packageAt(purifyEntry);
const sdkEntry = import.meta.resolve('@emdash-cms/sandbox-workerd');
const sdkMiniflare = createRequire(sdkEntry).resolve('miniflare');
const wranglerMiniflare = createRequire(import.meta.resolve('wrangler')).resolve('miniflare');
console.log(JSON.stringify({
  node: process.version,
  platform: process.platform,
  architecture: process.arch,
  manifestSha256: hash('package.json'),
  lockSha256: hash('package-lock.json'),
  backend: { bytes: readFileSync('dist/sandbox/plugin.mjs').length, sha256: hash('dist/sandbox/plugin.mjs') },
  emdashPeer: manifest.peerDependencies.emdash,
  emdashIntegrity: lock.packages['node_modules/emdash'].integrity,
  admin: { version: admin.value.version, sha256: hash(new URL(adminEntry)) },
  dompurify: {
    version: purify.value.version,
    declaredRange: admin.value.dependencies.dompurify,
    path: relative(root, purifyEntry),
    browserAssetSha256: hash(join(purify.directory, 'dist/purify.js')),
  },
  astro: { version: lock.packages['node_modules/astro'].version, sharp: sharpFrom(import.meta.resolve('astro')) },
  sdkMiniflare: { version: packageAt(sdkMiniflare).value.version, sharp: sharpFrom(sdkMiniflare) },
  wranglerMiniflare: { version: packageAt(wranglerMiniflare).value.version, sharp: sharpFrom(wranglerMiniflare) },
}, null, 2));
