#!/bin/bash
set -e

echo "============================================================"
echo "   CyberAI-Expert v8.0 - Deployment on Ubuntu Server 22.04"
echo "============================================================"
echo ""

# Check Docker
if ! command -v docker &>/dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
    echo "Docker installed. Please logout/login and re-run this script."
    exit 0
fi

if ! command -v docker compose &>/dev/null; then
    echo "ERROR: docker compose not available"
    exit 1
fi

echo "[1/4] Docker detected: $(docker --version)"
echo ""

echo "[2/4] Building and starting all services..."
docker compose up -d --build
echo ""

echo "[3/4] Waiting for services to initialize (90 seconds)..."
sleep 90
echo ""

echo "[4/4] Checking service health..."
docker compose ps
echo ""

echo "============================================================"
echo "                  Services Available"
echo "============================================================"
echo ""
echo "  SOC Platform    : http://$(hostname -I | awk '{print $1}'):80"
echo "  Backend API     : http://$(hostname -I | awk '{print $1}'):8000/api/docs"
echo "  Grafana         : http://$(hostname -I | awk '{print $1}'):3000"
echo "  Kibana          : http://$(hostname -I | awk '{print $1}'):5601"
echo "  Kafka UI        : http://$(hostname -I | awk '{print $1}'):8090"
echo "  MLflow          : http://$(hostname -I | awk '{print $1}'):5050"
echo "  MinIO           : http://$(hostname -I | awk '{print $1}'):9001"
echo "  Superset        : http://$(hostname -I | awk '{print $1}'):8088"
echo "  Prometheus      : http://$(hostname -I | awk '{print $1}'):9090"
echo ""
echo "  Login keys:"
echo "    Admin   : cyberai-admin-key-v8-2024"
echo "    Analyst : cyberai-analyst-key-v8-2024"
echo ""
echo "============================================================"
echo ""
echo "To enable real GNS3 sensors:"
echo "  1. Configure GNS3_MIRROR_INTERFACE in .env"
echo "  2. Run: docker compose --profile sensors up -d"
echo ""
