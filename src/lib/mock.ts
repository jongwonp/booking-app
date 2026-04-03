import "server-only";
import { loadJSON, saveJSON } from "@/lib/store";

export type Reservation = {
  id: string;
  listingId: string;
  status: "HOLD" | "CONFIRMED";
  checkIn: string;
  checkOut: string;
  createdAt: number;
};

type StoreShape = { reservations: Record<string, Reservation> };

async function readStore(): Promise<StoreShape> {
  return loadJSON<StoreShape>({ reservations: {} });
}
async function writeStore(s: StoreShape) {
  await saveJSON<StoreShape>(s);
}

export async function getAllReservations(): Promise<Reservation[]> {
  const s = await readStore();
  return Object.values(s.reservations);
}
export async function getReservation(id: string): Promise<Reservation | undefined> {
  const s = await readStore();
  return s.reservations[id];
}
export async function putReservation(r: Reservation): Promise<void> {
  const s = await readStore();
  s.reservations[r.id] = r;
  await writeStore(s);
}

/** 🔥 실제 삭제 */
export async function deleteReservation(id: string): Promise<boolean> {
  const s = await readStore();
  if (!(id in s.reservations)) return false;
  delete s.reservations[id];
  await writeStore(s);
  return true;
}

export function genId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}
