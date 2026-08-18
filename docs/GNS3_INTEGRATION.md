# GNS3 Integration Guide — CyberAI-Expert v8.0

## Architecture

```
GNS3 Server (PC de ton ami)
    |
    | Port Mirror / SPAN
    |
Ubuntu VM (ton serveur Docker)
    |
    +-- eth1 (receives mirrored traffic)
    |
    +-- Zeek container (captures & parses)
    +-- Suricata container (IDS alerts)
    |
    +-- Kafka (event streaming)
    |
    +-- CyberAI Backend (analysis + ML)
    +-- CyberAI Frontend (SOC dashboard)
```

## Steps

### 1. Network Setup
The GNS3 server needs to mirror network traffic to your Ubuntu VM.

**Option A: Port Mirroring (if using a physical switch)**
```
Switch(config)# monitor session 1 source interface Gi0/1
Switch(config)# monitor session 1 destination interface Gi0/2
```

**Option B: GNS3 Cloud + Bridge**
- In GNS3, add a Cloud node connected to the network
- Bridge it to a NIC that your Ubuntu VM can see
- Configure the bridge interface as `eth1` on Ubuntu

**Option C: Virtual Network (VirtualBox/VMware)**
- Create an internal network between GNS3 VM and Ubuntu VM
- Set the interface name in `.env`: `GNS3_MIRROR_INTERFACE=eth1`

### 2. Configure CyberAI
Edit `.env`:
```bash
GNS3_SERVER_IP=<IP of GNS3 server>
GNS3_MIRROR_INTERFACE=eth1
ZEEK_CAPTURE_INTERFACE=eth1
SURICATA_CAPTURE_INTERFACE=eth1
INGESTOR_MODE=hybrid  # hybrid, sensor, or generator
```

### 3. Start Sensors
```bash
# Start everything including Zeek + Suricata
docker compose --profile sensors up -d

# Or just the core platform (with synthetic data)
docker compose up -d
```

### 4. Verify
```bash
# Check Zeek is capturing
docker logs cyberai-zeek

# Check Suricata alerts
docker logs cyberai-suricata

# Check events in Kafka
docker exec cyberai-kafka kafka-console-consumer --bootstrap-server localhost:9092 --topic zeek-events --from-beginning --max-messages 5
```

## Mode Explanation

| Mode | Description |
|------|-------------|
| `hybrid` (default) | Real Zeek/Suricata logs + synthetic generator |
| `sensor` | Real logs only (needs GNS3 traffic) |
| `generator` | Synthetic only (no real network needed) |

## Without GNS3

The platform works perfectly without GNS3 in `generator` mode.
The synthetic generator creates realistic traffic with 9 VLANs,
10 MITRE ATT&CK attacks, 6 threat actors, and Kill Chain sessions.
