import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { JSDOM } from "jsdom";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import * as runtime from "@/shared/runtime";
import App from "./App";

const probeSuccessResponse = {
  channel: "sencha-inspector-runtime-v1",
  type: "runtime:probe-result",
  source: "background",
  result: {
    requestId: "req-1",
    ok: true,
    handledBy: "background",
    receivedAt: "2026-03-09T03:04:05.000Z",
    detail: "Background service worker responded.",
  },
} as const;

const runtimeErrorResponse = {
  channel: "sencha-inspector-runtime-v1",
  type: "runtime:error",
  source: "background",
  error: {
    code: "RUNTIME_FAILED",
    message: "runtime failed",
    source: "background",
    at: "2026-03-09T03:04:05.000Z",
  },
} as const;

describe("DevTools panel App", () => {
  let dom: JSDOM;

  // Work around jsdom+esbuild invariant issues in this WXT/Vitest environment.
  beforeAll(() => {
    dom = new JSDOM("<!doctype html><html><body></body></html>");
    vi.stubGlobal("window", dom.window);
    vi.stubGlobal("document", dom.window.document);
    vi.stubGlobal("navigator", dom.window.navigator);
    vi.stubGlobal("HTMLElement", dom.window.HTMLElement);
    vi.stubGlobal("Node", dom.window.Node);
    vi.stubGlobal("Event", dom.window.Event);
    vi.stubGlobal("MouseEvent", dom.window.MouseEvent);
    vi.stubGlobal("KeyboardEvent", dom.window.KeyboardEvent);
    vi.stubGlobal("getComputedStyle", dom.window.getComputedStyle);
  });

  afterAll(() => {
    dom.window.close();
    vi.unstubAllGlobals();
  });

  it("초기 렌더링 시 안내 문구를 표시한다", () => {
    const view = render(<App />);

    expect(
      view.getByText("Panel initialized. Click probe to test messaging."),
    ).toBeInTheDocument();
  });

  it("probe 성공 응답을 받으면 성공 상태를 표시한다", async () => {
    const sendRuntimeMessageSpy = vi
      .spyOn(runtime, "sendRuntimeMessage")
      .mockResolvedValue(probeSuccessResponse as never);

    const view = render(<App />);
    const user = userEvent.setup({ document: dom.window.document });

    await user.click(view.getByRole("button", { name: "Probe Runtime" }));

    expect(await view.findByText(/^Probe OK: background at /)).toBeVisible();
    expect(sendRuntimeMessageSpy).toHaveBeenCalledOnce();
  });

  it("runtime error 응답을 받으면 실패 코드와 메시지를 표시한다", async () => {
    vi.spyOn(runtime, "sendRuntimeMessage").mockResolvedValue(
      runtimeErrorResponse as never,
    );

    const view = render(<App />);
    const user = userEvent.setup({ document: dom.window.document });

    await user.click(view.getByRole("button", { name: "Probe Runtime" }));

    expect(
      await view.findByText("Probe failed: RUNTIME_FAILED - runtime failed"),
    ).toBeVisible();
  });

  it("runtime 요청 자체가 예외를 던지면 예외 메시지를 표시한다", async () => {
    vi.spyOn(runtime, "sendRuntimeMessage").mockRejectedValue(
      new Error("request failed"),
    );

    const view = render(<App />);
    const user = userEvent.setup({ document: dom.window.document });

    await user.click(view.getByRole("button", { name: "Probe Runtime" }));

    expect(await view.findByText("Probe failed: request failed")).toBeVisible();
  });

  it("unexpected response shape를 받으면 안내 문구를 표시한다", async () => {
    vi.spyOn(runtime, "sendRuntimeMessage").mockResolvedValue(
      undefined as never,
    );

    const view = render(<App />);
    const user = userEvent.setup({ document: dom.window.document });

    await user.click(view.getByRole("button", { name: "Probe Runtime" }));

    expect(
      await view.findByText("Probe returned an unexpected response shape."),
    ).toBeVisible();
  });

  it("non-Error reject를 받으면 기본 에러 문구를 표시한다", async () => {
    vi.spyOn(runtime, "sendRuntimeMessage").mockRejectedValue("boom");

    const view = render(<App />);
    const user = userEvent.setup({ document: dom.window.document });

    await user.click(view.getByRole("button", { name: "Probe Runtime" }));

    expect(
      await view.findByText("Probe failed: Unexpected runtime error."),
    ).toBeVisible();
  });
});
