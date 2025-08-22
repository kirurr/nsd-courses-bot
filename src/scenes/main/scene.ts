import { Scenes } from "telegraf";
import type { ContextWithData } from "./../scenes.js";
import { getCourses } from "../../course/repository.js";
import { getUser } from "../../user/repository.js";
import type { InlineKeyboardMarkup, Message, Update } from "telegraf/types";
import {
  createMessage,
  generateMessageToken,
  getUserState,
  updateUserState,
} from "../../user/service.js";

export const mainScene = new Scenes.BaseScene<ContextWithData>("main");

mainScene.enter(async (ctx) => {
  if (!ctx.from) {
    throw new Error("enterMainScene: wrong ctx passed");
  }

  const { sendMessage, token } = ctx.scene.state as {
    sendMessage?: boolean;
    token?: string;
  };

  let user = ctx.session.user;
  if (!user) {
    const userFromApi = await getUser(ctx.from.id);
    if (!userFromApi) {
      ctx.reply("error happened, try again later");
      return;
    }
    user = userFromApi;
  }

  ctx.session.user = user;

  let courses = ctx.session.courses;
  if (!courses) {
    courses = await getCourses();
    ctx.session.courses = courses;
  }

  const newToken = generateMessageToken();
  const mainMenuMessageText = "main menu";
  const mainMenuMessageInlineKeyboard: InlineKeyboardMarkup = {
    inline_keyboard: courses.map((course) => {
      return [
        {
          text: course.title,
          callback_data: `course:${token ?? newToken}:${course.id}:get`,
        },
      ];
    }),
  };
  const state = await getUserState(ctx);

  if (ctx.callbackQuery && !sendMessage) {
    if (token) {
      const messageId = state.messages.find(
        (m) => m.token === token,
      )?.messageId;
      if (!messageId) throw new Error("failed to find message with token");
      await ctx.telegram.editMessageText(
        state.chatId,
        messageId,
        undefined,
        mainMenuMessageText,
        {
          reply_markup: mainMenuMessageInlineKeyboard,
        },
      );
    } else {
      await ctx.editMessageText(mainMenuMessageText, {
        reply_markup: mainMenuMessageInlineKeyboard,
      });
    }
  } else {
    const message = await ctx.reply(mainMenuMessageText, {
      reply_markup: mainMenuMessageInlineKeyboard,
    });

    const newMessage = createMessage(newToken, message.message_id);
    state.messages.push(newMessage);
    updateUserState(ctx, state);
  }
});
