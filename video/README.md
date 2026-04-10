# Video Production — 사장 될 결심

영상 제작용 폴더입니다.

## 구조

```
video/
├── scripts/         # 영상 스크립트 (대본)
├── assets/          # 영상에 사용할 이미지, 음악 등
├── output/          # 최종 영상 파일
├── storyboards/     # 스토리보드
└── README.md
```

## 제작 도구

### 1. 스크린 레코딩 (앱 시연)
- 앱 화면 녹화: Puppeteer `page.screencast()` 또는 FFmpeg
- 모바일 목업 씌우기: 아이폰 프레임 위에 녹화 영상 합성

### 2. 카드뉴스 → 영상 변환
- `card-news/output/` 의 카드 이미지를 순서대로 이어붙이기
- FFmpeg: `ffmpeg -framerate 0.5 -i card_%02d.png -vf "scale=1080:1080" -c:v libx264 output.mp4`

### 3. 자동 생성 스크립트
```bash
# 카드뉴스 이미지를 3초 간격 슬라이드쇼 영상으로
ffmpeg -framerate 1/3 -pattern_type glob -i 'card-news/output/*.png' \
  -vf "scale=1080:1080:force_original_aspect_ratio=decrease,pad=1080:1080:(ow-iw)/2:(oh-ih)/2" \
  -c:v libx264 -pix_fmt yuv420p video/output/slideshow.mp4

# 앱 시연 녹화 (Puppeteer)
node app/scripts/record-demo.mjs
```

## 영상 기획

### 숏폼 (30초 릴스/숏츠)
- Hook: "치킨집 하면 월 얼마 벌까?" (3초)
- 앱 시연: 빠르게 입력 → 결과 (15초)
- 보스카드 결과: "건물주 벤츠 뽑아주는 1등 공신" (5초)
- CTA: "토스에서 무료로 해보세요" (3초)

### 롱폼 (2-3분)
- 자영업 현실 데이터 + 앱 상세 시연
- 업종별 비교 (치킨 vs 카페 vs 편의점)
