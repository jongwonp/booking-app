// src/lib/store.ts
import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), ".next", "cache", "dev-store");
const FILE = path.join(DATA_DIR, "reservations.json");

export async function loadJSON<T>(fallback: T): Promise<T> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const buf = await fs.readFile(FILE, "utf8");
    return JSON.parse(buf) as T;
  } catch {
    return fallback;
  }
}

export async function saveJSON<T>(data: T): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(data, null, 2), "utf8");
}
