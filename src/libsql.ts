import { createClient } from "@libsql/client";
import { EnvError } from "./errors.js";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
if (!url || !authToken) {
  throw new EnvError("no db url or token in .ENV");
}

export const db = createClient({
  url,
  authToken,
});
