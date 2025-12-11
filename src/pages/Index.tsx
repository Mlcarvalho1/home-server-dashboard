import { Cpu, MemoryStick, Container, Zap, Loader2, AlertCircle } from "lucide-react";
import { StatWidget } from "@/components/dashboard/StatWidget";
import { DockerApp, DockerStatus } from "@/components/dashboard/DockerApp";
import { SystemInfo } from "@/components/dashboard/SystemInfo";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { NetworkWidget } from "@/components/dashboard/NetworkWidget";
import { StorageWidget } from "@/components/dashboard/StorageWidget";
import { useDashboardData } from "@/hooks/useServerData";
import { formatBytes } from "@/lib/api";

// Container icon mappings based on common container names
const containerIcons: Record<string, string> = {
  portainer: "🐳",
  nginx: "🌐",
  "nginx-proxy": "🌐",
  pihole: "🛡️",
  "pi-hole": "🛡️",
  homeassistant: "🏠",
  "home-assistant": "🏠",
  plex: "🎬",
  nextcloud: "☁️",
  grafana: "📊",
  prometheus: "🔥",
  sonarr: "📺",
  radarr: "🎞️",
  qbittorrent: "⬇️",
  transmission: "⬇️",
  vaultwarden: "🔐",
  bitwarden: "🔐",
  jellyfin: "🎬",
  mariadb: "🗄️",
  mysql: "🗄️",
  postgres: "🗄️",
  redis: "📦",
  mongodb: "🍃",
  traefik: "🔀",
  caddy: "🔒",
  unifi: "📡",
  zigbee2mqtt: "📡",
  mosquitto: "🦟",
  default: "📦",
};

// Color mappings for containers
const containerColors: Record<string, string> = {
  portainer: "bg-blue-500/20",
  nginx: "bg-green-500/20",
  pihole: "bg-red-500/20",
  homeassistant: "bg-cyan-500/20",
  plex: "bg-orange-500/20",
  nextcloud: "bg-blue-400/20",
  grafana: "bg-orange-400/20",
  prometheus: "bg-red-400/20",
  sonarr: "bg-purple-500/20",
  radarr: "bg-yellow-500/20",
  qbittorrent: "bg-blue-600/20",
  vaultwarden: "bg-indigo-500/20",
  default: "bg-primary/20",
};

function getContainerIcon(name: string): string {
  const lowerName = name.toLowerCase();
  for (const [key, icon] of Object.entries(containerIcons)) {
    if (lowerName.includes(key)) return icon;
  }
  return containerIcons.default;
}

function getContainerColor(name: string): string {
  const lowerName = name.toLowerCase();
  for (const [key, color] of Object.entries(containerColors)) {
    if (lowerName.includes(key)) return color;
  }
  return containerColors.default;
}

function mapDockerState(state: string): DockerStatus {
  switch (state.toLowerCase()) {
    case "running":
      return "running";
    case "paused":
      return "paused";
    default:
      return "stopped";
  }
}

