package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/shirou/gopsutil/v3/net"
)

type NetworkInfo struct {
	Interfaces []InterfaceInfo `json:"interfaces"`
	TotalSent  uint64          `json:"totalSent"`
	TotalRecv  uint64          `json:"totalRecv"`
}

type InterfaceInfo struct {
	Name        string   `json:"name"`
	Addresses   []string `json:"addresses"`
	BytesSent   uint64   `json:"bytesSent"`
	BytesRecv   uint64   `json:"bytesRecv"`
	PacketsSent uint64   `json:"packetsSent"`
	PacketsRecv uint64   `json:"packetsRecv"`
	IsUp        bool     `json:"isUp"`
}

func NetworkHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	info := NetworkInfo{
		Interfaces: []InterfaceInfo{},
	}

	// Get interface stats
	ioCounters, err := net.IOCounters(true)
	if err != nil {
		json.NewEncoder(w).Encode(info)
		return
	}

	// Get interface addresses
	interfaces, err := net.Interfaces()
	if err != nil {
		json.NewEncoder(w).Encode(info)
		return
	}

	// Create a map of interface addresses
	ifaceAddrs := make(map[string][]string)
	ifaceUp := make(map[string]bool)
	for _, iface := range interfaces {
		addrs := []string{}
		for _, addr := range iface.Addrs {
			// Filter out link-local and IPv6 addresses for cleaner display
			if !strings.HasPrefix(addr.Addr, "fe80:") && !strings.HasPrefix(addr.Addr, "::1") {
				addrs = append(addrs, addr.Addr)
			}
		}
		ifaceAddrs[iface.Name] = addrs

		// Check if interface is up
		for _, flag := range iface.Flags {
			if flag == "up" {
				ifaceUp[iface.Name] = true
				break
			}
		}
	}

	for _, counter := range ioCounters {
		// Skip loopback and virtual interfaces
		if isVirtualInterface(counter.Name) {
			continue
		}

		// Skip interfaces with no traffic
		if counter.BytesSent == 0 && counter.BytesRecv == 0 {
			continue
		}

		ifaceInfo := InterfaceInfo{
			Name:        counter.Name,
			Addresses:   ifaceAddrs[counter.Name],
			BytesSent:   counter.BytesSent,
			BytesRecv:   counter.BytesRecv,
			PacketsSent: counter.PacketsSent,
			PacketsRecv: counter.PacketsRecv,
			IsUp:        ifaceUp[counter.Name],
		}

		info.Interfaces = append(info.Interfaces, ifaceInfo)
		info.TotalSent += counter.BytesSent
		info.TotalRecv += counter.BytesRecv
	}

	json.NewEncoder(w).Encode(info)
}

func isVirtualInterface(name string) bool {
	virtualPrefixes := []string{
		"lo",     // loopback
		"docker", // docker networks
		"br-",    // docker bridge
		"veth",   // virtual ethernet
		"virbr",  // libvirt bridge
		"vnet",   // virtual network
	}

	for _, prefix := range virtualPrefixes {
		if strings.HasPrefix(name, prefix) {
			return true
		}
	}
	return false
}
