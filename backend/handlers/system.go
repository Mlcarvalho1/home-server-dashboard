package handlers

import (
	"encoding/json"
	"net/http"
	"os"
	"runtime"
	"time"

	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/host"
	"github.com/shirou/gopsutil/v3/load"
	"github.com/shirou/gopsutil/v3/mem"
)

type SystemInfo struct {
	Hostname    string            `json:"hostname"`
	Platform    string            `json:"platform"`
	OS          string            `json:"os"`
	Arch        string            `json:"arch"`
	Uptime      uint64            `json:"uptime"`
	UptimeHuman string            `json:"uptimeHuman"`
	CPU         CPUInfo           `json:"cpu"`
	Memory      MemoryInfo        `json:"memory"`
	Load        LoadInfo          `json:"load"`
	Temperature []TemperatureInfo `json:"temperature"`
}

type CPUInfo struct {
	Model        string    `json:"model"`
	Cores        int       `json:"cores"`
	UsagePercent []float64 `json:"usagePercent"`
	TotalUsage   float64   `json:"totalUsage"`
}

type MemoryInfo struct {
	Total       uint64  `json:"total"`
	Used        uint64  `json:"used"`
	Available   uint64  `json:"available"`
	UsedPercent float64 `json:"usedPercent"`
}

type LoadInfo struct {
	Load1  float64 `json:"load1"`
	Load5  float64 `json:"load5"`
	Load15 float64 `json:"load15"`
}

type TemperatureInfo struct {
	SensorKey   string  `json:"sensorKey"`
	Temperature float64 `json:"temperature"`
}

func SystemHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	info := SystemInfo{}

	// Hostname
	hostname, err := os.Hostname()
	if err == nil {
		info.Hostname = hostname
	}

	// Platform info
	hostInfo, err := host.Info()
	if err == nil {
		info.Platform = hostInfo.Platform
		info.OS = hostInfo.OS
		info.Uptime = hostInfo.Uptime
		info.UptimeHuman = formatUptime(hostInfo.Uptime)
	}
	info.Arch = runtime.GOARCH

	// CPU info
	cpuInfo, err := cpu.Info()
	if err == nil && len(cpuInfo) > 0 {
		info.CPU.Model = cpuInfo[0].ModelName
		info.CPU.Cores = runtime.NumCPU()
	}

	// CPU usage
	cpuPercent, err := cpu.Percent(time.Second, true)
	if err == nil {
		info.CPU.UsagePercent = cpuPercent
		// Calculate total usage
		var total float64
		for _, p := range cpuPercent {
			total += p
		}
		if len(cpuPercent) > 0 {
			info.CPU.TotalUsage = total / float64(len(cpuPercent))
		}
	}

	// Memory info
	memInfo, err := mem.VirtualMemory()
	if err == nil {
		info.Memory = MemoryInfo{
			Total:       memInfo.Total,
			Used:        memInfo.Used,
			Available:   memInfo.Available,
			UsedPercent: memInfo.UsedPercent,
		}
	}

	// Load average
	loadInfo, err := load.Avg()
	if err == nil {
		info.Load = LoadInfo{
			Load1:  loadInfo.Load1,
			Load5:  loadInfo.Load5,
			Load15: loadInfo.Load15,
		}
	}

	// Temperature (Raspberry Pi specific)
	temps, err := host.SensorsTemperatures()
	if err == nil {
		for _, temp := range temps {
			if temp.Temperature > 0 {
				info.Temperature = append(info.Temperature, TemperatureInfo{
					SensorKey:   temp.SensorKey,
					Temperature: temp.Temperature,
				})
			}
		}
	}

	json.NewEncoder(w).Encode(info)
}

func formatUptime(seconds uint64) string {
	days := seconds / 86400
	hours := (seconds % 86400) / 3600
	minutes := (seconds % 3600) / 60

	if days > 0 {
		return formatDuration(days, "day") + ", " + formatDuration(hours, "hour")
	}
	if hours > 0 {
		return formatDuration(hours, "hour") + ", " + formatDuration(minutes, "min")
	}
	return formatDuration(minutes, "min")
}

func formatDuration(value uint64, unit string) string {
	if value == 1 {
		return "1 " + unit
	}
	return itoa(value) + " " + unit + "s"
}

func itoa(n uint64) string {
	if n == 0 {
		return "0"
	}
	var result []byte
	for n > 0 {
		result = append([]byte{byte('0' + n%10)}, result...)
		n /= 10
	}
	return string(result)
}
