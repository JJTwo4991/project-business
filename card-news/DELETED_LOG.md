=== 삭제된 잘못된 데이터 기록 ===

## 삭제 일시: 2026-04-12 13:33

### 잘못된 업종 출력물 (앱에 존재하지 않는 업종)
- output/samgyup/ (10파일)
- output/fruit/ (10파일)
- output/flower/ (10파일)
- output/tteok/ (10파일)
- output/pilates/ (10파일)

### 잘못된 루트 출력물 (구버전 데이터)
- output/v3_ad_card_01.png
- output/v4_receipt_card_01.png

### 잘못된 템플릿
- templates/card_news_template.md
- templates/video_shorts_template.md

### 이유
- 삼겹살/과일/꽃/떡볶이/필라테스: businessTypes.ts에 존재하지 않는 업종
- 루트 출력물: 잘못된 수치(9800원/45명/36%/84만 등)로 생성된 파일
- v3-ad/v4-receipt: 사용하지 않는 템플릿
- card_news_template.md/video_shorts_template.md: 구버전 수치 포함
