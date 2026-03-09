# Repo Agent Guide

## Goal

이 레포는 Chrome DevTools 안에서 Sencha/ExtJS 런타임을 분석하는 확장을 구현한다. `AGENTS.md`에는 이 목적을 안정적으로 유지하기 위한 commit-worthy한 작업 원칙만 남긴다.

## Documentation BP

- 설명은 기본적으로 한국어로 작성한다.
- 코드 식별자, 명령어, 로그, 고정 용어(`Selected Frame`, `Trace`, `Timeline`)는 원문을 유지한다.
- tracked 문서에는 로컬 절대 경로, 개인 작업 메모, 임시 계획, 외부 레포 탐색 기록을 넣지 않는다.
- `README.md`는 제품 개요와 실행 기준만 다루고, `AGENTS.md`는 장기적으로 유지할 규칙만 다룬다.

## Architecture BP

- `entrypoints/devtools`는 DevTools panel 등록과 bootstrap만 담당한다.
- `entrypoints/devtools-panel`은 UI 렌더링과 사용자 액션 처리에 집중한다.
- `entrypoints/background.ts`는 탭/프레임 세션, 버퍼, 이벤트 정규화, panel 연결의 중심 레이어로 유지한다.
- `entrypoints/content.ts`와 `entrypoints/injected.ts`는 페이지 런타임과 연결되는 bridge 및 instrumentation 레이어로 유지한다.
- `shared`에는 프레임 탐지, 모니터링 이벤트, trace, timeline, warning, settings 같은 공용 계약만 둔다.
- `lib/monitoring-adapter`는 제품별 관측 포인트를 감싸는 adapter 레이어로 유지한다.

## Instrumentation BP

- `Selected Frame`는 component tree, property panel, inspect mode, monitoring scope의 단일 기준값이어야 한다.
- 계측은 가능하면 전역 진입점 훅으로 수집한다. 특정 화면이나 특정 컴포넌트 패치에 의존하는 설계는 마지막 수단으로만 쓴다.
- main-world patch는 frame별 idempotent 해야 하고, 중복 주입 시 다시 감싸지 않도록 보장한다.
- same-origin frame을 우선 지원하고, cross-origin iframe은 실패를 숨기지 말고 제한 상태를 명시한다.
- 성능에 민감한 화면을 고려해 deep clone polling보다 이벤트 기반 또는 최소 범위 diff를 우선한다.

## Data Model BP

- raw event와 UI 표시 모델을 분리한다.
- 정규화는 한 번만 수행하고, `Timeline`, `Sequence View`, `Concurrency Warning`은 같은 normalized event 모델을 재사용한다.
- 버퍼 제한과 보존 정책은 중앙 저장소에서 강제한다. UI 레이어에서 개별적으로 자르지 않는다.
- background polling, auto refresh, 주기성 요청은 사용자 액션 기반 이벤트와 구분 가능한 메타데이터를 남긴다.

## Verification BP

- 마무리 전 최소 `pnpm lint`와 `pnpm typecheck`를 기준 검증으로 본다.
- instrumentation 변경 시에는 no-Sencha 페이지, single-frame 페이지, iframe 포함 페이지를 각각 확인한다.
- frame 선택, 중복 주입 방지, 버퍼 cap, cancel 흐름, panel reopen 복구는 회귀 포인트로 본다.

## Workflow BP

1. 공용 타입과 저장소 경계를 먼저 고정한다.
2. bridge와 instrumentation을 붙인다.
3. 정규화된 이벤트 모델을 검증한다.
4. 마지막에 panel UI를 넓힌다.
