import {
  createBootMessage,
  createProbeMessage,
  sendRuntimeMessage,
} from "@/shared/runtime";

const DEVTOOLS_PANEL_TITLE = "Sencha";
const DEVTOOLS_PANEL_ICON = "/icon/16.png";
const DEVTOOLS_PANEL_PAGE = "devtools-panel.html";

browser.devtools.panels.create(
  DEVTOOLS_PANEL_TITLE,
  DEVTOOLS_PANEL_ICON,
  DEVTOOLS_PANEL_PAGE,
  () => undefined,
);

void bootstrapDevtoolsRuntime();

async function bootstrapDevtoolsRuntime(): Promise<void> {
  try {
    await sendRuntimeMessage(createBootMessage("devtools"));
    await sendRuntimeMessage(createProbeMessage("devtools", "background"));

    const inspectedTabId = browser.devtools.inspectedWindow.tabId;
    if (inspectedTabId < 0) {
      return;
    }

    try {
      await browser.tabs.sendMessage(
        inspectedTabId,
        createProbeMessage("devtools", "content"),
      );
    } catch (error) {
      console.warn(
        "[sencha-inspector] Content probe skipped: tab messaging is unavailable.",
        error,
      );
    }
  } catch (error) {
    console.error(
      "[sencha-inspector] DevTools runtime bootstrap failed.",
      error,
    );
  }
}
