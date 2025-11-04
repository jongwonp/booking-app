# SRS 요약 — 숙소 예약 웹앱 (MVP)

## 1. 개요

- 목적: 검색 → 가용성 확인 → 임시 홀드 → 예약 확정까지의 핵심 흐름 제공
- 대상: 게스트, 관리자
- 범위(MVP): 로그인/회원가입, 숙소 목록/상세, 달력 가용성, 임시 홀드(만료), 예약 확정, 마이페이지, 관리자(숙소/요금/차단)
- 비범위: 실결제, 복잡한 쿠폰/환불, 다국어/다통화

## 2. 용어

- Reservation: HOLD(임시)/CONFIRMED(확정)/CANCELLED(취소)
- Hold: 선택 기간을 TTL 동안 점유
- CalendarBlock: 운영자 수동 차단
- PriceRule: 기간별 요금 덮어쓰기

## 3. 권한

- USER: 검색·가용성·홀드·확정·내 예약 조회/취소
- ADMIN: 숙소/이미지/요금 규칙/캘린더 차단 CRUD

## 4. 유스케이스(요약)

- UC-01 검색 & 가용성: 날짜/인원 입력 → 가능 여부·예상 금액 확인
- UC-02 임시 홀드: 가능 시 HOLD 생성(TTL)
- UC-03 예약 확정: 확인 후 확정(모의 결제 가정)
- UC-04 예약 취소: 단순 취소 처리
- UC-05 마이페이지: 내 예약 목록 관리
- UC-06 관리자: 숙소/요금/차단 관리

## 5. 기능 요구사항(FR) + 수락기준(AC)

- FR-01 목록·상세(M): 목록 필터/페이지네이션, 상세 이미지/설명/요약 요금  
  AC: 목록 페이지네이션 정상, 상세 이미지 캐러셀 동작
- FR-02 가용성(M): CONFIRMED/HOLD/Block과 겹치면 불가  
  AC: 경계값(체크아웃=타 예약 체크인) 통과, 불가 사유 표시
- FR-03 임시 홀드(M): Reservation(HOLD) + `holdExpiresAt` 설정, TTL 후 자동 만료  
  AC: TTL 동안 타 사용자는 해당 기간 예약 불가, 만료 시 해제
- FR-04 예약 확정(M): 확정 시 CONFIRMED 전이, 총액 저장  
  AC: 동시 요청 경쟁 시 정확히 1건만 확정
- FR-05 예약 취소(S): 사용자가 취소 가능(환불 정책은 범위 외)  
  AC: 상태 CANCELLED, 가용성 즉시 갱신
- FR-06 마이페이지(M): 내 예약(HOLD/CONFIRMED/CANCELLED) 조회·취소  
  AC: 상태/기간/숙소명 표시, 취소 버튼 제공
- FR-07 관리자-숙소 CRUD(M): 기본정보/가격/최대인원/위치/이미지  
  AC: 최소 1장 이미지, 정렬 가능
- FR-08 관리자-요금 규칙(S): 기간별 가격 덮어쓰기(겹침 시 최신 생성 우선)  
  AC: 총액 계산 시 반영
- FR-09 관리자-캘린더 차단(M): 특정 기간 Block  
  AC: 가용성 연산에서 불가 처리
- FR-10 인증/세션(M): 이메일+비밀번호 로그인  
  AC: 보호 라우트 접근 통제, 비밀번호 해시 저장

## 6. 비기능 요구사항(NFR)

- 성능(M): 목록 첫 화면 LCP ≤ 2.5s, SSR TTFB p95 ≤ 800ms(샘플 데이터)
- 보안(M): 비밀번호 해시, rate limit, 입력 검증
- 운영(S): CI→배포 자동화 및 롤백 가능
- 접근성(S): 색 대비, 대체 텍스트, 키보드 내비게이션
- 관측(S): 에러 수집, 기본 페이지 뷰 집계

## 7. 비즈니스 규칙(BR)

- BR-01 요금: 기본가 + 시즌가(있으면) × 숙박일수
- BR-02 겹침 판정: (checkIn < 기존.checkOut) AND (checkOut > 기존.checkIn)
- BR-03 홀드 TTL: 15분(초기값), 만료 배치/크론으로 정리
- BR-04 취소: 단순 취소(환불/수수료 정책은 범위 외)

## 8. 데이터 모델(요약)

- User, Listing, ListingImage, PriceRule, CalendarBlock, Reservation

## 9. 제약/가정

- 단일 재고(한 객실) 시나리오, 서버/DB UTC 기준, 결제는 모의 처리

## 10. 테스트(요약)

- TS-01 경계값 가용성: 체크아웃=타 예약 체크인 → 가능
- TS-02 동시 확정 경쟁: 정확히 1건만 CONFIRMED
- TS-03 홀드 만료: TTL 경과 시 자동 해제 및 가용성 갱신

## 11. API(요약)

- GET /api/listings, GET /api/listings/:id
- GET /api/availability?listingId&checkIn&checkOut
- POST /api/holds
- POST /api/reservations/:id/confirm
- POST /api/reservations/:id/cancel
- 인증: POST /api/auth/signup, POST /api/auth/login
- 관리자: listings/price-rules/blocks CRUD
