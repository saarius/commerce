// Builds an explicitly merchant-owned Registry sandbox artifact. Generic sources stay unchanged.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
const root = resolve(import.meta.dirname, '../..');
const pin = '35f80f218776dac5e7954ed3740b201c086a2d20';
const base = execFileSync('git', ['merge-base', 'HEAD', pin], { cwd: root, encoding: 'utf8' }).trim();
if (base !== pin) throw Error('merchant_profile_base_mismatch');
const stage = resolve(root, '.tmp/backroadbum-profile');
rmSync(stage, { recursive: true, force: true });
mkdirSync(stage, { recursive: true });
for (const file of execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean)) {
  if (file.startsWith('ops/backroadbum/')) continue;
  const target = resolve(stage, file); mkdirSync(dirname(target), { recursive: true });
  cpSync(resolve(root, file), target);
}
symlinkSync(resolve(root, 'node_modules'), resolve(stage, 'node_modules'), 'dir');
// Shared dependency installs resolve to their real path; keep the existing audited
// auth transform pointed there, or its exact-path match would silently miss.
const authFile = resolve(stage, 'scripts/coupon-build-transform.mjs');
const authSource = readFileSync(authFile, 'utf8');
const authPath = 'authRoot: `${root}/node_modules/@emdash-cms/auth`';
if (authSource.split(authPath).length !== 2) throw Error('merchant_auth_transform_source_changed');
writeFileSync(authFile, 'import { realpathSync } from "node:fs";\n' + authSource.replace(authPath, 'authRoot: realpathSync(`${root}/node_modules/@emdash-cms/auth`)'));
const credentialFile = resolve(stage, 'src/features/checkout/registry-credential.ts');
const original = readFileSync(credentialFile, 'utf8');
const expected = '"https://dinkuskit.com/api/store-passes"';
if (original.split(expected).length !== 2) throw Error('merchant_trade_source_changed');
writeFileSync(credentialFile, original.replace(expected, '"https://backroadbum.com/api/store-passes"'));
for (const [source, destination] of [['registry-connect.ts', 'src/features/checkout/registry-connect.ts'], ['admin-connect.ts', 'src/admin/connect.ts']]) {
  cpSync(resolve(root, 'ops/backroadbum', source), resolve(stage, destination));
}
cpSync(resolve(root, 'ops/backroadbum/merchant-ship.ts'), resolve(stage, 'src/admin/merchant-ship.ts'));
const adminPath = resolve(stage, 'src/admin/index.ts');
let admin = readFileSync(adminPath, 'utf8');
const syncStart = admin.indexOf('/** Brings Orders and Ship');
const syncEnd = admin.indexOf('/**\n * Private Block Kit transport', syncStart);
if (syncStart < 0 || syncEnd < 0) throw Error('merchant_ship_sync_source_changed');
admin = admin.slice(0, syncStart) + 'export async function syncOrdersWithShip(ctx: PluginContext): Promise<void> { await syncMerchantShip(ctx); }\n\n' + admin.slice(syncEnd);
const labelStart = admin.indexOf('    labelPage: async id => {');
const labelEnd = admin.indexOf('\n    },', labelStart);
if (labelStart < 0 || labelEnd < 0) throw Error('merchant_ship_link_source_changed');
admin = admin.slice(0, labelStart) + '    labelPage: id => merchantShipLabelPage(ctx, id),' + admin.slice(labelEnd + '\n    },'.length);
for (const [from, to] of [
  ['import { resolveCatalogVariantMember, type CatalogStorageRecord } from "../features/catalog/kernel/index.js";\n', ''],
  ['listPaidOrders, resolveRegistryShip,', 'listPaidOrders,'],
  ['ordersBlocks, ordersInteraction, shipLabelPage, syncShip, type OrdersCollection', 'ordersBlocks, ordersInteraction'],
]) {
  if (admin.split(from).length !== 2) throw Error('merchant_ship_admin_source_changed');
  admin = admin.replace(from, to);
}
writeFileSync(adminPath, 'import { syncMerchantShip, merchantShipLabelPage } from "./merchant-ship.js";\n' + admin);
const viewPath = resolve(stage, 'src/features/orders/admin/view.ts'), view = readFileSync(viewPath, 'utf8');
if (view.split("label: 'Create shipping label'").length !== 2) throw Error('merchant_ship_view_source_changed');
writeFileSync(viewPath, view.replace("label: 'Create shipping label'", "label: 'Open practice shipping'"));
const manifestPath = resolve(stage, 'emdash-plugin.jsonc');
const manifest = readFileSync(manifestPath, 'utf8');
const hostList = /"allowedHosts":\s*\[[^\]]*\]/g;
if ([...manifest.matchAll(hostList)].length !== 1) throw Error('merchant_manifest_source_changed');
writeFileSync(manifestPath, manifest.replace(hostList, '"allowedHosts": ["backroadbum.com"]'));
const run = args => execFileSync('npm', args, { cwd: stage, stdio: 'inherit', env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=1000' } });
run(['run', 'typecheck']);
run(['run', 'build']);
const output = resolve(root, 'dist/backroadbum');
rmSync(output, { recursive: true, force: true });
cpSync(resolve(stage, 'dist/sandbox'), resolve(output, 'dist/sandbox'), { recursive: true });
const backend = readFileSync(resolve(output, 'dist/sandbox/plugin.mjs'));
const profile = { profile: 'backroadbum/merchant-test-v2', base: pin, source: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
  origin: 'https://backroadbum.com', allowedHosts: ['backroadbum.com'], mode: 'test', bytes: backend.length,
  sha256: createHash('sha256').update(backend).digest('hex'), genericConnect: false, published: false };
writeFileSync(resolve(output, 'profile.json'), JSON.stringify(profile, null, 2));
console.log(JSON.stringify(profile));
