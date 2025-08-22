import { randomBytes } from "crypto";
import type { ContextWithData } from "../scenes/scenes.js";
import {
  getUser,
  updateUserState as dbUpdateState,
} from "./repository.js";
import type { UserState, UsetStateMessage } from "./types.js";

export async function getUserState(ctx: ContextWithData): Promise<UserState> {
  const userId = checkContextAndRetrieveUserId(ctx);

  if (ctx.session && ctx.session.userState) {
    return ctx.session.userState;
  }

  const user = await getUser(userId);

  if (!user || !user.state) {
    const newState: UserState = {
      chatId: ctx.chat!.id,
      messages: [],
    };
    return newState;
  }

  return user.state;
}

export async function updateUserState(
  ctx: ContextWithData,
  state: UserState,
): Promise<UserState | null> {
  const userId = checkContextAndRetrieveUserId(ctx);

  if (ctx.session) {
    ctx.session.userState = state;
  }
  const apiState = await dbUpdateState(userId, state);
  return apiState;
}

export function createMessage(token: string, messageId: number): UsetStateMessage {
  return {
    token,
    messageId,
  };
}

export function generateMessageToken(): string {
  return randomBytes(16).toString("hex").slice(0, 16);
}

function checkContextAndRetrieveUserId(ctx: ContextWithData): number {
  if (!ctx.from || !ctx.chat) {
    throw new Error("wrong type of context passed");
  }

  return ctx.from.id;
}
