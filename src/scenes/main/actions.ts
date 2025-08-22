import { bot } from "../../bot.js";
import { getUserState, updateUserState } from "../../user/service.js";
import { courseScene } from "../course/scene.js";

bot.action(/course:(.+):(.+):get/, async (ctx) => {
  ctx.answerCbQuery();

  const token = ctx.match[1] as string;
  const courseId = ctx.match[2] as string;

  const state = await getUserState(ctx);
  updateUserState(ctx, state);

  ctx.scene.enter(courseScene.id, { token, courseId });
});
