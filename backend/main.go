package main

import (
	"embed"
	"io/fs"
	"log"
	"net/http"
	"os"

	"server-nexus/handlers"
)

//go:embed static/*
var staticFiles embed.FS

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	mux := http.NewServeMux()

	// API routes
	mux.HandleFunc("/api/system", handlers.SystemHandler)
	mux.HandleFunc("/api/storage", handlers.StorageHandler)
	mux.HandleFunc("/api/network", handlers.NetworkHandler)
	mux.HandleFunc("/api/docker", handlers.DockerHandler)

	// Serve static files from embedded filesystem
	staticFS, err := fs.Sub(staticFiles, "static")
	if err != nil {
		log.Fatal(err)
	}

	fileServer := http.FileServer(http.FS(staticFS))
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// Enable CORS for development
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		// Try to serve the file, fallback to index.html for SPA routing
		path := r.URL.Path
		if path == "/" {
			path = "/index.html"
		}

		// Check if file exists in static directory
		if _, err := staticFS.Open(path[1:]); err != nil {
			// File not found, serve index.html for SPA routing
			r.URL.Path = "/"
		}

		fileServer.ServeHTTP(w, r)
	})

	// Add CORS middleware to API routes
	handler := corsMiddleware(mux)

	log.Printf("Server Nexus starting on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}
