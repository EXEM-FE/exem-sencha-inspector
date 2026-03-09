export default defineUnlistedScript(() => {
  window.dispatchEvent(
    new CustomEvent("sencha-inspector:injected-ready", {
      detail: {
        at: new Date().toISOString(),
      },
    }),
  );
});
