import { Scenes } from "telegraf";
import type { ContextWithData } from "./../scenes.js";
import { getPaymentsForUserByTelegramId } from "../../payment/repository.js";
import type { InlineKeyboardButton } from "telegraf/types";
import { getCourseById } from "../../course/service.js";

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
        text: "back",
        callback_data: `course:${token}:${courseId}:back`,
      },
    ],
  ];


  const userPayments = await getPaymentsForUserByTelegramId(ctx.from.id);
  ctx.session.payments = userPayments;

  const coursePayment = userPayments.find(
    (payment) => payment.courseId === course.id,
  );

  if (!coursePayment) {
    inlineKeyboard.push([{ text: "buy", callback_data: `course:${token}:${courseId}:buy`}]);
  } else if (!coursePayment?.isInvited) {
    inlineKeyboard.push([{ text: "invite", callback_data: `course:${token}:${courseId}:invite`}]);
  } else {
    inlineKeyboard.push([
      {
        text: "you are already invited, contact support to get link again",
        callback_data: `course:${token}:${courseId}:inviteAgain`,
      },
    ]);
  }

  await ctx.editMessageText(course.description, {
    reply_markup: {
      inline_keyboard: inlineKeyboard,
    },
  });
});
