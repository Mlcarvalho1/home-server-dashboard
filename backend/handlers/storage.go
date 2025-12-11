package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/shirou/gopsutil/v3/disk"
)

type StorageInfo struct {
	Partitions []PartitionInfo `json:"partitions"`
	TotalSize  uint64          `json:"totalSize"`
	TotalUsed  uint64          `json:"totalUsed"`
	TotalFree  uint64          `json:"totalFree"`
}

type PartitionInfo struct {
	Device      string  `json:"device"`
	Mountpoint  string  `json:"mountpoint"`
	Fstype      string  `json:"fstype"`
	Total       uint64  `json:"total"`
	Used        uint64  `json:"used"`
	Free        uint64  `json:"free"`
	UsedPercent float64 `json:"usedPercent"`
}

func StorageHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	info := StorageInfo{
		Partitions: []PartitionInfo{},
	}

	partitions, err := disk.Partitions(false)
	if err != nil {
		json.NewEncoder(w).Encode(info)
		return
	}

	seenDevices := make(map[string]bool)

	for _, partition := range partitions {
		// Skip duplicate devices and virtual filesystems
		if seenDevices[partition.Device] {
			continue
		}

		// Skip virtual/system filesystems
		if isVirtualFS(partition.Fstype) {
			continue
		}

		usage, err := disk.Usage(partition.Mountpoint)
		if err != nil {
			continue
		}

		// Skip if total size is 0
		if usage.Total == 0 {
			continue
		}

		seenDevices[partition.Device] = true

		partInfo := PartitionInfo{
			Device:      partition.Device,
			Mountpoint:  partition.Mountpoint,
			Fstype:      partition.Fstype,
			Total:       usage.Total,
			Used:        usage.Used,
			Free:        usage.Free,
			UsedPercent: usage.UsedPercent,
		}

		info.Partitions = append(info.Partitions, partInfo)
		info.TotalSize += usage.Total
		info.TotalUsed += usage.Used
		info.TotalFree += usage.Free
	}

	json.NewEncoder(w).Encode(info)
}

func isVirtualFS(fstype string) bool {
	virtualFS := map[string]bool{
		"sysfs":       true,
		"proc":        true,
		"devtmpfs":    true,
		"devpts":      true,
		"tmpfs":       true,
		"securityfs":  true,
		"cgroup":      true,
		"cgroup2":     true,
		"pstore":      true,
		"debugfs":     true,
		"hugetlbfs":   true,
		"mqueue":      true,
		"fusectl":     true,
		"configfs":    true,
		"binfmt_misc": true,
		"overlay":     true,
		"squashfs":    true,
	}
	return virtualFS[fstype]
}
