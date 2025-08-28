import { bot } from "../../bot.js";
import { getCourseById } from "../../course/service.js";
import { toggleInvite } from "../../payment/repository.js";
import { mainScene } from "../main/scene.js";
import { getPayments } from "../../payment/service.js";
import { buyScene } from "../buy/scene.js";

bot.action(/course:(.+):(.+):back/, (ctx) => {
  ctx.answerCbQuery(undefined, { cache_time: 1 });
  const token = ctx.match[1] as string;
  // const courseId = ctx.match[2] as string;

  ctx.scene.enter(mainScene.id, { token });
});

bot.action(/course:(.+):(.+):buy/, async (ctx) => {
  ctx.answerCbQuery(undefined, { cache_time: 1 });

  const token = ctx.match[1] as string;
  const courseId = ctx.match[2] as string;

  ctx.scene.enter(buyScene.id, { token, courseId });
});

bot.action(/course:(.+):(.+):invite/, async (ctx) => {
  ctx.answerCbQuery(undefined, { cache_time: 1 });
  if (!ctx.from) {
    throw new Error("wrong tipe of context passed");
  }

  // const token = ctx.match[1] as string;
  const courseId = ctx.match[2] as string;

  const course = await getCourseById(ctx, parseInt(courseId));

  const payments = await getPayments(ctx);

  const coursePayment = payments.find(
    (payment) => payment.courseId === course.id,
  );

  if (!coursePayment) {
    const sent = await ctx.reply(
      "Возможно, вам еще не выдали доступ, обратитесь в подддержку",
    );
    setTimeout(() => ctx.deleteMessage(sent.message_id), 10000);
    return;
  }

  if (coursePayment?.isInvited) {
    ctx.reply(
      "Невозможно создать ссылку-приглашение повторно, напишите в поддержку",
      { parse_mode: "MarkdownV2" },
    );
    return;
  }

  await toggleInvite(coursePayment!.id);

  const invite = await ctx.telegram.createChatInviteLink(course.groupId, {
    name: "Одноразовое приглашение",
    member_limit: 1,
  });

  ctx.scene.reenter();
  ctx.reply(`[Нажмите для вступления в группу](${invite.invite_link}`, {
    parse_mode: "MarkdownV2",
  });
});
