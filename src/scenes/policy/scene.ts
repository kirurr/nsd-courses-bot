import { Scenes } from "telegraf";
import type { ContextWithData } from "./../scenes.js";
import { generateMessageToken, getUserState } from "../../user/service.js";
import { createUser } from "../../user/repository.js";

export const policyScene = new Scenes.BaseScene<ContextWithData>("policy");

policyScene.enter(async (ctx) => {
  if (!ctx.from)
    throw new Error("policySceneEnter: wrong type of context passed");

  const token = generateMessageToken();
  const sent = await ctx.reply(
      `
🙂 Продолжая диалог, вы принимаете условия обработки персональных данных и нашу политику конфиденциальности

Подробнее:
📄 [Политика конфиденциальности](https://nesidimdomaclub.ru/politika-konfidentsialnosti)
✍ [Согласие на обработку](https://nesidimdomaclub.ru/soglasie-na-obrabotku-personalnykh-dannykh)
`,
    {
      parse_mode: "MarkdownV2",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Принимаю",
              callback_data: `policy:${token}:accept`,
            },
          ],
        ],
      },
    },
  );
  const name =
    `${ctx.from.first_name || ""} ${ctx.from.last_name || ""}`.trim() ||
    "unkonwn user";

  const state = await getUserState(ctx);
  state.messages.push({
    token: token,
    messageId: sent.message_id,
  });

  await createUser({
    telegramId: ctx.from.id,
    name,
    username: ctx.from.username,
    isAccepted: false,
    state,
  });
});
