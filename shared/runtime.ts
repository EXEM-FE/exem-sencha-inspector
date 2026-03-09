import type {
  BridgeError,
  ExtensionRuntimeStatus,
  ProbeRequest,
  ProbeResult,
  RuntimeSource,
} from "@/shared/types";

export const RUNTIME_CHANNEL = "sencha-inspector-runtime-v1" as const;

const RUNTIME_SOURCES: RuntimeSource[] = ["background", "content", "devtools"];

type RuntimeRecord = Record<string, unknown>;

export type RuntimeBootMessage = {
  channel: typeof RUNTIME_CHANNEL;
  type: "runtime:boot";
  source: RuntimeSource;
  status: ExtensionRuntimeStatus;
};

export type RuntimeProbeMessage = {
  channel: typeof RUNTIME_CHANNEL;
  type: "runtime:probe";
  source: RuntimeSource;
  request: ProbeRequest;
};

export type RuntimeProbeResultMessage = {
  channel: typeof RUNTIME_CHANNEL;
  type: "runtime:probe-result";
  source: RuntimeSource;
  result: ProbeResult;
};

export type RuntimeErrorMessage = {
  channel: typeof RUNTIME_CHANNEL;
  type: "runtime:error";
  source: RuntimeSource;
  error: BridgeError;
};

export type RuntimeMessage =
  | RuntimeBootMessage
  | RuntimeProbeMessage
  | RuntimeProbeResultMessage
  | RuntimeErrorMessage;

export type RuntimeRequestMessage =
  | RuntimeBootMessage
  | RuntimeProbeMessage
  | RuntimeErrorMessage;

type RuntimeResponseMap = {
  "runtime:boot": RuntimeBootMessage | RuntimeErrorMessage | undefined;
  "runtime:probe": RuntimeProbeResultMessage | RuntimeErrorMessage | undefined;
  "runtime:error": undefined;
};

export function createRuntimeStatus(
  source: RuntimeSource,
): ExtensionRuntimeStatus {
  return {
    source,
    startedAt: new Date().toISOString(),
    version: browser.runtime.getManifest().version,
  };
}

export function createBootMessage(source: RuntimeSource): RuntimeBootMessage {
  return {
    channel: RUNTIME_CHANNEL,
    type: "runtime:boot",
    source,
    status: createRuntimeStatus(source),
  };
}

export function createProbeMessage(
  source: RuntimeSource,
  target: RuntimeSource,
): RuntimeProbeMessage {
  return {
    channel: RUNTIME_CHANNEL,
    type: "runtime:probe",
    source,
    request: {
      requestId: crypto.randomUUID(),
      issuedAt: new Date().toISOString(),
      target,
    },
  };
}

export function createProbeResultMessage(
  source: RuntimeSource,
  request: ProbeRequest,
  detail?: string,
): RuntimeProbeResultMessage {
  return {
    channel: RUNTIME_CHANNEL,
    type: "runtime:probe-result",
    source,
    result: {
      requestId: request.requestId,
      ok: true,
      handledBy: source,
      receivedAt: new Date().toISOString(),
      detail,
    },
  };
}

export function createRuntimeError(
  source: RuntimeSource,
  code: string,
  message: string,
  cause?: string,
): RuntimeErrorMessage {
  return {
    channel: RUNTIME_CHANNEL,
    type: "runtime:error",
    source,
    error: {
      code,
      message,
      source,
      at: new Date().toISOString(),
      cause,
    },
  };
}

function isRecord(value: unknown): value is RuntimeRecord {
  return typeof value === "object" && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isRuntimeSource(value: unknown): value is RuntimeSource {
  return isString(value) && RUNTIME_SOURCES.includes(value as RuntimeSource);
}

function isExtensionRuntimeStatus(
  value: unknown,
): value is ExtensionRuntimeStatus {
  if (!isRecord(value)) {
    return false;
  }
  return (
    isRuntimeSource(value.source) &&
    isString(value.startedAt) &&
    isString(value.version)
  );
}

function isProbeRequest(value: unknown): value is ProbeRequest {
  if (!isRecord(value)) {
    return false;
  }
  return (
    isString(value.requestId) &&
    isRuntimeSource(value.target) &&
    isString(value.issuedAt)
  );
}

function isProbeResult(value: unknown): value is ProbeResult {
  if (!isRecord(value)) {
    return false;
  }
  return (
    isString(value.requestId) &&
    typeof value.ok === "boolean" &&
    isRuntimeSource(value.handledBy) &&
    isString(value.receivedAt)
  );
}

function isBridgeError(value: unknown): value is BridgeError {
  if (!isRecord(value)) {
    return false;
  }
  return (
    isString(value.code) &&
    isString(value.message) &&
    isRuntimeSource(value.source) &&
    isString(value.at)
  );
}

function hasBaseRuntimeFields(value: unknown): value is RuntimeRecord & {
  channel: typeof RUNTIME_CHANNEL;
  source: RuntimeSource;
  type: RuntimeMessage["type"];
} {
  if (!isRecord(value)) {
    return false;
  }
  if (value.channel !== RUNTIME_CHANNEL || !isRuntimeSource(value.source)) {
    return false;
  }
  return (
    value.type === "runtime:boot" ||
    value.type === "runtime:probe" ||
    value.type === "runtime:probe-result" ||
    value.type === "runtime:error"
  );
}

export function isRuntimeBootMessage(
  value: unknown,
): value is RuntimeBootMessage {
  if (!hasBaseRuntimeFields(value) || value.type !== "runtime:boot") {
    return false;
  }
  if (!isExtensionRuntimeStatus(value.status)) {
    return false;
  }
  return value.status.source === value.source;
}

export function isRuntimeProbeMessage(
  value: unknown,
): value is RuntimeProbeMessage {
  if (!hasBaseRuntimeFields(value) || value.type !== "runtime:probe") {
    return false;
  }
  return isProbeRequest(value.request);
}

export function isRuntimeProbeResultMessage(
  value: unknown,
): value is RuntimeProbeResultMessage {
  if (!hasBaseRuntimeFields(value) || value.type !== "runtime:probe-result") {
    return false;
  }
  return isProbeResult(value.result);
}

export function isRuntimeErrorMessage(
  value: unknown,
): value is RuntimeErrorMessage {
  if (!hasBaseRuntimeFields(value) || value.type !== "runtime:error") {
    return false;
  }
  return isBridgeError(value.error);
}

export function isRuntimeMessage(value: unknown): value is RuntimeMessage {
  return (
    isRuntimeBootMessage(value) ||
    isRuntimeProbeMessage(value) ||
    isRuntimeProbeResultMessage(value) ||
    isRuntimeErrorMessage(value)
  );
}

export async function sendRuntimeMessage<
  TType extends RuntimeRequestMessage["type"],
>(
  message: Extract<RuntimeRequestMessage, { type: TType }>,
): Promise<RuntimeResponseMap[TType]> {
  return browser.runtime.sendMessage(message) as Promise<
    RuntimeResponseMap[TType]
  >;
}
