import { bot } from "../../bot.js";
import { getCourseById } from "../../course/service.js";
import { createPayment, toggleInvite } from "../../payment/repository.js";
import { getUser } from "../../user/repository.js";
import { mainScene } from "../main/scene.js";

bot.action(/course:(.+):(.+):back/, (ctx) => {
  ctx.answerCbQuery();
  const token = ctx.match[1] as string;
  const courseId = ctx.match[2] as string;

  ctx.scene.enter(mainScene.id, { token });
});

bot.action(/course:(.+):(.+):buy/, async (ctx) => {
  ctx.answerCbQuery();
  // const token = ctx.match[1] as string;
  const courseId = ctx.match[2] as string;

  const course = await getCourseById(ctx, parseInt(courseId));

  let user = ctx.session.user!;
  if (!user) {
    const res = await getUser(ctx.from!.id);
    if (!res) {
      ctx.reply("error happened, try again later");
      return;
    }
    user = res;
  }

  const newPayment = await createPayment({
    userId: user.telegramId,
    courseId: course.id,
  });

  ctx.session.payments = [...(ctx.session.payments ?? []), newPayment];

  ctx.scene.reenter();
});

bot.action(/course:(.+):(.+):invite/, async (ctx) => {
  ctx.answerCbQuery();
  if (!ctx.from) {
    throw new Error("wrong tipe of context passed");
  }

  // const token = ctx.match[1] as string;
  const courseId = ctx.match[2] as string;

  const course = await getCourseById(ctx, parseInt(courseId));

  const payment = ctx.session.payments!.find(
    (payment) => payment.courseId === course.id,
  );

  if (!payment) {
    ctx.reply("error happened, try again later");
  }

  await toggleInvite(payment!.id);

  const invite = await ctx.telegram.createChatInviteLink(course.groupId, {
    name: "One time invite",
    member_limit: 1,
  });

  ctx.reply(`invite link: ${invite.invite_link}`);
});
