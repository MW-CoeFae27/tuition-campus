import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

// Render mounts Secret Files under /etc/secrets/ with an arbitrary filename, and
// that directory is outside the service root that `dotenv/config` searches.
const secretsDir = process.env.SECRETS_DIR || "/etc/secrets";
const fromSecretsDir = fs.existsSync(secretsDir)
  ? fs.readdirSync(secretsDir).map((name) => path.join(secretsDir, name))
  : [];

const candidates = [
  process.env.SECRET_FILE_PATH,
  ...fromSecretsDir,
  fileURLToPath(new URL("../.env", import.meta.url)),
  fileURLToPath(new URL("../../.env", import.meta.url)),
].filter(Boolean);

export const loadedFrom = candidates.filter((file) => {
  if (!fs.statSync(file, { throwIfNoEntry: false })?.isFile()) return false;
  return !dotenv.config({ path: file, override: false }).error;
});

console.log("Env files loaded:", loadedFrom.join(", ") || "(none)");
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Checked:", candidates.join(", "));
}
