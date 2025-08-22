import * as v from "valibot";
import { db } from "../libsql.js";
import {
  UserSchema,
  type User,
  type UserState,
} from "./types.js";
import { DatabaseError, ValidationError } from "../errors.js";
import { LibsqlError } from "@libsql/client";

export async function getUser(id: number): Promise<User | null> {
  try {
    const result = await db.execute({
      sql: "SELECT * FROM user WHERE telegram_id = ?",
      args: [id],
    });
    const user = result.rows[0];
    if (!user) {
      return null;
    }

    const output = v.safeParse(UserSchema, {
      telegramId: user.telegram_id,
      username: user.username,
      name: user.name,
      isAccepted: user.is_accepted,
      state: user.state,
    });
    if (output.success) {
      return output.output;
    }
    throw new ValidationError(output.issues.toString());
  } catch (err: unknown) {
    console.error("failed to get User");
    console.error(err);
    if (err instanceof LibsqlError) {
      throw new DatabaseError(err.message);
    }
    throw err;
  }
}

export async function createUser(data: Omit<User, "id">): Promise<void> {
  try {
    await db.execute({
      sql: "INSERT INTO user (telegram_id, username, name, is_accepted, state) VALUES (?, ?, ?, ?, ?)",
      args: [
        data.telegramId,
        data.username || null,
        data.name,
        data.isAccepted === true ? 1 : 0,
        JSON.stringify(data.state),
      ],
    });
  } catch (err) {
    console.error("failed to create user");
    console.error(err);
    if (err instanceof LibsqlError) {
      throw new DatabaseError(err.message);
    }
    throw err;
  }
}

export async function userAcceptPolicy(
  id: number,
) {
  try {
    await db.execute({
      sql: "UPDATE user SET is_accepted = ? WHERE telegram_id = ?",
      args: [1, id],
    });
  } catch (err) {
    console.error("failed to update user");
    console.error(err);
    if (err instanceof LibsqlError) {
      throw new DatabaseError(err.message);
    }
    throw err;
  }
}

export async function updateUserState(
  id: number,
  state: UserState,
): Promise<UserState | null> {
  try {
    const data = await db.execute({
      sql: "UPDATE user SET state = ? WHERE telegram_id = ? RETURNING *",
      args: [JSON.stringify(state), id],
    });

    const user = data.rows[0];
    if (!user) {
      return null;
    }

    const output = v.safeParse(UserSchema, {
      telegramId: user.telegram_id,
      username: user.username,
      name: user.name,
      isAccepted: user.is_accepted,
      state: user.state,
    });
    if (!output.success) {
      throw new ValidationError(output.issues.toString());
    }

    if (!output.output.state) {
      return null;
    }

    return output.output.state;
  } catch (err) {
    console.error("failed to update user state");
    console.error(err);
    if (err instanceof LibsqlError) {
      throw new DatabaseError(err.message);
    }
    throw err;
  }
}
