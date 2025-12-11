// API Types matching the Go backend responses

export interface SystemInfo {
  hostname: string;
  platform: string;
  os: string;
  arch: string;
  uptime: number;
  uptimeHuman: string;
  cpu: {
    model: string;
    cores: number;
    usagePercent: number[];
    totalUsage: number;
  };
  memory: {
    total: number;
    used: number;
    available: number;
    usedPercent: number;
  };
  load: {
    load1: number;
    load5: number;
    load15: number;
  };
  temperature: Array<{
    sensorKey: string;
    temperature: number;
  }>;
}

export interface StorageInfo {
  partitions: Array<{
    device: string;
    mountpoint: string;
    fstype: string;
    total: number;
    used: number;
    free: number;
    usedPercent: number;
  }>;
  totalSize: number;
  totalUsed: number;
  totalFree: number;
}

export interface NetworkInfo {
  interfaces: Array<{
    name: string;
    addresses: string[];
    bytesSent: number;
    bytesRecv: number;
    packetsSent: number;
    packetsRecv: number;
    isUp: boolean;
  }>;
  totalSent: number;
  totalRecv: number;
}

export interface DockerInfo {
  available: boolean;
  version: string;
  containers: Array<{
    id: string;
    name: string;
    image: string;
    state: string;
    status: string;
    created: number;
    ports: Array<{
      privatePort: number;
      publicPort: number;
      type: string;
    }>;
    labels: Record<string, string>;
  }>;
  totalCount: number;
  runningCount: number;
  stoppedCount: number;
}

// API base URL - empty for same-origin, or set to your backend URL
const API_BASE = import.meta.env.VITE_API_BASE || '';

async function fetchAPI<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`);
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export const api = {
  getSystem: () => fetchAPI<SystemInfo>('/api/system'),
  getStorage: () => fetchAPI<StorageInfo>('/api/storage'),
  getNetwork: () => fetchAPI<NetworkInfo>('/api/network'),
  getDocker: () => fetchAPI<DockerInfo>('/api/docker'),
};

// Utility functions for formatting
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

export function formatBytesPerSecond(bytes: number): string {
  return `${formatBytes(bytes)}/s`;
}

