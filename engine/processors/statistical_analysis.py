"""
CyberAI-Expert v7.0 — Analyses Statistiques Avancées
Corrélations, distributions, tests d'hypothèses, tendances.
"""

import logging
import numpy as np
import pandas as pd
from collections import defaultdict

logger = logging.getLogger("cyberai.processor.stats")


class StatisticalAnalyzer:
    """Analyses statistiques avancées sur les données SOC."""

    def descriptive_stats(self, df: pd.DataFrame) -> dict:
        """Statistiques descriptives complètes."""
        numeric_cols = ["duration", "orig_bytes", "resp_bytes", "orig_pkts", "resp_pkts", "confidence"]
        stats = {}
        for col in numeric_cols:
            if col not in df.columns:
                continue
            series = pd.to_numeric(df[col], errors="coerce").dropna()
            if series.empty:
                continue
            stats[col] = {
                "mean": round(float(series.mean()), 4),
                "median": round(float(series.median()), 4),
                "std": round(float(series.std()), 4),
                "min": round(float(series.min()), 4),
                "max": round(float(series.max()), 4),
                "q25": round(float(series.quantile(0.25)), 4),
                "q75": round(float(series.quantile(0.75)), 4),
                "skewness": round(float(series.skew()), 4),
                "kurtosis": round(float(series.kurtosis()), 4),
            }
        return stats

    def correlation_matrix(self, df: pd.DataFrame) -> dict:
        """Matrice de corrélation entre les variables numériques."""
        numeric_cols = ["duration", "orig_bytes", "resp_bytes", "orig_pkts", "resp_pkts",
                        "src_port", "dst_port", "confidence"]
        available = [c for c in numeric_cols if c in df.columns]
        if len(available) < 2:
            return {}

        corr = df[available].apply(pd.to_numeric, errors="coerce").corr()
        return {
            "columns": available,
            "matrix": corr.round(4).values.tolist(),
        }

    def attack_distribution(self, df: pd.DataFrame) -> dict:
        """Distribution des attaques par type, sévérité, VLAN."""
        result = {}

        if "attack_type" in df.columns:
            type_dist = df[df["is_attack"] == True]["attack_type"].value_counts()
            result["by_type"] = type_dist.to_dict()

        if "severity" in df.columns:
            sev_dist = df["severity"].value_counts()
            result["by_severity"] = sev_dist.to_dict()

        if "vlan_id" in df.columns and "attack_type" in df.columns:
            cross = pd.crosstab(df["vlan_id"], df["attack_type"])
            result["vlan_attack_crosstab"] = {
                "vlans": cross.index.tolist(),
                "attacks": cross.columns.tolist(),
                "values": cross.values.tolist(),
            }

        return result

    def temporal_patterns(self, df: pd.DataFrame) -> dict:
        """Analyse des patterns temporels."""
        df = df.copy()
        df["ts"] = pd.to_datetime(df["ts"], errors="coerce")
        df = df.dropna(subset=["ts"])

        if df.empty:
            return {}

        df["hour_of_day"] = df["ts"].dt.hour
        df["day_of_week"] = df["ts"].dt.dayofweek

        # Heatmap heure × jour
        heatmap = pd.crosstab(df["day_of_week"], df["hour_of_day"])
        attack_heatmap = pd.crosstab(
            df[df["is_attack"] == True]["day_of_week"],
            df[df["is_attack"] == True]["hour_of_day"]
        ) if "is_attack" in df.columns else pd.DataFrame()

        # Tendance horaire
        hourly_trend = df.groupby("hour_of_day").agg(
            total=("uid", "count"),
            attacks=("is_attack", "sum"),
        ).reset_index()

        return {
            "hourly_trend": hourly_trend.to_dict(orient="records"),
            "peak_hour": int(hourly_trend.loc[hourly_trend["total"].idxmax(), "hour_of_day"]),
            "peak_attack_hour": int(hourly_trend.loc[hourly_trend["attacks"].idxmax(), "hour_of_day"])
            if hourly_trend["attacks"].sum() > 0 else None,
            "activity_heatmap": {
                "days": ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
                "hours": list(range(24)),
                "values": heatmap.reindex(range(7), fill_value=0).reindex(range(24), axis=1, fill_value=0).values.tolist(),
            },
        }

    def threat_intelligence_summary(self, df: pd.DataFrame) -> dict:
        """Résumé de la threat intelligence."""
        attacks = df[df.get("is_attack", pd.Series(dtype=bool)) == True] if "is_attack" in df.columns else pd.DataFrame()

        if attacks.empty:
            return {"total_attacks": 0}

        result = {
            "total_attacks": len(attacks),
            "attack_ratio": round(len(attacks) / len(df), 4) if len(df) > 0 else 0,
        }

        if "threat_actor" in attacks.columns:
            actor_stats = attacks.groupby("threat_actor").agg(
                count=("uid", "count"),
                unique_targets=("dst_ip", "nunique"),
                vlans_targeted=("vlan_id", "nunique"),
                avg_confidence=("confidence", "mean"),
            ).reset_index().sort_values("count", ascending=False)
            result["by_actor"] = actor_stats.to_dict(orient="records")

        if "mitre_tactic" in attacks.columns:
            tactic_dist = attacks["mitre_tactic"].value_counts().to_dict()
            result["mitre_tactics"] = tactic_dist

        if "kill_chain_phase" in attacks.columns:
            kc_dist = attacks["kill_chain_phase"].value_counts().to_dict()
            result["kill_chain_phases"] = kc_dist

        return result

    def run_full_analysis(self, df: pd.DataFrame) -> dict:
        """Exécute toutes les analyses statistiques."""
        logger.info("📊 Analyse statistique de %d événements...", len(df))

        return {
            "descriptive": self.descriptive_stats(df),
            "correlations": self.correlation_matrix(df),
            "attack_distribution": self.attack_distribution(df),
            "temporal_patterns": self.temporal_patterns(df),
            "threat_intel": self.threat_intelligence_summary(df),
        }
