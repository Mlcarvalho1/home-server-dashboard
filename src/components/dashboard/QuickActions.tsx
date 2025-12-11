import { Power, RefreshCw, Terminal, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuickActionsProps {
  className?: string;
}

const actions = [
  { icon: RefreshCw, label: "Restart", variant: "secondary" as const },
  { icon: Terminal, label: "Terminal", variant: "secondary" as const },
  { icon: Settings, label: "Settings", variant: "secondary" as const },
  { icon: Power, label: "Shutdown", variant: "destructive" as const },
];

export function QuickActions({ className }: QuickActionsProps) {
  return (
    <div
      className={cn(
        "glass-card p-4 opacity-0 animate-fade-in",
        className
      )}
      style={{ animationDelay: "600ms" }}
    >
      <h3 className="text-sm font-semibold text-muted-foreground mb-3">
        Quick Actions
      </h3>
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant={action.variant}
            size="sm"
            className={cn(
              "gap-2",
              action.variant === "secondary" &&
                "bg-secondary/50 hover:bg-secondary border border-border/50"
            )}
          >
            <action.icon className="w-4 h-4" />
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
