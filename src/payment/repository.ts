import * as v from "valibot";
import { LibsqlError } from "@libsql/client";
import { db } from "../libsql.js";
import { PaymentSchema, type CreatePayment, type Payment } from "./types.js";
import { DatabaseError, ValidationError } from "../errors.js";

const paymentsSchema = v.array(PaymentSchema);

export async function createPayment(data: CreatePayment): Promise<Payment> {
  try {
    const response = await db.execute({
      sql: "INSERT INTO payment (user_id, course_id, is_invited) VALUES (?, ?, ?) RETURNING *",
      args: [data.userId, data.courseId, 0],
    });

    const payment = response.rows[0];
    if (!payment) {
      throw new DatabaseError("no payment is returned on creating");
    }

    const output = v.safeParse(PaymentSchema, {
      id: payment.id,
      userId: payment.user_id,
      courseId: payment.course_id,
      isInvited: payment.is_invited,
    });
    if (output.success) {
      return output.output;
    }
    throw new ValidationError(output.issues.toString());
  } catch (err) {
    console.error("failed to create payment");
    console.error(err);
    if (err instanceof LibsqlError) {
      throw new DatabaseError(err.message);
    }
    throw err;
  }
}

export async function toggleInvite(id: number) {
  try {
    await db.execute({
      sql: "UPDATE payment SET is_invited = 1 WHERE id = ?",
      args: [id],
    });
  } catch (err) {
    console.error("failed to create payment");
    console.error(err);
    if (err instanceof LibsqlError) {
      throw new DatabaseError(err.message);
    }
    throw err;
  }
}

export async function getPaymentsForUserByTelegramId(
  id: number,
): Promise<Payment[]> {
  try {
    const result = await db.execute({
      sql: "SELECT * FROM payment JOIN user ON user.telegram_id = payment.user_id WHERE user.telegram_id = ?",
      args: [id],
    });

    const output = v.safeParse(
      paymentsSchema,
      result.rows.map((payment) => {
        return {
          id: payment.id,
          userId: payment.user_id,
          courseId: payment.course_id,
          isInvited: payment.is_invited,
        };
      }),
    );
    if (output.success) {
      return output.output;
    }
    throw new ValidationError(output.issues.toString());
  } catch (err) {
    console.error("failed to get payments");
    console.error(err);
    if (err instanceof LibsqlError) {
      throw new DatabaseError(err.message);
    }
    throw err;
  }
}
