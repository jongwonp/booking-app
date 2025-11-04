## 목적

MVP 예약 흐름(HOLD→CONFIRMED)에 필요한 최소 테이블 3개 정의.

## 엔터티

### User

- id (PK, uuid)

- email (unique)

- name (nullable)

- createdAt, updatedAt

### Listing

- id (PK, uuid)

- slug (unique)

- title

- nightlyPrice (int)

- location (string)

- createdAt, updatedAt

### Reservation

- id (PK, uuid)

- userId (FK → User.id)

- listingId (FK → Listing.id)

- checkIn (date)

- checkOut (date)

- status (enum: HOLD, CONFIRMED, CANCELLED) ← MVP는 HOLD/CONFIRMED만 사용

- totalPrice (int) // 단순 계산: nightlyPrice \* 숙박일수

- createdAt, updatedAt

## 관계

- User (1) — (N) Reservation

- Listing (1) — (N) Reservation

## 제약/인덱스(최소)

- Reservation(listingId, checkIn, checkOut) 인덱스

- Reservation(status) 인덱스

- Listing.slug unique

## HOLD/CONFIRMED 규칙(요약)

- HOLD: 임시점유. 만료 정책은 MVP에서는 미도입(수동 전환 가정).

- CONFIRMED: 확정. 동일 기간 중복 방지 로직은 후속 단계에서 API로 처리.
