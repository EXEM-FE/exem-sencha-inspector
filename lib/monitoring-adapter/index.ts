export interface MonitoringAdapter {
  readonly name: string;
  start(): void;
  stop(): void;
}

export function createNoopMonitoringAdapter(): MonitoringAdapter {
  return {
    name: "noop-monitoring-adapter",
    start() {
      // Placeholder adapter for Issue #1 scaffolding.
    },
    stop() {
      // Placeholder adapter for Issue #1 scaffolding.
    },
  };
}
