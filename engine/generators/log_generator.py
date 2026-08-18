"""
CyberAI-Expert v7.0 — Générateur de Trafic Réseau Intelligent
Simule un réseau d'entreprise complet avec 9 VLANs, 10 types d'attaques,
6 profils de threat actors et sessions multi-étapes Kill Chain.
"""

import uuid
import time
import random
import json
import math
import logging
from datetime import datetime, timezone
from dataclasses import dataclass, field, asdict
from typing import Optional

logger = logging.getLogger("cyberai.generator")

# ============================================================
# TOPOLOGIE VIRTUELLE — 9 VLANs
# ============================================================
VLANS = {
    10:  {"name": "Utilisateurs",       "subnet": "10.0.10",  "hosts": 120, "criticality": "medium"},
    20:  {"name": "App Servers",         "subnet": "10.0.20",  "hosts": 15,  "criticality": "high"},
    30:  {"name": "Bases de Données",    "subnet": "10.0.30",  "hosts": 8,   "criticality": "critical"},
    40:  {"name": "Active Directory/PKI","subnet": "10.0.40",  "hosts": 5,   "criticality": "critical"},
    50:  {"name": "SOC / Admin",         "subnet": "10.0.50",  "hosts": 10,  "criticality": "critical"},
    60:  {"name": "IoT / BYOD",          "subnet": "10.0.60",  "hosts": 200, "criticality": "low"},
    70:  {"name": "OT / SCADA",          "subnet": "10.0.70",  "hosts": 30,  "criticality": "critical"},
    100: {"name": "Honeypot",            "subnet": "10.0.100", "hosts": 5,   "criticality": "low"},
    200: {"name": "DMZ",                 "subnet": "172.16.0", "hosts": 10,  "criticality": "high"},
}

# ============================================================
# SERVICES ET PORTS COURANTS
# ============================================================
SERVICES = {
    "http":    {"ports": [80, 8080, 8443], "proto": "TCP"},
    "https":   {"ports": [443], "proto": "TCP"},
    "dns":     {"ports": [53], "proto": "UDP"},
    "ssh":     {"ports": [22], "proto": "TCP"},
    "rdp":     {"ports": [3389], "proto": "TCP"},
    "smb":     {"ports": [445, 139], "proto": "TCP"},
    "smtp":    {"ports": [25, 587], "proto": "TCP"},
    "ftp":     {"ports": [21, 20], "proto": "TCP"},
    "mysql":   {"ports": [3306], "proto": "TCP"},
    "mssql":   {"ports": [1433], "proto": "TCP"},
    "ldap":    {"ports": [389, 636], "proto": "TCP"},
    "kerberos":{"ports": [88], "proto": "TCP"},
    "ntp":     {"ports": [123], "proto": "UDP"},
    "snmp":    {"ports": [161, 162], "proto": "UDP"},
    "modbus":  {"ports": [502], "proto": "TCP"},
    "opcua":   {"ports": [4840], "proto": "TCP"},
}

CONN_STATES = ["SF", "S0", "REJ", "RSTO", "RSTR", "S1", "S2", "S3", "OTH"]

