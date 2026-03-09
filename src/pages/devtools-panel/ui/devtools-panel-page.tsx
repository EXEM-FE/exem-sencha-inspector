import { MoonStar, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  createProbeMessage,
  isRuntimeErrorMessage,
  isRuntimeProbeResultMessage,
  sendRuntimeMessage,
} from "@/shared/runtime";
import { Badge } from "@/shared/ui/components/ui/badge";
import { Button } from "@/shared/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/components/ui/card";
import { ScrollArea } from "@/shared/ui/components/ui/scroll-area";
import { Separator } from "@/shared/ui/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/ui/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/ui/components/ui/tooltip";

const INITIAL_STATUS = "Panel initialized. Click probe to test messaging.";

const CURRENT_SCOPE = [
  "Runtime bridge boot/probe wiring",
  "Background, content, injected entrypoints",
  "Placeholder monitoring adapter",
] as const;

function ThemeToggleButton() {
  const { resolvedTheme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const currentTheme = resolvedTheme ?? "dark";
  const nextTheme = currentTheme === "dark" ? "light" : "dark";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label={
            isMounted ? `Switch to ${nextTheme} mode` : "Toggle theme"
          }
          onClick={() => setTheme(nextTheme)}
        >
          {isMounted && currentTheme === "dark" ? (
            <SunMedium className="size-4" />
          ) : (
            <MoonStar className="size-4" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="font-medium">
        {isMounted ? `Switch to ${nextTheme} mode` : "Toggle theme"}
      </TooltipContent>
    </Tooltip>
  );
}

function getStatusBadge(status: string) {
  if (status.startsWith("Probe OK:")) {
    return { label: "Connected", variant: "default" as const };
  }

  if (status.startsWith("Probe failed:")) {
    return { label: "Failure", variant: "destructive" as const };
  }

  if (status.includes("unexpected")) {
    return { label: "Unexpected", variant: "outline" as const };
  }

  return { label: "Ready", variant: "secondary" as const };
}

export function DevtoolsPanelPage() {
  const [status, setStatus] = useState(INITIAL_STATUS);

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

  const statusBadge = getStatusBadge(status);

  return (
    <main className="min-h-screen p-2 text-xs sm:p-3">
      <Card className="mx-auto w-full max-w-[860px] gap-0 bg-card/95 ring-border/80 shadow-lg shadow-background/40 supports-[backdrop-filter]:bg-card/88">
        <CardHeader className="gap-2 border-b border-border/80 pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-sm font-semibold tracking-tight sm:text-base">
                  Sencha Inspector
                </CardTitle>
                <Badge variant="secondary" className="font-medium">
                  Operator Console
                </Badge>
              </div>
              <CardDescription className="text-xs">
                DevTools extension scaffold (Issue #1)
              </CardDescription>
            </div>
            <ThemeToggleButton />
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-3">
          <Tabs defaultValue="status" className="w-full gap-2">
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="status">Probe Status</TabsTrigger>
              <TabsTrigger value="scope">Current Scope</TabsTrigger>
            </TabsList>

            <TabsContent value="status" className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Button type="button" size="sm" onClick={handleProbe}>
                  Probe Runtime
                </Button>
                <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
              </div>
              <Separator />
              <ScrollArea className="h-24 rounded-lg border border-border/70 bg-muted/30">
                <div className="p-2">
                  <p className="font-mono text-[11px] leading-relaxed text-foreground/95">
                    {status}
                  </p>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="scope" className="space-y-2">
              <Separator />
              <ScrollArea className="h-28 rounded-lg border border-border/70 bg-muted/30">
                <div className="p-2">
                  <ul className="space-y-1.5 pl-4 text-[11px] leading-relaxed text-muted-foreground">
                    {CURRENT_SCOPE.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
}
