import {
  createBootMessage,
  createProbeResultMessage,
  createRuntimeError,
  isRuntimeBootMessage,
  isRuntimeProbeMessage,
} from "@/shared/runtime";

export default defineBackground(() => {
  const backgroundBootMessage = createBootMessage("background");

  browser.runtime.onMessage.addListener(async (message: unknown) => {
    try {
      if (isRuntimeBootMessage(message)) {
        return backgroundBootMessage;
      }

      if (!isRuntimeProbeMessage(message)) {
        return undefined;
      }

      if (message.request.target !== "background") {
        return undefined;
      }

      return createProbeResultMessage(
        "background",
        message.request,
        "Background service worker responded.",
      );
    } catch (error) {
      return createRuntimeError(
        "background",
        "BACKGROUND_RUNTIME_HANDLER_FAILED",
        "Background runtime handler failed.",
        error instanceof Error ? error.message : "unknown",
      );
    }
  });
});
