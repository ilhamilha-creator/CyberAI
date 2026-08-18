"""
CyberAI-Expert v7.0 — Big Data Processor
Traitement batch avec Pandas : agrégations, enrichissement, features temporelles.
"""

import os
import json
import time
import logging
from datetime import datetime, timezone, timedelta

import numpy as np
import pandas as pd

logger = logging.getLogger("cyberai.processor.bigdata")


class BigDataProcessor:
    """Traitement Big Data des événements réseau."""

    def __init__(self):
        self.db_url = os.getenv("DATABASE_URL",
                                 "postgresql://cyberai:CyberAI_S3cur3_2024!@postgres:5432/cyberai_soc")

    def load_events(self, hours: int = 24, limit: int = 100000) -> pd.DataFrame:
        """Charge les événements depuis PostgreSQL."""
        import psycopg2
        conn = psycopg2.connect(self.db_url)
        query = f"""
            SELECT uid, ts, src_ip::text, dst_ip::text, src_port, dst_port,
                   proto, service, duration, orig_bytes, resp_bytes,
                   orig_pkts, resp_pkts, conn_state, vlan_id,
                   is_attack, attack_type, severity, mitre_tactic,
                   mitre_technique, kill_chain_phase, confidence,
                   threat_actor, session_id
            FROM network_events
            WHERE ts >= NOW() - INTERVAL '{hours} hours'
            ORDER BY ts DESC
            LIMIT {limit}
        """
        df = pd.read_sql(query, conn)
        conn.close()
        logger.info("Chargé %d événements (%dh)", len(df), hours)
        return df

    def compute_traffic_aggregations(self, df: pd.DataFrame) -> dict:
        """Agrégations de trafic par VLAN, service, protocole."""
        results = {}

        # Par VLAN
        vlan_stats = df.groupby("vlan_id").agg(
            total_events=("uid", "count"),
            total_bytes=("orig_bytes", "sum"),
            attack_count=("is_attack", "sum"),
            avg_duration=("duration", "mean"),
            unique_sources=("src_ip", "nunique"),
            unique_destinations=("dst_ip", "nunique"),
        ).reset_index()
        vlan_stats["attack_ratio"] = vlan_stats["attack_count"] / vlan_stats["total_events"]
        results["by_vlan"] = vlan_stats.to_dict(orient="records")

        # Par service
        svc_stats = df.groupby("service").agg(
            total_events=("uid", "count"),
            total_bytes=("orig_bytes", "sum"),
            attack_count=("is_attack", "sum"),
            avg_duration=("duration", "mean"),
        ).reset_index().sort_values("total_events", ascending=False)
        results["by_service"] = svc_stats.to_dict(orient="records")

        # Par heure
        df["hour"] = pd.to_datetime(df["ts"]).dt.floor("H")
        hourly = df.groupby("hour").agg(
            events=("uid", "count"),
            attacks=("is_attack", "sum"),
            bytes_total=("orig_bytes", "sum"),
        ).reset_index()
        hourly["hour"] = hourly["hour"].astype(str)
        results["hourly"] = hourly.to_dict(orient="records")

        logger.info("Agrégations: %d VLANs, %d services, %d heures",
                     len(results["by_vlan"]), len(results["by_service"]), len(results["hourly"]))
        return results

    def compute_ip_profiles(self, df: pd.DataFrame) -> pd.DataFrame:
        """Profil comportemental de chaque IP source."""
        profiles = df.groupby("src_ip").agg(
            total_connections=("uid", "count"),
            unique_destinations=("dst_ip", "nunique"),
            unique_services=("service", "nunique"),
            unique_vlans=("vlan_id", "nunique"),
            total_bytes_sent=("orig_bytes", "sum"),
            total_bytes_received=("resp_bytes", "sum"),
            avg_duration=("duration", "mean"),
            attack_count=("is_attack", "sum"),
            unique_attack_types=("attack_type", "nunique"),
        ).reset_index()

        profiles["attack_ratio"] = profiles["attack_count"] / profiles["total_connections"]
        profiles["fan_out_ratio"] = profiles["unique_destinations"] / profiles["total_connections"]
        profiles["risk_score"] = (
            profiles["attack_ratio"] * 4 +
            profiles["unique_vlans"].clip(upper=5) * 0.5 +
            profiles["unique_services"].clip(upper=8) * 0.25
        ).round(2)

        return profiles.sort_values("risk_score", ascending=False)

    def detect_anomalies_statistical(self, df: pd.DataFrame) -> pd.DataFrame:
        """Détection d'anomalies par méthodes statistiques (Z-score, IQR)."""
        numeric_cols = ["duration", "orig_bytes", "resp_bytes", "orig_pkts", "resp_pkts"]
        anomalies = pd.DataFrame()

        for col in numeric_cols:
            if col not in df.columns:
                continue
            series = pd.to_numeric(df[col], errors="coerce").fillna(0)

            # Z-score
            mean, std = series.mean(), series.std()
            if std > 0:
                z_scores = (series - mean) / std
                z_mask = z_scores.abs() > 3

                # IQR
                q1, q3 = series.quantile(0.25), series.quantile(0.75)
                iqr = q3 - q1
                iqr_mask = (series < q1 - 1.5 * iqr) | (series > q3 + 1.5 * iqr)

                combined_mask = z_mask | iqr_mask
                if combined_mask.any():
                    anoms = df[combined_mask].copy()
                    anoms["anomaly_field"] = col
                    anoms["z_score"] = z_scores[combined_mask].abs().round(2)
                    anomalies = pd.concat([anomalies, anoms])

        logger.info("Détecté %d anomalies statistiques", len(anomalies))
        return anomalies

    def compute_session_analysis(self, df: pd.DataFrame) -> list[dict]:
        """Analyse des sessions Kill Chain."""
        sessions = df[df["session_id"].notna() & (df["session_id"] != "")]
        if sessions.empty:
            return []

        session_stats = sessions.groupby("session_id").agg(
            threat_actor=("threat_actor", "first"),
            start_time=("ts", "min"),
            end_time=("ts", "max"),
            event_count=("uid", "count"),
            phases=("kill_chain_phase", lambda x: list(x.unique())),
            target_vlans=("vlan_id", lambda x: list(x.unique())),
            attack_types=("attack_type", lambda x: list(x.unique())),
            max_severity=("severity", lambda x: x.mode().iloc[0] if len(x) > 0 else "unknown"),
            avg_confidence=("confidence", "mean"),
        ).reset_index()

        session_stats["duration_minutes"] = (
            (pd.to_datetime(session_stats["end_time"]) - pd.to_datetime(session_stats["start_time"]))
            .dt.total_seconds() / 60
        ).round(1)

        return session_stats.to_dict(orient="records")

    def run_batch_processing(self, hours: int = 24) -> dict:
        """Exécute le traitement batch complet."""
        logger.info("=" * 50)
        logger.info("Big Data Processing — %dh", hours)
        logger.info("=" * 50)
        start = time.time()

        try:
            df = self.load_events(hours=hours)
        except Exception as e:
            logger.error("Erreur chargement: %s", e)
            return {"error": str(e)}

        if df.empty:
            return {"status": "no_data", "events": 0}

        results = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "total_events": len(df),
            "period_hours": hours,
            "aggregations": self.compute_traffic_aggregations(df),
            "top_risky_ips": self.compute_ip_profiles(df).head(20).to_dict(orient="records"),
            "anomalies_count": len(self.detect_anomalies_statistical(df)),
            "sessions": self.compute_session_analysis(df),
            "processing_time_sec": round(time.time() - start, 2),
        }

        logger.info("Traitement terminé en %.1fs — %d events", results["processing_time_sec"], len(df))
        return results


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(levelname)s: %(message)s")
    processor = BigDataProcessor()
    result = processor.run_batch_processing(hours=24)
    print(json.dumps(result, indent=2, default=str))
