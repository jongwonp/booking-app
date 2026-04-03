CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 1) 기존 객체 정리(있으면 제거)
ALTER TABLE "Reservation" DROP CONSTRAINT IF EXISTS "Reservation_no_overlap";
ALTER TABLE "Reservation" DROP CONSTRAINT IF EXISTS "Reservation_valid_range";
DROP INDEX IF EXISTS "Reservation_active_idx";

-- 2) 생성 컬럼: 없으면 추가만
ALTER TABLE "Reservation"
  ADD COLUMN IF NOT EXISTS "checkInDate"  date GENERATED ALWAYS AS ("checkIn"::date) STORED,
  ADD COLUMN IF NOT EXISTS "checkOutDate" date GENERATED ALWAYS AS ("checkOut"::date) STORED;

-- 3) 겹침 금지(활성 상태만)
ALTER TABLE "Reservation"
  ADD CONSTRAINT "Reservation_no_overlap"
  EXCLUDE USING gist (
    "listingId" WITH =,
    daterange("checkInDate","checkOutDate") WITH &&
  )
  WHERE (status IN ('HOLD','CONFIRMED'))
  DEFERRABLE INITIALLY IMMEDIATE;

-- 4) 날짜 유효성
ALTER TABLE "Reservation"
  ADD CONSTRAINT "Reservation_valid_range"
  CHECK ("checkOutDate" > "checkInDate");

-- 5) 조회 최적화(옵션)
CREATE INDEX IF NOT EXISTS "Reservation_active_idx"
ON "Reservation" ("listingId","checkInDate","checkOutDate")
WHERE status IN ('HOLD','CONFIRMED');
