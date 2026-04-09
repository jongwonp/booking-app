// src/lib/api.ts (예시)

export async function createReservation(input: {
  listingId: string;
  checkIn: string;
  checkOut: string;
}) {
  const res = await fetch("/api/reservations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const json = await res.json();

  if (!json.ok) {
    // 에러 코드(conflict, invalid-refs, ...)를 Error로 변환
    const err = new Error(json.error || "unknown");
    (err as any).status = res.status;
    throw err;
  }

  // json.data는 { id, status, totalPrice }
  return json.data as { id: string; status: string; totalPrice: number };
}

export async function confirmReservation(id: string) {
  const res = await fetch(`/api/reservations/${id}/confirm`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
  });

  const json = await res.json();

  if (!json.ok) {
    const err = new Error(json.error || "confirm-failed");
    (err as any).status = res.status;
    throw err;
  }

  // data 안에는 최소 { id, status } 정도가 있다고 가정
  return json.data as { id: string; status: string };
}

export async function cancelReservation(id: string) {
  const res = await fetch(`/api/reservations/${id}/cancel`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
  });

  const json = await res.json();

  if (!json.ok) {
    const err = new Error(json.error || "cancel-failed");
    (err as any).status = res.status;
    throw err;
  }

  return json.data as { id: string; status: string };
}
