# Exem Sencha Inspector

Exem Sencha Inspector는 Chrome DevTools 안에서 Sencha/ExtJS 기반 화면을 프레임 단위로 탐지하고, `Selected Frame` 기준으로 컴포넌트 구조와 런타임 신호를 추적하는 전용 디버깅 확장이다.

## 현재 상태

- WXT + React + TypeScript 기반 MV3 스캐폴드가 준비되어 있다.
- `devtools`, `background`, `content`, `injected` 엔트리포인트와 기본 runtime probe는 연결되어 있다.
- 실제 Sencha 탐지, 모니터링 adapter, 패널 UI 도메인 모델은 아직 구현 전이다.

## v1 목표

- Chrome DevTools `Sencha` panel
- Sencha frame 탐지와 frame switcher
- component tree / property inspector / inspect mode
- SQL monitor (`WS.SQLExec`, `WS.PluginFunction`, `WS.keepSQLExec`)
- `window.Comm`, `Repository`, network, console monitoring
- 최근 30초 `Timeline`, `Sequence View`, `Concurrency Warning`
- Cursor / WebStorm IDE integration

## 기준 레퍼런스 앱

- 대상 Sencha/ExtJS 애플리케이션은 루트 페이지와 하위 iframe이 함께 동작하는 구조까지 고려해 계측할 수 있어야 한다.
- 런타임 수집은 특정 화면 패치보다 전역 진입점 훅(`WS.*`, network API, `console`, global state`) 중심으로 설계하는 것을 기본 원칙으로 둔다.

## Repo Structure

- `entrypoints/devtools`: DevTools panel 등록과 bootstrap
- `entrypoints/devtools-panel`: React panel UI
- `entrypoints/content`: content script와 page bridge 시작점
- `entrypoints/injected.ts`: main-world instrumentation 진입점
- `entrypoints/background.ts`: MV3 service worker
- `shared`: runtime contract와 공용 타입
- `lib/monitoring-adapter`: 런타임 수집 계층

## Commands

```bash
nvm use
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm check
pnpm build
pnpm zip
```

ZIP artifact는 `.output/` 아래에 생성된다.

## Load In Chrome

1. `pnpm build`
2. `chrome://extensions` 열기
3. Developer mode 활성화
4. **Load unpacked** 클릭
5. `.output/chrome-mv3/` 선택
6. 대상 페이지의 DevTools에서 `Sencha` panel 확인

## Working Notes

- `Selected Frame`가 모든 인스펙션과 트리 조회의 기준이다.
- 모니터링 수집은 개별 화면 코드 패치가 아니라 전역 진입점 훅(`WS.*`, `fetch`, `XMLHttpRequest`, `$.ajax`, `console`, `Comm`, `Repository`) 기준으로 설계한다.
- cross-origin iframe은 감지와 안내까지만 보장하고, 완전 수집은 same-origin frame부터 처리한다.
