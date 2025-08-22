import { Context, type Scenes } from "telegraf";
import type { User, UserState } from "../user/types.js";
import type { Course } from "../course/types.js";
import type { Payment } from "../payment/types.js";

export interface SceneSessionWithData extends Scenes.SceneSession {
  user?: User;
  courses?: Course[];
  currentCourse?: Course;
  payments?: Payment[];
  userState?: UserState;
}

export interface ContextWithData extends Context {
  session: SceneSessionWithData;
  scene: Scenes.SceneContextScene<ContextWithData>;
}
