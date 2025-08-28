import type { ContextWithData } from "../scenes/scenes.js";
import { getPaymentsForUserByTelegramId } from "./repository.js";
import type { Payment } from "./types.js";

export async function getPayments(ctx: ContextWithData): Promise<Payment[]> {
  if (!ctx.from) {
    throw new Error("getPayments: wrong type of context passed");
  }
  const payments = await getPaymentsForUserByTelegramId(ctx.from.id);
  return payments;
}
