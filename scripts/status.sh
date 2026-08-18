#!/bin/bash
echo "CyberAI-Expert v8.0 - Service Status"
echo "====================================="
docker compose ps
echo ""
echo "Recent logs (last 20 lines):"
docker compose logs --tail=20
