import { Server, Wifi, Clock, Thermometer } from "lucide-react";
import { cn } from "@/lib/utils";

interface SystemInfoProps {
  hostname: string;
  ip: string;
  uptime: string;
  temperature?: number;
  className?: string;
}

export function SystemInfo({
  hostname,
  ip,
  uptime,
  temperature,
  className,
}: SystemInfoProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-6 text-sm text-muted-foreground opacity-0 animate-slide-in",
        className
      )}
      style={{ animationDelay: "100ms" }}
    >
      <div className="flex items-center gap-2">
        <Server className="w-4 h-4 text-primary" />
        <span className="font-medium text-foreground">{hostname}</span>
      </div>

      <div className="flex items-center gap-2">
        <Wifi className="w-4 h-4" />
        <span>{ip}</span>
      </div>

      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4" />
        <span>Uptime: {uptime}</span>
      </div>

      {temperature !== undefined && (
        <div className="flex items-center gap-2">
          <Thermometer
            className={cn(
              "w-4 h-4",
              temperature > 70
                ? "text-destructive"
                : temperature > 50
                ? "text-warning"
                : "text-success"
            )}
          />
          <span
            className={cn(
              temperature > 70
                ? "text-destructive"
                : temperature > 50
                ? "text-warning"
                : "text-success"
            )}
          >
            {temperature}°C
          </span>
        </div>
      )}
    </div>
  );
}
