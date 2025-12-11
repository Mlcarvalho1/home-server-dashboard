package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
)

type DockerInfo struct {
	Available    bool            `json:"available"`
	Version      string          `json:"version"`
	Containers   []ContainerInfo `json:"containers"`
	TotalCount   int             `json:"totalCount"`
	RunningCount int             `json:"runningCount"`
	StoppedCount int             `json:"stoppedCount"`
}

type ContainerInfo struct {
	ID      string            `json:"id"`
	Name    string            `json:"name"`
	Image   string            `json:"image"`
	State   string            `json:"state"`
	Status  string            `json:"status"`
	Created int64             `json:"created"`
	Ports   []PortInfo        `json:"ports"`
	Labels  map[string]string `json:"labels"`
}

type PortInfo struct {
	PrivatePort uint16 `json:"privatePort"`
	PublicPort  uint16 `json:"publicPort"`
	Type        string `json:"type"`
}

func DockerHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	info := DockerInfo{
		Available:  false,
		Containers: []ContainerInfo{},
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Try to connect to Docker socket
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		json.NewEncoder(w).Encode(info)
		return
	}
	defer cli.Close()

	// Check Docker version
	version, err := cli.ServerVersion(ctx)
	if err != nil {
		json.NewEncoder(w).Encode(info)
		return
	}

	info.Available = true
	info.Version = version.Version

	// List containers
	containers, err := cli.ContainerList(ctx, container.ListOptions{All: true})
	if err != nil {
		json.NewEncoder(w).Encode(info)
		return
	}

	info.TotalCount = len(containers)

	for _, c := range containers {
		name := ""
		if len(c.Names) > 0 {
			name = strings.TrimPrefix(c.Names[0], "/")
		}

		ports := []PortInfo{}
		for _, p := range c.Ports {
			ports = append(ports, PortInfo{
				PrivatePort: p.PrivatePort,
				PublicPort:  p.PublicPort,
				Type:        p.Type,
			})
		}

		containerInfo := ContainerInfo{
			ID:      c.ID[:12],
			Name:    name,
			Image:   c.Image,
			State:   c.State,
			Status:  c.Status,
			Created: c.Created,
			Ports:   ports,
			Labels:  c.Labels,
		}

		info.Containers = append(info.Containers, containerInfo)

		if c.State == "running" {
			info.RunningCount++
		} else {
			info.StoppedCount++
		}
	}

	json.NewEncoder(w).Encode(info)
}

// GetContainerStats returns detailed stats for a specific container
func GetContainerStats(containerID string) (*types.StatsJSON, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return nil, err
	}
	defer cli.Close()

	stats, err := cli.ContainerStats(ctx, containerID, false)
	if err != nil {
		return nil, err
	}
	defer stats.Body.Close()

	var statsJSON types.StatsJSON
	if err := json.NewDecoder(stats.Body).Decode(&statsJSON); err != nil {
		return nil, err
	}

	return &statsJSON, nil
}
