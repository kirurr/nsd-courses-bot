import { bot } from "../../bot.js";
import { courseScene } from "../course/scene.js";

bot.action(/buy:(.+):(.+):back/, (ctx) => {
  ctx.answerCbQuery(undefined, { cache_time: 1 });
  const token = ctx.match[1] as string;
  const courseId = ctx.match[2] as string;

  ctx.scene.enter(courseScene.id, { token, courseId });
});
