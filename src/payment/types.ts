import * as v from "valibot";

export type Payment = v.InferOutput<typeof PaymentSchema>;

export const PaymentSchema = v.object({
  id: v.number(),
  userId: v.number(),
  courseId: v.number(),
  isInvited: v.pipe(
    v.number(),
    v.transform((input) => input !== 0),
  ),
});

export type CreatePayment = Omit<Payment, "id" | "isInvited">;
