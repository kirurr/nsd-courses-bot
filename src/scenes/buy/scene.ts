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

  let buyMessage = `
*${course.title}*

Для приобретения необходимо внести оплату по ссылке и сообщить в поддержку

*Стоимость:* ${course.price} рублей

[Ссылка на оплату](${course.paymentLink})
`;

  if (course.supportLink == "https://t.me/Natalitammore") {
    buyMessage = `
*${course.title}*

Для приобретения необходимо внести оплату по реквизитам и отправить чек в поддержку

${course.paymentLink.replace(/\\n/g, "\n")}

*Стоимость:* ${course.price} рублей
`;
  }

  await safeCtxEditMessage(
    ctx,
    buyMessage,
    {
      inline_keyboard: [
        [
          {
            text: "На страницу продукта",
            callback_data: `buy:${token}:${courseId}:back`,
          },
        ],
        [{ text: "Поддержка", url: course.supportLink }],
      ],
    },
  );
});