# ============================================================
# ATTAQUES MITRE ATT&CK — 10 types
# ============================================================
ATTACKS = {
    "ddos": {
        "tactic": "TA0040", "technique": "T1498",
        "kill_chain": "actions_on_objectives",
        "services": ["http", "https", "dns"],
        "target_vlans": [20, 200], "severity": "high",
        "bytes_range": (50000, 5000000), "pkts_range": (500, 50000),
        "duration_range": (0.1, 5.0),
    },
    "port_scan": {
        "tactic": "TA0043", "technique": "T1046",
        "kill_chain": "reconnaissance",
        "services": ["http", "ssh", "rdp", "smb", "mysql"],
        "target_vlans": [10, 20, 30, 200], "severity": "medium",
        "bytes_range": (40, 200), "pkts_range": (1, 5),
        "duration_range": (0.001, 0.1),
    },
    "brute_force": {
        "tactic": "TA0006", "technique": "T1110",
        "kill_chain": "exploitation",
        "services": ["ssh", "rdp", "ldap", "kerberos"],
        "target_vlans": [10, 40, 50], "severity": "high",
        "bytes_range": (100, 2000), "pkts_range": (5, 30),
        "duration_range": (0.5, 10.0),
    },
    "sql_injection": {
        "tactic": "TA0001", "technique": "T1190",
        "kill_chain": "delivery",
        "services": ["http", "https"],
        "target_vlans": [20, 200], "severity": "critical",
        "bytes_range": (500, 10000), "pkts_range": (10, 100),
        "duration_range": (0.2, 5.0),
    },
    "malware_c2": {
        "tactic": "TA0011", "technique": "T1071",
        "kill_chain": "command_and_control",
        "services": ["https", "dns", "http"],
        "target_vlans": [10, 60], "severity": "critical",
        "bytes_range": (200, 50000), "pkts_range": (5, 200),
        "duration_range": (1.0, 300.0),
    },
    "lateral_movement": {
        "tactic": "TA0008", "technique": "T1021",
        "kill_chain": "installation",
        "services": ["smb", "rdp", "ssh", "ldap"],
        "target_vlans": [20, 30, 40, 70], "severity": "critical",
        "bytes_range": (1000, 100000), "pkts_range": (20, 500),
        "duration_range": (2.0, 60.0),
    },
    "data_exfiltration": {
        "tactic": "TA0010", "technique": "T1048",
        "kill_chain": "actions_on_objectives",
        "services": ["https", "dns", "ftp"],
        "target_vlans": [30, 40], "severity": "critical",
        "bytes_range": (100000, 50000000), "pkts_range": (100, 10000),
        "duration_range": (10.0, 600.0),
    },
    "ransomware": {
        "tactic": "TA0040", "technique": "T1486",
        "kill_chain": "actions_on_objectives",
        "services": ["smb", "rdp"],
        "target_vlans": [20, 30, 70], "severity": "critical",
        "bytes_range": (10000, 1000000), "pkts_range": (50, 5000),
        "duration_range": (5.0, 120.0),
    },
    "dns_tunneling": {
        "tactic": "TA0011", "technique": "T1572",
        "kill_chain": "command_and_control",
        "services": ["dns"],
        "target_vlans": [10, 60], "severity": "high",
        "bytes_range": (500, 20000), "pkts_range": (50, 2000),
        "duration_range": (5.0, 300.0),
    },
    "credential_dumping": {
        "tactic": "TA0006", "technique": "T1003",
        "kill_chain": "exploitation",
        "services": ["ldap", "kerberos", "smb"],
        "target_vlans": [40, 50], "severity": "critical",
        "bytes_range": (5000, 500000), "pkts_range": (30, 300),
        "duration_range": (1.0, 30.0),
    },
}

# ============================================================
# THREAT ACTORS — 6 profils
# ============================================================
THREAT_ACTORS = {
    "APT28": {
        "sophistication": "high",
        "source_ranges": ["185.100.{}.{}", "91.219.{}.{}"],
        "preferred_attacks": ["brute_force", "lateral_movement", "credential_dumping", "data_exfiltration"],
        "preferred_targets": [40, 50, 30],
        "session_probability": 0.7,
    },
    "APT41": {
        "sophistication": "high",
        "source_ranges": ["103.224.{}.{}", "223.165.{}.{}"],
        "preferred_attacks": ["sql_injection", "malware_c2", "lateral_movement", "ransomware"],
        "preferred_targets": [20, 30, 70],
        "session_probability": 0.6,
    },
    "Lazarus": {
        "sophistication": "high",
        "source_ranges": ["175.45.{}.{}", "210.52.{}.{}"],
        "preferred_attacks": ["malware_c2", "data_exfiltration", "ransomware", "dns_tunneling"],
        "preferred_targets": [30, 20, 40],
        "session_probability": 0.8,
    },
    "ScriptKiddie": {
        "sophistication": "low",
        "source_ranges": ["45.33.{}.{}", "198.51.{}.{}", "203.0.{}.{}"],
        "preferred_attacks": ["port_scan", "ddos", "brute_force"],
        "preferred_targets": [200, 10, 60],
        "session_probability": 0.1,
    },
    "Insider": {
        "sophistication": "medium",
        "source_ranges": ["internal"],
        "preferred_attacks": ["credential_dumping", "data_exfiltration", "lateral_movement"],
        "preferred_targets": [30, 40, 50],
        "session_probability": 0.5,
    },
    "Botnet": {
        "sophistication": "low",
        "source_ranges": ["82.165.{}.{}", "178.62.{}.{}", "159.89.{}.{}"],
        "preferred_attacks": ["ddos", "port_scan", "brute_force", "malware_c2"],
        "preferred_targets": [200, 20, 60],
        "session_probability": 0.3,
    },
}

# Kill Chain phases ordonnées
KILL_CHAIN_ORDER = [
    "reconnaissance", "weaponization", "delivery",
    "exploitation", "installation", "command_and_control",
    "actions_on_objectives"
]

