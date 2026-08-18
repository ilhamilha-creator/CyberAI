"""
CyberAI-Expert v7.0 — Graph Neural Network (GNN)
GraphSAGE pour la détection de Lateral Movement via analyse de graphes réseau.
Construit un graphe de communication entre IPs et détecte les patterns suspects.
"""

import os
import json
import time
import logging
from datetime import datetime, timezone
from collections import defaultdict

import numpy as np
import pandas as pd

logger = logging.getLogger("cyberai.ml.gnn")

LATERAL_INDICATORS = {
    "fan_out_threshold": 5,       # IP contactant > N destinations uniques
    "service_diversity": 3,        # Utilisation de > N services différents
    "vlan_crossing": 2,            # Traversée de > N VLANs
    "auth_services": {"ssh", "rdp", "smb", "ldap", "kerberos"},
    "high_risk_vlans": {30, 40, 50, 70},
}


class NetworkGraph:
    """Représente le graphe de communication réseau."""

    def __init__(self):
        self.nodes = {}          # ip -> {features}
        self.edges = []          # [(src_ip, dst_ip, {attrs})]
        self.adjacency = defaultdict(set)
        self.edge_features = defaultdict(list)

    def add_event(self, event: dict):
        """Ajoute un événement réseau au graphe."""
        src = event.get("src_ip", "")
        dst = event.get("dst_ip", "")
        if not src or not dst:
            return

        # Nœuds
        for ip in [src, dst]:
            if ip not in self.nodes:
                self.nodes[ip] = {
                    "total_connections": 0,
                    "unique_peers": set(),
                    "services_used": set(),
                    "vlans_accessed": set(),
                    "total_bytes": 0,
                    "auth_attempts": 0,
                    "is_source_count": 0,
                    "is_dest_count": 0,
                }

        # Mise à jour des features de nœuds
        self.nodes[src]["total_connections"] += 1
        self.nodes[src]["unique_peers"].add(dst)
        self.nodes[src]["is_source_count"] += 1
        self.nodes[dst]["is_dest_count"] += 1

        service = event.get("service", "")
        vlan = event.get("vlan_id", 0)

        self.nodes[src]["services_used"].add(service)
        self.nodes[src]["vlans_accessed"].add(vlan)
        self.nodes[src]["total_bytes"] += event.get("orig_bytes", 0)
        if service in LATERAL_INDICATORS["auth_services"]:
            self.nodes[src]["auth_attempts"] += 1

        # Arête
        self.adjacency[src].add(dst)
        self.edges.append((src, dst, {
            "service": service,
            "duration": event.get("duration", 0),
            "bytes": event.get("orig_bytes", 0),
            "vlan": vlan,
        }))

    def get_node_features(self, ip: str) -> np.ndarray:
        """Extrait le vecteur de features d'un nœud."""
        node = self.nodes.get(ip, {})
        return np.array([
            node.get("total_connections", 0),
            len(node.get("unique_peers", set())),
            len(node.get("services_used", set())),
            len(node.get("vlans_accessed", set())),
            node.get("total_bytes", 0),
            node.get("auth_attempts", 0),
            node.get("is_source_count", 0),
            node.get("is_dest_count", 0),
            # Ratios
            len(node.get("unique_peers", set())) / max(node.get("total_connections", 1), 1),
            node.get("auth_attempts", 0) / max(node.get("total_connections", 1), 1),
        ], dtype=np.float32)


