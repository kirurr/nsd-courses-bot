import { Scenes } from "telegraf";
import type { ContextWithData } from "../scenes.js";
import { safeCtxEditMessage } from "../../helpers.js";
import { getCourseById } from "../../course/service.js";

export const buyScene = new Scenes.BaseScene<ContextWithData>("buy");

buyScene.enter(async (ctx) => {
  if (!ctx.from) {
    throw new Error("enterCourseScene: wrong type of context is passed");
  }

  const { token, courseId } = ctx.scene.state as {
    token: string;
    courseId: string;
  };

  const course = await getCourseById(ctx, parseInt(courseId));

  await safeCtxEditMessage(
    ctx,
    `Для приобретения курса необходимо внести оплату по этой [ссылке](${course.paymentLink}) и сообщить в поддержку`,
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
