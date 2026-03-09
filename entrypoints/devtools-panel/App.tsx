import { useState } from "react";
import {
  createProbeMessage,
  isRuntimeErrorMessage,
  isRuntimeProbeResultMessage,
  sendRuntimeMessage,
} from "@/shared/runtime";

function App() {
  const [status, setStatus] = useState(
    "Panel initialized. Click probe to test messaging.",
  );

  const handleProbe = async () => {
    setStatus("Sending background probe...");

    try {
      const response = await sendRuntimeMessage(
        createProbeMessage("devtools", "background"),
      );

      if (isRuntimeProbeResultMessage(response)) {
        setStatus(
          `Probe OK: ${response.result.handledBy} at ${new Date(response.result.receivedAt).toLocaleTimeString()}`,
        );
        return;
      }

      if (isRuntimeErrorMessage(response)) {
        setStatus(
          `Probe failed: ${response.error.code} - ${response.error.message}`,
        );
        return;
      }

      setStatus("Probe returned an unexpected response shape.");
    } catch (error) {
      setStatus(
        `Probe failed: ${error instanceof Error ? error.message : "Unexpected runtime error."}`,
      );
    }
  };

  return (
    <main className="panel-root">
      <header>
        <h1>Sencha Inspector</h1>
        <p>DevTools extension scaffold (Issue #1)</p>
      </header>
      <section className="panel-card">
        <button type="button" onClick={handleProbe}>
          Probe Runtime
        </button>
        <p>{status}</p>
      </section>
      <section className="panel-note">
        <h2>Current Scope</h2>
        <ul>
          <li>Runtime bridge boot/probe wiring</li>
          <li>Background, content, injected entrypoints</li>
          <li>Placeholder monitoring adapter</li>
        </ul>
      </section>
    </main>
  );
}

export default App;
