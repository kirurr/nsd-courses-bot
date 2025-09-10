import { Scenes } from "telegraf";
import type { ContextWithData } from "./../scenes.js";
import { getCourses } from "../../course/repository.js";
import { getUser } from "../../user/repository.js";
import type { InlineKeyboardMarkup } from "telegraf/types";
import {
  createMessage,
  generateMessageToken,
  getUserState,
  updateUserState,
} from "../../user/service.js";
import { safeCtxEditMessage, safeTelegramEditMessage } from "../../helpers.js";

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
      throw new Error("userFromApi: can not get user from api");
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
  const mainMenuMessageText = `
*Для того, чтобы оформить Туроператора и войти в единый федеральный реестр, вам необходимо*

1\\. Открыть ООО
2\\. Оформить финансовую гарантию 
3\\. Отправить документы в Министерство эконом\\.развития
4\\. Дождаться приказа о внесении в единый реестр

Вы можете это сделать самостоятельно, используя подробные чек\\-листы или обратиться к нам и мы поможем вам\\.
Дадим необходимую консультацию или вместе с вами оформим все необходимые документы

*📍Штраф за работу туроператором без вхождения в реестр, согласно статье, составляет для юридического лица от 5 до 10 млн рублей\\.*
`;
  const mainMenuMessageInlineKeyboard: InlineKeyboardMarkup = {
    inline_keyboard: courses.map((course) => {
      return [
        {
          text: course.title.replace(/\\/g, ''),
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
      await safeTelegramEditMessage(
        ctx,
        state.chatId,
        messageId,
        mainMenuMessageText,
        mainMenuMessageInlineKeyboard,
      );
    } else {
      await safeCtxEditMessage(
        ctx,
        mainMenuMessageText,
        mainMenuMessageInlineKeyboard,
      );
    }
  } else {
    const message = await ctx.reply(mainMenuMessageText, {
      reply_markup: mainMenuMessageInlineKeyboard,
      parse_mode: "MarkdownV2",
    });

    const newMessage = createMessage(newToken, message.message_id);
    state.messages.push(newMessage);
    updateUserState(ctx, state);
  }
});
