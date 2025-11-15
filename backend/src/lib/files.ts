import fs from "fs/promises";
import path from "path";
import { config } from "./config";

export async function ensureStorageDir(): Promise<string> {
  await fs.mkdir(config.storageDir, { recursive: true });
  return config.storageDir;
}

export function storagePath(fileName: string): string {
  return path.join(config.storageDir, fileName);
}

export function relativeStoragePath(filePath: string): string {
  return path.relative(config.storageDir, filePath);
}
