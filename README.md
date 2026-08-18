# CyberAI-Expert v8.0

## SOC AI Platform — Real-Time Cyber Threat Detection & Response

Professional Security Operations Center powered by AI/ML/DL with real
GNS3 network integration, Big Data analytics, and enterprise-grade monitoring.

### Quick Start (Ubuntu Server 22.04)

```bash
# Clone/extract the project
cd CyberAI-Expert-v8

# Download datasets (optional - will use synthetic if not available)
chmod +x scripts/download_datasets.sh
./scripts/download_datasets.sh

# Deploy (installs Docker if needed)
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### Windows Quick Start

```cmd
# Download datasets
scripts\download_datasets.bat

# Deploy platform
scripts\deploy.bat

# Train models (optional)
scripts\train_models.bat
```

### Access

| Service | URL | Credentials |
|---------|-----|-------------|
| **SOC Platform** | http://YOUR_IP:80 | API Key: `cyberai-admin-key-v8-2024` |
| **API Docs** | http://YOUR_IP:8000/api/docs | — |
| **Grafana** | http://YOUR_IP:3000 | admin / `CyberAI_Grafana_2024!` |
| **Kibana** | http://YOUR_IP:5601 | — |
| **Kafka UI** | http://YOUR_IP:8090 | — |
| **MLflow** | http://YOUR_IP:5050 | — |
| **MinIO** | http://YOUR_IP:9001 | `cyberai-minio` / `MinIO_CyberAI_S3cure_2024!` |
| **Superset** | http://YOUR_IP:8088 | admin / `CyberAI_Superset_2024!` |

### Architecture

- **25+ Docker services** on Ubuntu Server 22.04
- **2 data paths**: Big Data (Pandas/Spark) + AI/ML/DL (RF, XGBoost, LSTM, GNN)
- **Real sensor integration**: Zeek + Suricata capturing GNS3 traffic
- **6 public datasets**: NSL-KDD, CIC-IDS2017, CIC-DDoS2019, UNSW-NB15, TON_IoT, GNS3-Live
- **FastAPI async backend** + React/TailwindCSS frontend
- **MLflow model registry** + Celery async tasks + Redis cache

### Datasets Integration

**Priority Order:**
1. **Public Datasets** (NSL-KDD, CIC-IDS2017, UNSW-NB15)
2. **PostgreSQL** (real captured data)
3. **Synthetic** (fallback with 11 attack types)

**Supported Datasets:**
- ✅ **NSL-KDD** - Auto-downloaded, 41 features
- 📋 **CIC-IDS2017** - Manual download required
- 📋 **UNSW-NB15** - Manual download required
- 📋 **CIC-DDoS2019** - Manual download required
- 📋 **TON_IoT** - Manual download required
- ✅ **GNS3-Live** - Real-time traffic

**Quick Setup:**
```bash
# Auto-download NSL-KDD + create samples
./scripts/download_datasets.sh

# Manual datasets (place in datasets/ folder)
# CIC-IDS2017: https://www.unb.ca/cic/datasets/ids-2017.html
# UNSW-NB15: https://www.unsw.adfa.edu.au/unsw-canberra-cyber-security/
```

### GNS3 Integration

See `docs/GNS3_INTEGRATION.md` for full setup instructions.

### Stop

```bash
./scripts/stop.sh
# Or: docker compose down -v (removes data too)
```