SEVERITY_LEVELS = ["info", "low", "medium", "high", "critical"]


@dataclass
class NetworkEvent:
    """Représente un événement réseau généré."""
    uid: str = ""
    timestamp: str = ""
    src_ip: str = ""
    dst_ip: str = ""
    src_port: int = 0
    dst_port: int = 0
    proto: str = "TCP"
    service: str = ""
    duration: float = 0.0
    orig_bytes: int = 0
    resp_bytes: int = 0
    orig_pkts: int = 0
    resp_pkts: int = 0
    conn_state: str = "SF"
    vlan_id: int = 10
    is_attack: bool = False
    attack_type: str = "normal"
    severity: str = "info"
    mitre_tactic: str = ""
    mitre_technique: str = ""
    kill_chain_phase: str = ""
    confidence: float = 0.0
    threat_actor: str = ""
    session_id: str = ""
    indicators: dict = field(default_factory=dict)

    def to_dict(self) -> dict:
        """Convertit l'événement en dictionnaire."""
        return asdict(self)

    def to_json(self) -> str:
        """Sérialise l'événement en JSON."""
        return json.dumps(self.to_dict(), default=str)


class AttackSession:
    """Session d'attaque multi-étapes suivant la Kill Chain."""

    def __init__(self, threat_actor: str, target_vlan: int):
        self.session_id = f"session-{uuid.uuid4().hex[:12]}"
        self.threat_actor = threat_actor
        self.target_vlan = target_vlan
        self.current_phase_idx = 0
        self.events_in_phase = 0
        self.max_events_per_phase = random.randint(3, 12)
        self.created_at = time.time()
        self.confidence = 0.1
        self.completed = False
        actor_cfg = THREAT_ACTORS[threat_actor]
        self.src_ip = self._generate_actor_ip(actor_cfg)

    def _generate_actor_ip(self, actor_cfg: dict) -> str:
        """Génère une IP source selon le profil du threat actor."""
        if "internal" in actor_cfg["source_ranges"]:
            vlan = random.choice([10, 50, 60])
            subnet = VLANS[vlan]["subnet"]
            return f"{subnet}.{random.randint(2, 250)}"
        template = random.choice(actor_cfg["source_ranges"])
        return template.format(random.randint(1, 254), random.randint(1, 254))

    @property
    def current_phase(self) -> str:
        """Phase actuelle de la Kill Chain."""
        if self.current_phase_idx < len(KILL_CHAIN_ORDER):
            return KILL_CHAIN_ORDER[self.current_phase_idx]
        return KILL_CHAIN_ORDER[-1]

    def advance(self) -> bool:
        """Avance la session à la phase suivante."""
        self.events_in_phase += 1
        if self.events_in_phase >= self.max_events_per_phase:
            self.current_phase_idx += 1
            self.events_in_phase = 0
            self.max_events_per_phase = random.randint(2, 8)
            self.confidence = min(1.0, self.confidence + random.uniform(0.1, 0.2))
            if self.current_phase_idx >= len(KILL_CHAIN_ORDER):
                self.completed = True
                return False
        return True

    @property
    def age_seconds(self) -> float:
        """Âge de la session en secondes."""
        return time.time() - self.created_at


