import { canonical, isRecord } from "../../shared/record.js";
import type { GuestCheckoutResult } from "../checkout/types.js";
import { FIRST_ORDER_NUMBER, type OrdersCollection } from "./store.js";

/** Called only after guest capability authorization. The paid projection selects the one readable order. */
export async function withGuestOrderFulfillment(
  result: GuestCheckoutResult,
  orders?: Pick<OrdersCollection, "get">,
): Promise<GuestCheckoutResult> {
  if (!result.ok || result.checkout.state !== "paid" || !result.checkout.order || !orders) return result;
  const order = result.checkout.order;
  try {
    const record = await orders.get(order.orderId);
    const paid = record?.paidOrder;
    // A receipt is never a lookup credential. Match the immutable paid copy before projecting later facts.
    if (!paid || paid.orderId !== order.orderId || paid.receiptId !== order.receiptId ||
        (paid.mode !== "live") !== order.test || canonical(paid.total) !== canonical(order.total) ||
        canonical(paid.lines) !== canonical(order.lines)) return result;
    const done = record.completed;
    const note = (value: unknown) => value === undefined || typeof value === "string" &&
      value.trim() === value && value.length > 0 && value.length <= 64 && !/[\p{Cc}\p{Zl}\p{Zp}]/u.test(value);
    if (done !== undefined && (!isRecord(done) || typeof done.at !== "string" ||
        !Number.isFinite(Date.parse(done.at)) || !note(done.carrier) || !note(done.tracking))) return result;
    return { ...result, checkout: { ...result.checkout, order: { ...order,
      ...(Number.isSafeInteger(record.number) && record.number! >= FIRST_ORDER_NUMBER ? { number: record.number } : {}),
      fulfillment: done ? { status: "completed", completedAt: done.at,
        ...(done.carrier ? { carrier: done.carrier } : {}), ...(done.tracking ? { tracking: done.tracking } : {}) }
        : { status: "processing" },
    } } };
  } catch {
    // An unavailable later-state read must not turn a valid paid receipt into a payment failure.
    return result;
  }
}
