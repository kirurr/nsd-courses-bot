import * as v from "valibot";

export type User = v.InferOutput<typeof UserSchema>;

export const UserSchema = v.object({
  telegramId: v.number(),
  username: v.optional(v.string()),
  name: v.string(),
  isAccepted: v.pipe(
    v.number(),
    v.transform((input) => input !== 0),
  ),
  state: v.optional(
    v.pipe(
      v.string(),
      v.transform((input) => {
        const data = JSON.parse(input);

        const output = v.parse(UserStateSchema, data);
        return output;
      }),
    ),
  ),
});

export const UpdateUserSchema = v.omit(UserSchema, ["telegramId"]);

const UserStateMessageSchema = v.object({
  token: v.string(),
  messageId: v.number(),
});

const UserStateSchema = v.object({
  chatId: v.number(),
  messages: v.array(UserStateMessageSchema),
});

export type UserState = v.InferOutput<typeof UserStateSchema>;
export type UsetStateMessage = v.InferInput<typeof UserStateMessageSchema>;
