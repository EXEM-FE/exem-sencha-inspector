import { ThemeProvider } from "@/app/providers/theme-provider";
import { DevtoolsPanelPage } from "@/pages/devtools-panel/ui/devtools-panel-page";
import { TooltipProvider } from "@/shared/ui/components/ui/tooltip";

export default function DevtoolsPanelRoot() {
  return (
    <ThemeProvider>
      <TooltipProvider delayDuration={120}>
        <DevtoolsPanelPage />
      </TooltipProvider>
    </ThemeProvider>
  );
}