const Index = () => {
  const { system, storage, network, docker, isLoading } = useDashboardData();

  // Format memory display
  const memoryValue = system.data
    ? formatBytes(system.data.memory.used)
    : "--";
  const memorySubtitle = system.data
    ? `of ${formatBytes(system.data.memory.total)}`
    : "";

  // Format CPU percentage
  const cpuValue = system.data
    ? `${system.data.cpu.totalUsage.toFixed(0)}%`
    : "--";
  const cpuPercentage = system.data ? Math.round(system.data.cpu.totalUsage) : 0;

  // Format load
  const loadValue = system.data
    ? system.data.load.load1.toFixed(2)
    : "--";
  const loadPercentage = system.data
    ? Math.min(Math.round((system.data.load.load1 / system.data.cpu.cores) * 100), 100)
    : 0;

  // Container stats
  const containerCount = docker.data?.totalCount || 0;
  const runningCount = docker.data?.runningCount || 0;
  const stoppedCount = docker.data?.stoppedCount || 0;

  // Network stats (cumulative totals)
  const totalDownload = network.data ? formatBytes(network.data.totalRecv) : "--";
  const totalUpload = network.data ? formatBytes(network.data.totalSent) : "--";

  // Get first interface IP or hostname
  const primaryIP = network.data?.interfaces?.[0]?.addresses?.[0]?.split('/')[0] || 
    system.data?.hostname || "--";

  // Get temperature (first sensor or undefined)
  const temperature = system.data?.temperature?.[0]?.temperature;

  // Storage drives
  const storageDrives = storage.data?.partitions.map(p => ({
    name: p.mountpoint === "/" ? "Root" : p.mountpoint.split('/').pop() || p.mountpoint,
    used: Math.round(p.used / (1024 * 1024 * 1024)), // Convert to GB
    total: Math.round(p.total / (1024 * 1024 * 1024)),
    mount: p.mountpoint,
  })) || [];

  // Docker containers
  const dockerApps = docker.data?.containers.map(c => ({
    name: c.name,
    icon: getContainerIcon(c.name),
    status: mapDockerState(c.state),
    port: c.ports?.[0]?.publicPort || c.ports?.[0]?.privatePort,
    url: c.ports?.[0]?.publicPort ? `http://${window.location.hostname}:${c.ports[0].publicPort}` : undefined,
    color: getContainerColor(c.name),
  })) || [];

  if (isLoading && !system.data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading server data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background gradient effect */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="opacity-0 animate-fade-in">
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Welcome back. Here's your server status.
              </p>
            </div>
            <QuickActions />
          </div>

          <SystemInfo
            hostname={system.data?.hostname || "--"}
            ip={primaryIP}
            uptime={system.data?.uptimeHuman || "--"}
            temperature={temperature}
          />

          {/* Error indicators */}
          {(system.isError || docker.isError) && (
            <div className="mt-4 flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Some data could not be loaded. Retrying...</span>
            </div>
          )}
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatWidget
            title="CPU Usage"
            value={cpuValue}
            icon={Cpu}
            percentage={cpuPercentage}
            trend="neutral"
            delay={100}
          />
          <StatWidget
            title="Memory"
            value={memoryValue}
            subtitle={memorySubtitle}
            icon={MemoryStick}
            percentage={system.data ? Math.round(system.data.memory.usedPercent) : 0}
            trend={system.data && system.data.memory.usedPercent > 80 ? "up" : "neutral"}
            delay={150}
          />
          <StatWidget
            title="Containers"
            value={containerCount.toString()}
            subtitle={`${runningCount} running, ${stoppedCount} stopped`}
            icon={Container}
            delay={200}
          />
          <StatWidget
            title="System Load"
            value={loadValue}
            subtitle={`${system.data?.cpu.cores || 0} cores`}
            icon={Zap}
            percentage={loadPercentage}
            trend={loadPercentage > 80 ? "up" : "neutral"}
            delay={250}
          />
        </section>

        {/* Network & Storage */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <NetworkWidget
            download="--"
            upload="--"
            totalDown={totalDownload}
            totalUp={totalUpload}
          />
          <StorageWidget drives={storageDrives} />
        </section>

        {/* Docker Apps */}
        <section className="mb-8">
          <div
            className="flex items-center justify-between mb-4 opacity-0 animate-fade-in"
            style={{ animationDelay: "300ms" }}
          >
            <div>
              <h2 className="text-xl font-semibold text-foreground">Applications</h2>
              <p className="text-sm text-muted-foreground">
                {runningCount} of {containerCount} running
              </p>
            </div>
            {!docker.data?.available && docker.data !== undefined && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                Docker not available
              </span>
            )}
          </div>

          {dockerApps.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {dockerApps.map((app, index) => (
                <DockerApp
                  key={app.name}
                  name={app.name}
                  icon={app.icon}
                  status={app.status}
                  port={app.port}
                  url={app.url}
                  color={app.color}
                  delay={350 + index * 50}
                />
              ))}
            </div>
          ) : (
            <div className="glass-card glow-border p-8 text-center text-muted-foreground">
              {docker.isLoading ? (
                <p>Loading containers...</p>
              ) : docker.isError ? (
                <p>Could not connect to Docker</p>
              ) : (
                <p>No containers found</p>
              )}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer
          className="text-center text-xs text-muted-foreground/50 py-4 opacity-0 animate-fade-in"
          style={{ animationDelay: "1000ms" }}
        >
          <p>Server Nexus • Auto-refresh every 5 seconds</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
