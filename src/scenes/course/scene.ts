import { Scenes } from "telegraf";
import type { ContextWithData } from "./../scenes.js";
import type { InlineKeyboardButton } from "telegraf/types";
import { getCourseById } from "../../course/service.js";
import { safeCtxEditMessage } from "../../helpers.js";

export const courseScene = new Scenes.BaseScene<ContextWithData>("course");

courseScene.enter(async (ctx) => {
  if (!ctx.from) {
    throw new Error("enterCourseScene: wrong type of context is passed");
  }

  const { token, courseId } = ctx.scene.state as {
    token: string;
    courseId: string;
  };

  const course = await getCourseById(ctx, parseInt(courseId));

  const inlineKeyboard: InlineKeyboardButton[][] = [
    [
      {
        text: "Главное меню",
        callback_data: `course:${token}:${courseId}:back`,
      },
    ],
    [
      {
        text: "Приобрести",
        callback_data: `course:${token}:${courseId}:buy`,
      },
    ],
    course.recieveType == "chat"
      ? [
          {
            text: "Уже приобрел",
            callback_data: `course:${token}:${courseId}:invite`,
          },
        ]
      : [
          {
            text: "Уже приобрел",
            url: course.supportLink,
          },
        ],
    [
      {
        text: "Поддержка",
        url: course.supportLink,
      },
    ],
  ];

  const courseMessage = `
*${course.title}*

${course.description.replace(/\\n/g, "\n")}

*Стоимость:* ${course.price} рублей
`;

	await safeCtxEditMessage(ctx, courseMessage, {
		inline_keyboard: inlineKeyboard,
	});
});
