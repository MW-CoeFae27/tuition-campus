import fs from "node:fs";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

// Render mounts Secret Files at /etc/secrets/<filename>, which is outside the
// service root that `dotenv/config` searches, so load the candidates explicitly.
const candidates = [
  process.env.SECRET_FILE_PATH,
  "/etc/secrets/.env",
  "/etc/secrets/api.env",
  fileURLToPath(new URL("../.env", import.meta.url)),
  fileURLToPath(new URL("../../.env", import.meta.url)),
].filter(Boolean);

export const loadedFrom = candidates.filter((path) => {
  if (!fs.existsSync(path)) return false;
  dotenv.config({ path, override: false });
  return true;
});

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Checked:", candidates.join(", "));
}
