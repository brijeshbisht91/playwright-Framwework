import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env'), quiet: true });

const envName = process.env.TEST_ENV || process.env.NODE_ENV;
if (envName) {
  dotenv.config({
    path: path.resolve(__dirname, `../.env.${envName}`),
    override: true,
    quiet: true,
  });
}
