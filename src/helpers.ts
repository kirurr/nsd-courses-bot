import type { InlineKeyboardMarkup } from "telegraf/types";
import type { Context } from "telegraf";

/**
 * Хелпер для безопасного редактирования сообщений через ctx.editMessageText
 */
export async function safeCtxEditMessage(
  ctx: Context,
  text: string,
  replyMarkup?: InlineKeyboardMarkup,
) {
  try {
    const extra = replyMarkup ? { reply_markup: replyMarkup } : {};
    await ctx.editMessageText(text, {
      ...extra,
      parse_mode: "MarkdownV2",
    });
  } catch (err: any) {
    if (err.response?.description?.includes("message is not modified")) {
      // Игнорируем: сообщение уже в таком состоянии
      return;
    }
    throw err;
  }
}

/**
 * Хелпер для безопасного редактирования сообщений через ctx.telegram.editMessageText
 */
export async function safeTelegramEditMessage(
  ctx: Context,
  chatId: number,
  messageId: number,
  text: string,
  replyMarkup?: InlineKeyboardMarkup,
) {
  try {
    const extra = replyMarkup ? { reply_markup: replyMarkup } : {};
    await ctx.telegram.editMessageText(chatId, messageId, undefined, text, {
      ...extra,
      parse_mode: "MarkdownV2",
    });
  } catch (err: any) {
    if (err.response?.description?.includes("message is not modified")) {
      return;
    }
    throw err;
  }
}
