import { Scenes, session, Telegraf } from "telegraf";
import type { ContextWithData } from "./scenes/scenes.js";
import { EnvError } from "./errors.js";

import { mainScene } from "./scenes/main/scene.js";
import { policyScene } from "./scenes/policy/scene.js";
import { courseScene } from "./scenes/course/scene.js";
import { buyScene } from "./scenes/buy/scene.js";

const key = process.env.BOT_KEY;
if (!key) throw new EnvError("NO BOT KEY ENV");

export const bot = new Telegraf<ContextWithData>(key);

const stage = new Scenes.Stage([mainScene, policyScene, courseScene, buyScene]);

bot.use(
  session({ defaultSession: () => ({}), }),
);

bot.use(stage.middleware());

bot.telegram.setMyCommands([
  { command: "start", description: "Запустить бота" },
]);
