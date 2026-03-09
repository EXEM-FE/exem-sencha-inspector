export type RuntimeSource = "background" | "content" | "devtools";

export interface ExtensionRuntimeStatus {
  source: RuntimeSource;
  startedAt: string;
  version: string;
}

export interface ProbeRequest {
  requestId: string;
  target: RuntimeSource;
  issuedAt: string;
}

export interface ProbeResult {
  requestId: string;
  ok: boolean;
  handledBy: RuntimeSource;
  receivedAt: string;
  detail?: string;
}

export interface BridgeError {
  code: string;
  message: string;
  source: RuntimeSource;
  at: string;
  cause?: string;
}
