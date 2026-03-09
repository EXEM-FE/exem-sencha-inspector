import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { JSDOM } from "jsdom";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
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
    dom = new JSDOM("<!doctype html><html><body></body></html>", {
      url: "https://example.test",
    });
    vi.stubGlobal("window", dom.window);
    vi.stubGlobal("document", dom.window.document);
    vi.stubGlobal("navigator", dom.window.navigator);
    vi.stubGlobal("HTMLElement", dom.window.HTMLElement);
    vi.stubGlobal("Node", dom.window.Node);
    vi.stubGlobal("Event", dom.window.Event);
    vi.stubGlobal("MouseEvent", dom.window.MouseEvent);
    vi.stubGlobal("KeyboardEvent", dom.window.KeyboardEvent);
    vi.stubGlobal("getComputedStyle", dom.window.getComputedStyle);

    const matchMediaMock = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    vi.stubGlobal("matchMedia", matchMediaMock);
    Object.defineProperty(dom.window, "matchMedia", {
      writable: true,
      value: matchMediaMock,
    });

    vi.stubGlobal(
      "ResizeObserver",
      class ResizeObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    Object.defineProperty(dom.window, "ResizeObserver", {
      writable: true,
      value: globalThis.ResizeObserver,
    });
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) =>
      dom.window.setTimeout(() => callback(Date.now()), 0),
    );
    vi.stubGlobal("cancelAnimationFrame", (id: number) =>
      dom.window.clearTimeout(id),
    );
    Object.defineProperty(dom.window, "requestAnimationFrame", {
      writable: true,
      value: globalThis.requestAnimationFrame,
    });
    Object.defineProperty(dom.window, "cancelAnimationFrame", {
      writable: true,
      value: globalThis.cancelAnimationFrame,
    });
  });

  afterAll(() => {
    dom.window.close();
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    dom.window.localStorage.clear();
  });

  it("초기 렌더링 시 안내 문구를 표시한다", () => {
    const view = render(<App />);

    expect(
      view.getByText("Panel initialized. Click probe to test messaging."),
    ).toBeInTheDocument();
  });

  it("probe 성공 응답을 받으면 성공 상태를 표시한다", async () => {
    const fixedProbeMessage: runtime.RuntimeProbeMessage = {
      channel: "sencha-inspector-runtime-v1",
      type: "runtime:probe",
      source: "devtools",
      request: {
        requestId: "fixed-request-id",
        issuedAt: "2026-03-09T03:04:05.000Z",
        target: "background",
      },
    };
    const createProbeMessageSpy = vi
      .spyOn(runtime, "createProbeMessage")
      .mockReturnValue(fixedProbeMessage);
    const sendRuntimeMessageSpy = vi
      .spyOn(runtime, "sendRuntimeMessage")
      .mockResolvedValue(probeSuccessResponse as never);

    const view = render(<App />);
    const user = userEvent.setup({ document: dom.window.document });

    await user.click(view.getByRole("button", { name: "Probe Runtime" }));

    expect(await view.findByText(/^Probe OK: background at /)).toBeVisible();
    expect(createProbeMessageSpy).toHaveBeenCalledWith(
      "devtools",
      "background",
    );
    expect(sendRuntimeMessageSpy).toHaveBeenCalledOnce();
    expect(sendRuntimeMessageSpy).toHaveBeenCalledWith(fixedProbeMessage);
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

  it("theme toggle 시 html class를 light로 전환한다", async () => {
    const view = render(<App />);
    const user = userEvent.setup({ document: dom.window.document });
    const html = dom.window.document.documentElement;

    const toggle = await view.findByRole("button", {
      name: /Switch to light mode|Toggle theme/i,
    });
    await user.click(toggle);

    await waitFor(() => {
      expect(html.classList.contains("light")).toBe(true);
    });
  });
});
