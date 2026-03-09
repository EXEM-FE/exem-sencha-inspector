import { describe, expect, it } from "vitest";
import { createNoopMonitoringAdapter } from "@/lib/monitoring-adapter";

describe("monitoring-adapter/noop", () => {
  it("noop adapter는 이름과 start/stop 계약을 유지한다", () => {
    const adapter = createNoopMonitoringAdapter();

    expect(adapter.name).toBe("noop-monitoring-adapter");
    expect(() => adapter.start()).not.toThrow();
    expect(() => adapter.stop()).not.toThrow();
  });
});
