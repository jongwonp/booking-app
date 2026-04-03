-- checkInDate / checkOutDate 가 일반 nullable 컬럼으로 생성된 문제 수정
-- Generated Always As (Stored) 컬럼으로 재생성하여 exclusion constraint 가 정상 동작하도록 함

-- 0) 유효하지 않은 기존 데이터 정리 (checkIn >= checkOut 인 레코드 전체 삭제)
DELETE FROM "Reservation"
 WHERE "checkIn" >= "checkOut";

-- 1) 기존 제약 / 인덱스 제거
ALTER TABLE "Reservation" DROP CONSTRAINT IF EXISTS "Reservation_no_overlap";
ALTER TABLE "Reservation" DROP CONSTRAINT IF EXISTS "Reservation_valid_range";
DROP INDEX IF EXISTS "Reservation_active_idx";

-- 2) 기존 컬럼 제거 후 Generated 컬럼으로 재생성
ALTER TABLE "Reservation" DROP COLUMN IF EXISTS "checkInDate";
ALTER TABLE "Reservation" DROP COLUMN IF EXISTS "checkOutDate";

ALTER TABLE "Reservation"
  ADD COLUMN "checkInDate"  date GENERATED ALWAYS AS ("checkIn"::date)  STORED,
  ADD COLUMN "checkOutDate" date GENERATED ALWAYS AS ("checkOut"::date) STORED;

-- 3) 겹침 금지 (HOLD / CONFIRMED 상태만)
ALTER TABLE "Reservation"
  ADD CONSTRAINT "Reservation_no_overlap"
  EXCLUDE USING gist (
    "listingId" WITH =,
    daterange("checkInDate", "checkOutDate") WITH &&
  )
  WHERE (status IN ('HOLD', 'CONFIRMED'))
  DEFERRABLE INITIALLY IMMEDIATE;

-- 4) 날짜 유효성 체크
ALTER TABLE "Reservation"
  ADD CONSTRAINT "Reservation_valid_range"
  CHECK ("checkOutDate" > "checkInDate");

-- 5) 조회 최적화 인덱스
CREATE INDEX "Reservation_active_idx"
  ON "Reservation" ("listingId", "checkInDate", "checkOutDate")
  WHERE status IN ('HOLD', 'CONFIRMED');
