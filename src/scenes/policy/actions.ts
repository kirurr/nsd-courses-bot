import { bot } from "../../bot.js";
import { getUser, userAcceptPolicy } from "../../user/repository.js";
import { getUserState } from "../../user/service.js";
import { mainScene } from "./../main/scene.js";

bot.action(/policy:(.+):accept/, async (ctx) => {
  ctx.answerCbQuery(undefined, { cache_time: 1 });
  const messageId = ctx.match[1] as string;

  const state = await getUserState(ctx);
  const message = state.messages.find((m) => m.token === messageId);
  if (!message) {
    throw new Error("policy:accept: failed to get message from user state");
  }

	const user = await getUser(ctx.from.id)
	if (!user) throw new Error("policy:accept: no user when accepting policy")

	await userAcceptPolicy(ctx.from.id);

	// await safeTelegramEditMessage(ctx, state.chatId, message.messageId, "accepted")
	await ctx.editMessageReplyMarkup(undefined)

  ctx.scene.enter(mainScene.id, { sendMessage: true });
});