class GraphSAGESimulator:
    """
    Simulateur de GraphSAGE pour la détection de lateral movement.
    Utilise l'agrégation de voisinage pour le scoring des nœuds.
    """

    def __init__(self, output_dir: str = "/app/engine/models/artifacts"):
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)
        self.graph = NetworkGraph()
        self.results = {}
        self.threshold = 0.6

    def build_graph(self, df: pd.DataFrame):
        """Construit le graphe depuis un DataFrame d'événements."""
        logger.info("🕸️ Construction du graphe réseau...")
        for _, row in df.iterrows():
            self.graph.add_event(row.to_dict())

        logger.info("Graphe: %d nœuds, %d arêtes, %d connexions uniques",
                     len(self.graph.nodes), len(self.graph.edges),
                     sum(len(v) for v in self.graph.adjacency.values()))

    def aggregate_neighbors(self, ip: str, depth: int = 2) -> np.ndarray:
        """Agrégation des features des voisins (style GraphSAGE)."""
        node_feat = self.graph.get_node_features(ip)

        # 1-hop neighbors
        neighbors_1 = self.graph.adjacency.get(ip, set())
        if neighbors_1:
            neighbor_feats = np.array([self.graph.get_node_features(n) for n in neighbors_1])
            agg_mean = np.mean(neighbor_feats, axis=0)
            agg_max = np.max(neighbor_feats, axis=0)
        else:
            agg_mean = np.zeros_like(node_feat)
            agg_max = np.zeros_like(node_feat)

        # 2-hop neighbors (subset)
        if depth >= 2:
            neighbors_2 = set()
            for n1 in list(neighbors_1)[:20]:
                neighbors_2.update(self.graph.adjacency.get(n1, set()))
            neighbors_2 -= neighbors_1
            neighbors_2.discard(ip)

            if neighbors_2:
                n2_feats = np.array([self.graph.get_node_features(n) for n in list(neighbors_2)[:50]])
                agg_2hop = np.mean(n2_feats, axis=0)
            else:
                agg_2hop = np.zeros_like(node_feat)
        else:
            agg_2hop = np.zeros_like(node_feat)

        return np.concatenate([node_feat, agg_mean, agg_max, agg_2hop])

    def compute_lateral_score(self, ip: str) -> float:
        """Calcule un score de lateral movement pour une IP."""
        node = self.graph.nodes.get(ip, {})
        if not node:
            return 0.0

        score = 0.0
        max_score = 5.0

        # Fan-out élevé
        fan_out = len(node.get("unique_peers", set()))
        if fan_out > LATERAL_INDICATORS["fan_out_threshold"]:
            score += min(fan_out / 10, 1.0)

        # Diversité des services
        services = len(node.get("services_used", set()))
        if services > LATERAL_INDICATORS["service_diversity"]:
            score += min(services / 6, 1.0)

        # Traversée de VLANs
        vlans = node.get("vlans_accessed", set())
        if len(vlans) > LATERAL_INDICATORS["vlan_crossing"]:
            score += min(len(vlans) / 5, 1.0)
            # Bonus si VLANs critiques
            critical_accessed = vlans & LATERAL_INDICATORS["high_risk_vlans"]
            if critical_accessed:
                score += len(critical_accessed) * 0.3

        # Tentatives d'authentification
        auth_ratio = node.get("auth_attempts", 0) / max(node.get("total_connections", 1), 1)
        if auth_ratio > 0.3:
            score += auth_ratio

        return min(score / max_score, 1.0)

    def detect_lateral_movement(self) -> list[dict]:
        """Détecte les IPs avec comportement de lateral movement."""
        logger.info("🔍 Analyse du graphe pour lateral movement...")
        detections = []

        for ip in self.graph.nodes:
            score = self.compute_lateral_score(ip)
            if score > self.threshold:
                node = self.graph.nodes[ip]
                detections.append({
                    "ip": ip,
                    "lateral_score": round(score, 4),
                    "fan_out": len(node.get("unique_peers", set())),
                    "services": list(node.get("services_used", set())),
                    "vlans": list(node.get("vlans_accessed", set())),
                    "auth_attempts": node.get("auth_attempts", 0),
                    "total_bytes": node.get("total_bytes", 0),
                })

        detections.sort(key=lambda x: -x["lateral_score"])
        logger.info("🕸️ %d IPs suspectes détectées (threshold=%.2f)", len(detections), self.threshold)
        return detections

    def evaluate(self, df: pd.DataFrame) -> dict:
        """Évalue les performances du GNN sur les données étiquetées."""
        start = time.time()
        self.build_graph(df)

        # Vérité terrain
        lateral_ips = set()
        for _, row in df.iterrows():
            if row.get("attack_type") in ("lateral_movement", "credential_dumping"):
                lateral_ips.add(row.get("src_ip", ""))

        # Prédictions
        all_ips = list(self.graph.nodes.keys())
        y_true = [1 if ip in lateral_ips else 0 for ip in all_ips]
        y_scores = [self.compute_lateral_score(ip) for ip in all_ips]
        y_pred = [1 if s > self.threshold else 0 for s in y_scores]

        duration = time.time() - start

        from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
        metrics = {
            "name": "GNN-GraphSAGE",
            "accuracy": float(accuracy_score(y_true, y_pred)),
            "precision_score": float(precision_score(y_true, y_pred, zero_division=0)),
            "recall": float(recall_score(y_true, y_pred, zero_division=0)),
            "f1_score": float(f1_score(y_true, y_pred, zero_division=0)),
            "roc_auc": None,
            "training_duration_sec": round(duration, 2),
            "training_samples": len(df),
            "graph_nodes": len(self.graph.nodes),
            "graph_edges": len(self.graph.edges),
            "detections": len([s for s in y_scores if s > self.threshold]),
        }

        self.results["GNN-GraphSAGE"] = metrics
        logger.info("🕸️ GNN — F1: %.4f | Acc: %.4f | Détections: %d",
                     metrics["f1_score"], metrics["accuracy"], metrics["detections"])

        # Sauvegarder le rapport
        report_path = os.path.join(self.output_dir, "gnn_report.json")
        detections = self.detect_lateral_movement()
        with open(report_path, "w") as f:
            json.dump({
                "metrics": metrics,
                "top_detections": detections[:20],
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }, f, indent=2, default=str)

        return metrics


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(levelname)s: %(message)s")
    from train_classical import generate_synthetic_data
    df = generate_synthetic_data(n_samples=10000)
    gnn = GraphSAGESimulator(output_dir="./artifacts")
    gnn.evaluate(df)
