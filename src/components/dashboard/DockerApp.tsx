import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

export type DockerStatus = "running" | "stopped" | "paused";

interface DockerAppProps {
  name: string;
  icon: string;
  status: DockerStatus;
  port?: number;
  url?: string;
  color?: string;
  delay?: number;
}

const statusLabels: Record<DockerStatus, string> = {
  running: "Running",
  stopped: "Stopped",
  paused: "Paused",
};

export function DockerApp({
  name,
  icon,
  status,
  port,
  url,
  color = "bg-primary/20",
  delay = 0,
}: DockerAppProps) {
  return (
    <a
      href={url || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "glass-card glow-border p-4 flex flex-col items-center gap-3 group cursor-pointer opacity-0 animate-scale-in",
        "hover:border-primary/40 transition-all duration-300"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="relative">
        <div
          className={cn("app-icon", color)}
          style={{
            background: `linear-gradient(135deg, ${color.replace("bg-", "hsl(var(--")}), transparent)`,
          }}
        >
          <span className="text-2xl">{icon}</span>
        </div>
        <div
          className={cn(
            "status-dot absolute -bottom-0.5 -right-0.5 ring-2 ring-background",
            status === "running" && "status-dot-running",
            status === "stopped" && "status-dot-stopped",
            status === "paused" && "status-dot-paused"
          )}
        />
      </div>

      <div className="text-center space-y-1">
        <p className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
          {name}
        </p>
        <div className="flex items-center gap-1.5 justify-center">
          <span
            className={cn(
              "text-xs",
              status === "running" && "text-success",
              status === "stopped" && "text-destructive",
              status === "paused" && "text-warning"
            )}
          >
            {statusLabels[status]}
          </span>
          {port && (
            <span className="text-xs text-muted-foreground">:{port}</span>
          )}
        </div>
      </div>

      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity absolute top-3 right-3" />
    </a>
  );
}