class LogGenerator:
    """
    Générateur de trafic réseau intelligent.
    Produit un mélange réaliste de trafic normal et d'attaques.
    """

    def __init__(
        self,
        attack_ratio: float = 0.25,
        events_per_second: float = 8.0,
        enable_sessions: bool = True
    ):
        self.attack_ratio = max(0.0, min(1.0, attack_ratio))
        self.events_per_second = events_per_second
        self.enable_sessions = enable_sessions
        self.active_sessions: list[AttackSession] = []
        self.total_events = 0
        self.total_attacks = 0
        self.attack_counts: dict[str, int] = {k: 0 for k in ATTACKS}
        self._host_cache: dict[int, list[str]] = {}
        logger.info(
            "LogGenerator initialisé — ratio=%.2f, eps=%.1f, sessions=%s",
            self.attack_ratio, self.events_per_second, self.enable_sessions
        )

    def _get_vlan_ip(self, vlan_id: int) -> str:
        """Génère une IP aléatoire dans le sous-réseau du VLAN."""
        if vlan_id not in self._host_cache:
            vlan = VLANS[vlan_id]
            self._host_cache[vlan_id] = [
                f"{vlan['subnet']}.{i}" for i in range(2, min(vlan['hosts'] + 2, 255))
            ]
        return random.choice(self._host_cache[vlan_id])

    def _generate_normal_event(self) -> NetworkEvent:
        """Génère un événement de trafic normal."""
        src_vlan = random.choices(
            list(VLANS.keys()),
            weights=[30, 5, 2, 2, 3, 40, 5, 1, 12],
            k=1
        )[0]
        dst_vlan = random.choices(
            list(VLANS.keys()),
            weights=[10, 20, 10, 5, 3, 10, 5, 1, 36],
            k=1
        )[0]
        service_name = random.choices(
            list(SERVICES.keys()),
            weights=[25, 30, 15, 5, 3, 3, 2, 1, 3, 2, 3, 2, 2, 1, 1, 1],
            k=1
        )[0]
        svc = SERVICES[service_name]

        return NetworkEvent(
            uid=f"evt-{uuid.uuid4().hex[:16]}",
            timestamp=datetime.now(timezone.utc).isoformat(),
            src_ip=self._get_vlan_ip(src_vlan),
            dst_ip=self._get_vlan_ip(dst_vlan),
            src_port=random.randint(1024, 65535),
            dst_port=random.choice(svc["ports"]),
            proto=svc["proto"],
            service=service_name,
            duration=round(random.expovariate(1.0 / 2.0), 4),
            orig_bytes=random.randint(40, 50000),
            resp_bytes=random.randint(40, 200000),
            orig_pkts=random.randint(1, 100),
            resp_pkts=random.randint(1, 200),
            conn_state=random.choices(CONN_STATES, weights=[60, 10, 5, 5, 5, 5, 3, 2, 5], k=1)[0],
            vlan_id=dst_vlan,
            is_attack=False,
            attack_type="normal",
            severity="info",
            confidence=round(random.uniform(0.85, 0.99), 4),
        )

    def _generate_attack_event(self, session: Optional[AttackSession] = None) -> NetworkEvent:
        """Génère un événement d'attaque, éventuellement dans une session Kill Chain."""
        if session:
            actor_cfg = THREAT_ACTORS[session.threat_actor]
            attack_type = random.choice(actor_cfg["preferred_attacks"])
            src_ip = session.src_ip
            dst_vlan = session.target_vlan
            kill_chain = session.current_phase
            confidence = session.confidence
            session_id = session.session_id
            session.advance()
        else:
            actor_name = random.choice(list(THREAT_ACTORS.keys()))
            actor_cfg = THREAT_ACTORS[actor_name]
            attack_type = random.choice(actor_cfg["preferred_attacks"])
            src_ip = self._generate_standalone_src_ip(actor_cfg)
            dst_vlan = random.choice(actor_cfg["preferred_targets"])
            atk = ATTACKS[attack_type]
            kill_chain = atk["kill_chain"]
            confidence = round(random.uniform(0.5, 0.95), 4)
            session_id = ""
            session = None

        atk = ATTACKS[attack_type]
        svc_name = random.choice(atk["services"])
        svc = SERVICES[svc_name]
        b_lo, b_hi = atk["bytes_range"]
        p_lo, p_hi = atk["pkts_range"]
        d_lo, d_hi = atk["duration_range"]

        severity = atk["severity"]
        # Augmenter la sévérité si la confiance est élevée
        if confidence > 0.8 and severity != "critical":
            idx = SEVERITY_LEVELS.index(severity)
            severity = SEVERITY_LEVELS[min(idx + 1, len(SEVERITY_LEVELS) - 1)]

        indicators = self._build_indicators(attack_type, svc_name)

        self.attack_counts[attack_type] = self.attack_counts.get(attack_type, 0) + 1

        return NetworkEvent(
            uid=f"atk-{uuid.uuid4().hex[:16]}",
            timestamp=datetime.now(timezone.utc).isoformat(),
            src_ip=src_ip,
            dst_ip=self._get_vlan_ip(dst_vlan),
            src_port=random.randint(1024, 65535),
            dst_port=random.choice(svc["ports"]),
            proto=svc["proto"],
            service=svc_name,
            duration=round(random.uniform(d_lo, d_hi), 4),
            orig_bytes=random.randint(b_lo, b_hi),
            resp_bytes=random.randint(b_lo // 2, b_hi),
            orig_pkts=random.randint(p_lo, p_hi),
            resp_pkts=random.randint(p_lo, p_hi),
            conn_state=random.choices(["SF", "S0", "REJ", "RSTO", "OTH"], weights=[20, 30, 20, 20, 10], k=1)[0],
            vlan_id=dst_vlan,
            is_attack=True,
            attack_type=attack_type,
            severity=severity,
            mitre_tactic=atk["tactic"],
            mitre_technique=atk["technique"],
            kill_chain_phase=kill_chain,
            confidence=round(confidence, 4),
            threat_actor=session.threat_actor if session else random.choice(list(THREAT_ACTORS.keys())),
            session_id=session_id,
            indicators=indicators,
        )

    def _generate_standalone_src_ip(self, actor_cfg: dict) -> str:
        """Génère une IP source pour une attaque hors session."""
        if "internal" in actor_cfg["source_ranges"]:
            vlan = random.choice([10, 60])
            return self._get_vlan_ip(vlan)
        template = random.choice(actor_cfg["source_ranges"])
        return template.format(random.randint(1, 254), random.randint(1, 254))

    def _build_indicators(self, attack_type: str, service: str) -> dict:
        """Construit les indicateurs de compromission (IoC)."""
        indicators = {"attack_signature": f"CYBERAI-{attack_type.upper()}-{random.randint(1000,9999)}"}
        if attack_type == "sql_injection":
            indicators["payload_pattern"] = random.choice([
                "UNION SELECT", "OR 1=1", "DROP TABLE", "'; EXEC", "SLEEP(5)"
            ])
        elif attack_type == "dns_tunneling":
            indicators["dns_query_length"] = random.randint(80, 255)
            indicators["subdomain_entropy"] = round(random.uniform(3.5, 4.5), 2)
        elif attack_type == "malware_c2":
            indicators["beacon_interval_sec"] = random.choice([30, 60, 120, 300, 600])
            indicators["jitter_pct"] = random.randint(5, 30)
        elif attack_type == "data_exfiltration":
            indicators["data_volume_mb"] = round(random.uniform(10, 5000), 2)
            indicators["encryption_detected"] = random.choice([True, False])
        elif attack_type == "ransomware":
            indicators["file_extensions_changed"] = random.randint(50, 10000)
            indicators["ransom_note_detected"] = True
        return indicators

    def _manage_sessions(self):
        """Gère les sessions d'attaque actives : création et nettoyage."""
        # Nettoyage des sessions terminées ou trop anciennes
        self.active_sessions = [
            s for s in self.active_sessions
            if not s.completed and s.age_seconds < 600
        ]
        # Création de nouvelles sessions
        if len(self.active_sessions) < 5 and random.random() < 0.05:
            actor = random.choice(list(THREAT_ACTORS.keys()))
            actor_cfg = THREAT_ACTORS[actor]
            if random.random() < actor_cfg["session_probability"]:
                target = random.choice(actor_cfg["preferred_targets"])
                session = AttackSession(actor, target)
                self.active_sessions.append(session)
                logger.info(
                    "Nouvelle session Kill Chain : %s par %s → VLAN %d",
                    session.session_id, actor, target
                )

    def generate_event(self) -> NetworkEvent:
        """Génère un seul événement réseau (normal ou attaque)."""
        self.total_events += 1

        if self.enable_sessions:
            self._manage_sessions()

        is_attack = random.random() < self.attack_ratio

        if is_attack:
            self.total_attacks += 1
            # Utiliser une session active si possible
            if self.active_sessions and random.random() < 0.6:
                session = random.choice(self.active_sessions)
                return self._generate_attack_event(session=session)
            return self._generate_attack_event()
        return self._generate_normal_event()

    def generate_batch(self, count: int = 100) -> list[NetworkEvent]:
        """Génère un lot d'événements."""
        return [self.generate_event() for _ in range(count)]

    def get_stats(self) -> dict:
        """Retourne les statistiques du générateur."""
        return {
            "total_events": self.total_events,
            "total_attacks": self.total_attacks,
            "attack_ratio_actual": round(self.total_attacks / max(1, self.total_events), 4),
            "active_sessions": len(self.active_sessions),
            "attack_distribution": dict(self.attack_counts),
            "events_per_second": self.events_per_second,
        }


# Point d'entrée pour test direct
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(levelname)s: %(message)s")
    gen = LogGenerator(attack_ratio=0.25, events_per_second=8)

    logger.info("=== Test du générateur ===")
    for i in range(20):
        event = gen.generate_event()
        marker = "🔴" if event.is_attack else "🟢"
        logger.info(
            "%s %s | %s → %s | %s | %s | conf=%.2f",
            marker, event.uid[:20], event.src_ip, event.dst_ip,
            event.attack_type, event.severity, event.confidence
        )
    logger.info("Stats: %s", json.dumps(gen.get_stats(), indent=2))
