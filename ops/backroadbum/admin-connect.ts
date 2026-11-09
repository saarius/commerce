// Merchant-only Block Kit connection status. No claim of generic Connect support.
import type { Block, BlockResponse } from "@emdash-cms/blocks";
import type { PluginContext, SandboxedRouteContext } from "emdash/plugin";
import { connectState, refreshCheckoutSettings, type ConnectState } from "../features/checkout/kernel/index.js";
import { adminAuthorized, navigation } from "../shared/admin-blocks.js";
import { button, header, note } from "./common.js";

export function connectBlocks(state: ConnectState, admin: boolean, failure?: string): Block[] {
  return [header("Backroad Bum TEST transport"),
    note(state.state === "connected" ? "Merchant-owned connection configured. This is not a DinkusKit.com Connect grant." : "Operator provisioning required; shopper checkout stays closed."),
    ...(failure ? [note("Checkout settings could not be refreshed; saved settings are unchanged.")] : []),
    ...(admin && state.state === "connected" ? [{ type: "actions", elements: [button("Get checkout settings", "connect.refresh")] } as Block] : []),
  ];
}
export const connectInteraction = (input: unknown) => (input as { type?: unknown })?.type === "block_action" &&
  ["connect", "connect.check", "connect.cancel", "connect.refresh"].includes((input as { action_id: string }).action_id);
export async function connectAdmin(route: SandboxedRouteContext, ctx: PluginContext): Promise<BlockResponse> {
  const admin = adminAuthorized(route), state = await connectState(ctx);
  const failure = admin ? await refreshCheckoutSettings(ctx) : "forbidden";
  return { blocks: [header("Commerce settings"), navigation(), ...connectBlocks(state, admin, failure ?? undefined)],
    ...(admin && !failure ? { toast: { type: "success", message: "Merchant TEST settings refreshed" } } : {}) };
}
export async function finishedConnect(ctx: PluginContext, _state: ConnectState & { state: "connected" }, admin: boolean): Promise<BlockResponse> {
  const state = await connectState(ctx);
  const failure = admin ? await refreshCheckoutSettings(ctx) : "forbidden";
  return { blocks: [header("Commerce settings"), navigation(), ...connectBlocks(state, admin, failure ?? undefined)] };
}
