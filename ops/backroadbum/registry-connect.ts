// Merchant-only replacement, overlaid at src/features/checkout/registry-connect.ts.
// Not a new generic Connect flow. The operator provisions the existing encrypted setting.
import type { PluginContext } from "emdash";
import { pluginResponse } from "emdash/plugin";
import { isRecord } from "../../shared/record.js";
import { COMMERCE_REGISTRY_RUNTIME_ID } from "../../shared/plugin-identity.js";
import { admitRegistryCheckoutConfig } from "./registry-provider-admission.js";
import { admitCredential } from "./registry-credential.js";
import { readBoundedPaymentsJson } from "./test-payments.js";
import { resolveTrustedSiteOrigin } from "./site-scope.js";

const ORIGIN = "https://backroadbum.com", SITE = "backroadbum", AUDIENCE = "backroadbum-commerce";
export const CONNECTION_SETTING = "connection", CHECKOUT_SETTING = "installedCheckout";
export type ConnectState =
  | { state: "connected"; siteId: string; key: string; finished?: true }
  | { state: "pending"; uri: string; checked?: boolean }
  | { state: "disconnected"; failure?: string };

export async function storeKey(ctx: PluginContext) {
  const site = resolveTrustedSiteOrigin({ runtimeSiteUrl: ctx.site?.url });
  if (!site.ok || site.origin !== ORIGIN || ctx.plugin?.id !== COMMERCE_REGISTRY_RUNTIME_ID || !ctx.settings) return null;
  const entry = await ctx.settings.getVersioned<unknown>(CONNECTION_SETTING);
  try {
    const value: unknown = typeof entry?.value === "string" ? JSON.parse(entry.value) : null;
    return isRecord(value) && value.siteId === SITE && typeof value.storeKey === "string" &&
      /^dk_store_[A-Za-z0-9_-]{43}$/.test(value.storeKey) && typeof entry?.revision === "string"
      ? { siteId: SITE, key: value.storeKey, revision: entry.revision } : null;
  } catch { return null; }
}
export async function connectState(ctx: PluginContext, _check = false): Promise<ConnectState> {
  const found = await storeKey(ctx);
  return found ? { state: "connected", siteId: found.siteId, key: found.key }
    : { state: "disconnected", failure: "The operator must provision this merchant-owned TEST connection." };
}
export const startConnect = connectState;
export const cancelConnect = connectState;
export async function storeProof(_input: unknown, _ctx: PluginContext) {
  return pluginResponse({ status: 404, headers: { "Cache-Control": "no-store", "Content-Type": "application/json" },
    body: { kind: "text", value: JSON.stringify({ error: "not_found" }) } });
}

export async function refreshCheckoutSettings(ctx: PluginContext, _known?: { siteId: string; key: string } | null): Promise<string | null> {
  const found = await storeKey(ctx);
  if (!found || !ctx.http || !ctx.settings) return "not_connected";
  try {
    const current = await ctx.settings.getVersioned<unknown>(CHECKOUT_SETTING);
    const response = await ctx.http.fetch(ORIGIN + "/api/store-passes", {
      method: "POST", cache: "no-store", redirect: "error", headers: {
        accept: "application/json", "content-type": "application/json", authorization: "Bearer " + found.key,
      }, body: JSON.stringify({ site_id: SITE, scope: "commerce:settings", audience: AUDIENCE }),
    });
    if (!response.ok) return "unavailable";
    const pass = await readBoundedPaymentsJson(response);
    if (!isRecord(pass) || typeof pass.access_token !== "string" || pass.access_token.length > 16384) return "unavailable";
    const settings = await ctx.http.fetch(ORIGIN + "/api/commerce-settings", { cache: "no-store", redirect: "error",
      headers: { accept: "application/json", authorization: "Bearer " + pass.access_token, "x-dinkus-site": SITE } });
    if (!settings.ok) return "unavailable";
    const config = admitRegistryCheckoutConfig(await readBoundedPaymentsJson(settings), ORIGIN);
    if (!config || config.siteId !== SITE || config.issuer !== ORIGIN || config.paymentsOrigin !== ORIGIN ||
        config.audience !== "backroadbum-payments" || config.mode !== "test" || config.providerId !== "stripe" || config.ship || config.coupons) return "unavailable";
    admitCredential(pass.access_token, config, "commerce:settings", AUDIENCE);
    const value = JSON.stringify(config);
    if (current?.value !== value && !(await ctx.settings.compareAndSet(CHECKOUT_SETTING, current?.revision ?? null, value)).applied) return "unavailable";
    return null;
  } catch { return "unavailable"; }
}
