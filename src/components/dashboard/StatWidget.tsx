import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatWidgetProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  percentage?: number;
  trend?: "up" | "down" | "neutral";
  className?: string;
  delay?: number;
}

export function StatWidget({
  title,
  value,
  subtitle,
  icon: Icon,
  percentage,
  trend,
  className,
  delay = 0,
}: StatWidgetProps) {
  return (
    <div
      className={cn(
        "glass-card glow-border p-5 opacity-0 animate-fade-in",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        {percentage !== undefined && (
          <span
            className={cn(
              "text-xs font-medium px-2 py-1 rounded-full",
              trend === "up" && "bg-success/20 text-success",
              trend === "down" && "bg-destructive/20 text-destructive",
              trend === "neutral" && "bg-muted text-muted-foreground"
            )}
          >
            {trend === "up" && "↑"}
            {trend === "down" && "↓"}
            {percentage}%
          </span>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <p className="widget-value">{value}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground/70">{subtitle}</p>
        )}
      </div>

      {percentage !== undefined && (
        <div className="mt-4">
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-1000",
                trend === "up" && "bg-success",
                trend === "down" && "bg-destructive",
                trend === "neutral" && "bg-primary"
              )}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
