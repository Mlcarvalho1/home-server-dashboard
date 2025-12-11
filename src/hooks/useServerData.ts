import { useQuery } from '@tanstack/react-query';
import { api, SystemInfo, StorageInfo, NetworkInfo, DockerInfo } from '@/lib/api';

// Refresh interval in milliseconds
const REFRESH_INTERVAL = 5000; // 5 seconds

export function useSystemInfo() {
  return useQuery<SystemInfo>({
    queryKey: ['system'],
    queryFn: api.getSystem,
    refetchInterval: REFRESH_INTERVAL,
    staleTime: REFRESH_INTERVAL - 1000,
  });
}

export function useStorageInfo() {
  return useQuery<StorageInfo>({
    queryKey: ['storage'],
    queryFn: api.getStorage,
    refetchInterval: REFRESH_INTERVAL * 2, // Storage changes less frequently
    staleTime: REFRESH_INTERVAL * 2 - 1000,
  });
}

export function useNetworkInfo() {
  return useQuery<NetworkInfo>({
    queryKey: ['network'],
    queryFn: api.getNetwork,
    refetchInterval: REFRESH_INTERVAL,
    staleTime: REFRESH_INTERVAL - 1000,
  });
}

export function useDockerInfo() {
  return useQuery<DockerInfo>({
    queryKey: ['docker'],
    queryFn: api.getDocker,
    refetchInterval: REFRESH_INTERVAL,
    staleTime: REFRESH_INTERVAL - 1000,
  });
}

// Combined hook for dashboard
export function useDashboardData() {
  const system = useSystemInfo();
  const storage = useStorageInfo();
  const network = useNetworkInfo();
  const docker = useDockerInfo();

  return {
    system,
    storage,
    network,
    docker,
    isLoading: system.isLoading || storage.isLoading || network.isLoading || docker.isLoading,
    isError: system.isError || storage.isError || network.isError || docker.isError,
  };
}

