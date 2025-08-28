import { Scenes } from "telegraf";
import type { ContextWithData } from "../scenes.js";
import { safeCtxEditMessage } from "../../helpers.js";

export const buyScene = new Scenes.BaseScene<ContextWithData>("buy");

buyScene.enter(async (ctx) => {
  if (!ctx.from) {
    throw new Error("enterCourseScene: wrong type of context is passed");
  }

  const { token, courseId } = ctx.scene.state as {
    token: string;
    courseId: string;
  };

  await safeCtxEditMessage(
    ctx,
    `Для приобретения курса необходимо внести оплату по этой [ссылке](https://link.com) и сообщить в поддержку`,
    {
      inline_keyboard: [
        [
          {
            text: "На страницу курса",
            callback_data: `buy:${token}:${courseId}:back`,
          },
        ],
        [{ text: "Поддержка", url: "https://supporturl.com" }],
      ],
    },
  );
});
