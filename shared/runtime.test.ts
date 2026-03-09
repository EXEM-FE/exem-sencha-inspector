import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createBootMessage,
  createProbeMessage,
  createProbeResultMessage,
  createRuntimeError,
  isRuntimeBootMessage,
  isRuntimeErrorMessage,
  isRuntimeMessage,
  isRuntimeProbeMessage,
  isRuntimeProbeResultMessage,
  RUNTIME_CHANNEL,
  sendRuntimeMessage,
} from "@/shared/runtime";
import {
  mockRandomUUID,
  useFixedTime,
} from "@/test/helpers/runtime-test-helpers";

describe("shared/runtime", () => {
  beforeEach(() => {
    vi.spyOn(browser.runtime, "getManifest").mockReturnValue({
      version: "1.2.3-test",
    } as never);
  });

  it("boot 메시지를 생성하면 runtime 채널과 상태 정보를 포함한다", () => {
    useFixedTime("2026-03-09T01:02:03.000Z");

    const message = createBootMessage("background");

    expect(message).toEqual({
      channel: RUNTIME_CHANNEL,
      type: "runtime:boot",
      source: "background",
      status: {
        source: "background",
        startedAt: "2026-03-09T01:02:03.000Z",
        version: "1.2.3-test",
      },
    });
    expect(isRuntimeBootMessage(message)).toBe(true);
  });

  it("probe 메시지를 생성하면 request id와 target을 올바르게 포함한다", () => {
    useFixedTime("2026-03-09T03:04:05.000Z");
    mockRandomUUID("11111111-1111-4111-8111-111111111111");

    const message = createProbeMessage("devtools", "background");

    expect(message).toEqual({
      channel: RUNTIME_CHANNEL,
      type: "runtime:probe",
      source: "devtools",
      request: {
        requestId: "11111111-1111-4111-8111-111111111111",
        issuedAt: "2026-03-09T03:04:05.000Z",
        target: "background",
      },
    });
    expect(isRuntimeProbeMessage(message)).toBe(true);
  });

  it("probe result와 runtime error 메시지 타입 가드를 정확히 판별한다", () => {
    useFixedTime("2026-03-09T03:04:05.000Z");

    const request = {
      requestId: "req-1",
      issuedAt: "2026-03-09T03:04:05.000Z",
      target: "background" as const,
    };
    const probeResult = createProbeResultMessage("background", request, "ok");
    const runtimeError = createRuntimeError(
      "background",
      "RUNTIME_FAILED",
      "failed",
    );

    expect(isRuntimeProbeResultMessage(probeResult)).toBe(true);
    expect(isRuntimeErrorMessage(runtimeError)).toBe(true);
    expect(isRuntimeMessage(probeResult)).toBe(true);
    expect(isRuntimeMessage(runtimeError)).toBe(true);

    const invalidProbeMessage = {
      ...createProbeMessage("devtools", "background"),
      request: {
        requestId: "req-2",
        issuedAt: "2026-03-09T03:04:05.000Z",
        target: "invalid-target",
      },
    };
    expect(isRuntimeProbeMessage(invalidProbeMessage)).toBe(false);
    expect(isRuntimeMessage(invalidProbeMessage)).toBe(false);
  });

  it("sendRuntimeMessage는 browser.runtime.sendMessage에 위임한다", async () => {
    mockRandomUUID("22222222-2222-4222-8222-222222222222");
    useFixedTime("2026-03-09T03:04:05.000Z");

    const request = createProbeMessage("devtools", "background");
    const response = createProbeResultMessage("background", request.request);
    const sendMessageSpy = vi
      .spyOn(browser.runtime, "sendMessage")
      .mockResolvedValue(response as never);

    const result = await sendRuntimeMessage(request);

    expect(sendMessageSpy).toHaveBeenCalledOnce();
    expect(sendMessageSpy).toHaveBeenCalledWith(request);
    expect(result).toEqual(response);
  });
});
