import { injectScript } from "wxt/utils/inject-script";
import { createNoopMonitoringAdapter } from "@/lib/monitoring-adapter";
import {
  createBootMessage,
  createProbeResultMessage,
  isRuntimeProbeMessage,
  sendRuntimeMessage,
} from "@/shared/runtime";

export default defineContentScript({
  matches: ["<all_urls>"],
  async main() {
    browser.runtime.onMessage.addListener((message: unknown) => {
      if (!isRuntimeProbeMessage(message)) {
        return undefined;
      }

      if (message.request.target !== "content") {
        return undefined;
      }

      return createProbeResultMessage(
        "content",
        message.request,
        "Content script responded from inspected page context.",
      );
    });

    const adapter = createNoopMonitoringAdapter();
    adapter.start();

    try {
      await injectScript("/injected.js");
    } catch (error) {
      console.warn(
        "[sencha-inspector] Failed to inject main-world script.",
        error,
      );
    }

    try {
      await sendRuntimeMessage(createBootMessage("content"));
    } catch (error) {
      console.error(
        "[sencha-inspector] Failed to send content boot message.",
        error,
      );
    }
  },
});
