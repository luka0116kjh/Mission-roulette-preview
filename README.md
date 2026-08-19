# Mission Roulette

카테고리를 고르고 버튼을 누르면 오늘 할 랜덤 미션을 뽑아주는 정적 웹앱.
서버·DB·로그인·외부 API 없이 **React + TypeScript + Vite**만으로 동작하며, 기록은 `localStorage`에 저장한다.

## 실행

```bash
npm install
npm run dev      # 개발 서버
npm run build    # 타입체크 + 정적 빌드 → dist/
npm run preview  # 빌드 결과 확인
```

## 배포

**레포에 올린 소스 그대로는 화면이 뜨지 않는다.** `index.html`이 `/src/main.tsx`를 참조하는데 브라우저는 TypeScript/JSX를 실행하지 못한다. 반드시 `npm run build`로 만든 `dist/`를 배포해야 한다.

### GitHub Pages (자동)

`.github/workflows/deploy.yml`이 들어 있다. `main` 브랜치에 push하면 빌드 후 자동 배포된다.

1. 레포를 만들고 push한다.
   ```bash
   git init && git add . && git commit -m "init"
   git branch -M main
   git remote add origin https://github.com/<사용자명>/<레포명>.git
   git push -u origin main
   ```
2. 레포 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 바꾼다.
   (기본값인 *Deploy from a branch*로 두면 소스가 그대로 서빙돼서 빈 화면이 뜬다.)
3. Actions 탭에서 워크플로가 끝나면 `https://<사용자명>.github.io/<레포명>/`에서 열린다.

`vite.config.ts`의 `base: "./"` 덕분에 자산이 상대 경로(`./assets/...`)로 출력되므로, 레포 이름이 무엇이든 하위 경로에서 그대로 동작한다.

### Vercel

레포를 import하면 Vite로 자동 인식된다. Build Command `npm run build`, Output Directory `dist`.

## 구조

```text
src/
├─ components/
│  ├─ Header.tsx             제목·날짜
│  ├─ CategorySelector.tsx   카테고리 칩
│  ├─ Roulette.tsx           세로 릴 애니메이션
│  ├─ MissionCard.tsx        결과 카드 (희귀도/난이도/버튼)
│  ├─ MissionComplete.tsx    완료 화면
│  └─ Stats.tsx              오늘/전체/연속 기록
├─ data/missions.ts          미션 60개 (카테고리당 12개)
├─ types/mission.ts          타입 + 카테고리/희귀도 메타
├─ utils/randomMission.ts    희귀도 가중 추첨, 릴 생성
├─ utils/storage.ts          localStorage, 날짜 리셋, streak
├─ App.tsx                   idle → rolling → result → complete
└─ index.css                 디자인 토큰 + 전체 스타일
```

## 동작 규칙

- **추첨**: 희귀도를 먼저 뽑고(`COMMON 60 / RARE 25 / EPIC 12 / LEGENDARY 3`), 그 등급 안에서 미션 하나를 고른다. 카테고리에 없는 등급은 후보에서 빼고 가중치를 다시 정규화한다.
- **중복 방지**: 직전에 나온 미션 ID는 다음 추첨에서 제외한다. 후보가 하나뿐이면 제외를 포기한다.
- **중복 클릭 방지**: `isRolling` 동안 뽑기 버튼과 카테고리 버튼이 비활성화된다.
- **날짜 처리**: 앱을 열 때 저장된 날짜와 오늘을 비교해 `todayCompleted`를 0으로 되돌린다. 하루를 건너뛰면 `streak`도 0이 된다. 전체 완료 횟수와 최고 연속 기록은 유지된다.
- **저장 실패 대비**: `localStorage`를 쓸 수 없는 환경(사생활 보호 모드, 샌드박스 iframe)에서는 자동으로 메모리 저장소로 대체돼 앱이 죽지 않는다.

## 저장 형식 (`mission-roulette:stats`)

```json
{
  "totalCompleted": 27,
  "todayCompleted": 3,
  "lastCompletedDate": "2026-08-19",
  "streak": 4,
  "bestStreak": 9
}
```

## 미션 추가하기

`src/data/missions.ts`에 항목을 하나 더 넣으면 끝이다. `id`만 겹치지 않게 하면 된다.

```ts
{
  id: 61,
  category: "development",
  title: "새로운 미션",
  description: "한 줄 설명.",
  difficulty: 3,
  rarity: "rare",
}
```
