import "dotenv/config";
import { bot } from "./bot.js";

import { policyScene } from "./scenes/policy/scene.js";
import { mainScene } from "./scenes/main/scene.js";
import { getUser } from "./user/repository.js";

import "./scenes/policy/actions.js";
import "./scenes/main/actions.js";
import "./scenes/course/actions.js";

bot.start(async (ctx) => {
  const user = await getUser(ctx.from.id);
  if (!user) {
    ctx.scene.enter(policyScene.id);
  } else if (!user.isAccepted) {
    ctx.session.user = user;
    ctx.scene.enter(policyScene.id);
  } else {
    ctx.scene.enter(mainScene.id);
  }
});

bot.launch();

bot.catch((err, ctx) => {
  console.error("global error happened");
  console.error(err);
  ctx.reply("error happened, try again later");
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
