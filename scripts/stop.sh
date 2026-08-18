#!/bin/bash
echo "Stopping CyberAI-Expert v8.0..."
docker compose --profile sensors down 2>/dev/null
docker compose down
echo "All services stopped."
echo "To also remove data: docker compose down -v"
