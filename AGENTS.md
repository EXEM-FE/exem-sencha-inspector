# Repo Agent Guide

## Goal

이 레포는 Chrome DevTools 안에서 Sencha/ExtJS 런타임을 분석하는 확장을 만든다.
`AGENTS.md`는 에이전트가 반복적으로 따라야 할 작업 규칙만 남긴다.
제품 소개, 설치법, 로드맵, 임시 설계 메모는 `README.md`나 별도 문서로 분리한다.

## Document Rules

- 설명은 기본적으로 한국어로 작성한다.
- 코드 식별자, 명령어, 로그, 고정 용어(`Selected Frame`, `Trace`, `Timeline`)는 원문을 유지한다.
- `README.md`는 제품 개요와 실행 기준을 다루고, `AGENTS.md`는 durable agent rules만 다룬다.
- tracked 문서에는 로컬 절대 경로, 개인 메모, 임시 계획, 외부 조사 로그, 작업 백로그를 남기지 않는다.
- 문서는 현재 구현 설명보다 앞으로도 유지할 규칙을 우선한다.

## Structure Rules

- `entrypoints/*`와 `wxt.config.ts`는 WXT 규약에 맞는 shell로 유지한다.
- `entrypoints/*`에는 panel 등록, bootstrap, injection, browser API wiring만 두고 도메인 상태, 이벤트 정규화, 대형 UI 조립 로직은 넣지 않는다.
- 새 로직은 점진적으로 FSD 레이어 기준 `src/app`, `src/pages`, `src/widgets`, `src/features`, `src/entities`, `src/shared`에 배치한다.
- `src/app`은 컨텍스트 조립과 전역 bootstrap, `src/pages`는 DevTools 화면 단위, `src/widgets`는 panel 대블록, `src/features`는 사용자 액션과 유스케이스, `src/entities`는 frame/component/monitoring-event/warning 같은 도메인, `src/shared`는 브라우저 API 래퍼, 런타임 계약, config, 공용 유틸을 담당한다.
- 새 top-level `lib/*`는 추가하지 않는다. 기존 `lib/*`와 루트 `shared/*`는 과도기 경로로 보고, 국소 수정만 허용하며 새 공용 코드를 중복 정의하지 않는다.
- FSD import 규칙을 따른다. 상위 레이어는 하위 레이어만 참조하고, 같은 레이어 slice 간 직접 import는 피하며, 외부 노출은 `index.ts` public API를 우선한다.
- deprecated `processes` 레이어는 도입하지 않는다.

## Extension Guardrails

- `Selected Frame`는 component tree, property inspector, inspect mode, monitoring scope의 단일 source of truth여야 한다.
- 런타임 메시지 채널, request/response shape, type guard는 한 곳의 공용 계약에서만 관리하고 컨텍스트별로 재정의하지 않는다.
- `background`는 세션, 버퍼, 정규화 orchestration 중심으로 유지하고, `content`는 bridge와 injection orchestration, `injected`는 page runtime hook과 raw event emission, `devtools-panel`은 UI composition과 사용자 액션 처리에 집중한다.
- 계측은 화면별 임시 패치보다 전역 진입점 훅(`WS.*`, network APIs, `console`, `Comm`, `Repository`)을 우선한다.
- main-world injection은 frame 단위로 idempotent 해야 하며, 중복 주입 시 다시 감싸지 않도록 보장한다.
- same-origin frame을 우선 지원하고, cross-origin iframe 제한은 숨기지 말고 상태나 안내로 드러낸다.
- raw event와 UI view model을 분리하고, 정규화는 한 번만 수행해 `Timeline`, `Sequence View`, `Concurrency Warning` 등에서 재사용한다.
- 버퍼 cap과 보존 정책은 중앙 runtime state에서 강제하고, widget이나 page에서 개별적으로 자르지 않는다.

## Verification And Workflow

- 작업 마무리 전 기본 검증은 `pnpm lint`와 `pnpm typecheck`다.
- `entrypoints/*`, `wxt.config.ts`, manifest wiring, injected script loading, runtime messaging을 건드렸다면 `pnpm build`까지 확인한다.
- instrumentation이나 frame 로직을 바꿨다면 no-Sencha page, single-frame page, iframe page, panel reopen, 중복 주입 방지, frame 전환 복구, buffer cap 동작을 회귀 포인트로 본다.
- 권장 작업 순서는 공용 계약과 상태 경계를 먼저 고정하고, 그다음 bridge/instrumentation, 그다음 정규화 이벤트 모델, 마지막에 DevTools panel UI를 확장하는 흐름이다.
- FSD 전환은 한 번에 전체 이동하지 말고, 하나의 유스케이스나 도메인 흐름을 끝까지 옮긴 뒤 다음 흐름으로 넘어간다.
