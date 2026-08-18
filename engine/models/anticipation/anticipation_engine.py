"""
CyberAI-Expert v7.0 — Moteur d'Anticipation IA
Prédit les prochaines étapes d'une attaque en cours en analysant
les sessions Kill Chain actives et les patterns historiques.
"""

import os
import json
import time
import logging
from collections import defaultdict
from datetime import datetime, timezone

import numpy as np

logger = logging.getLogger("cyberai.ml.anticipation")

KILL_CHAIN_ORDER = [
    "reconnaissance", "weaponization", "delivery",
    "exploitation", "installation", "command_and_control",
    "actions_on_objectives"
]

PHASE_INDEX = {p: i for i, p in enumerate(KILL_CHAIN_ORDER)}

# Matrice de transition entre phases (probabilités estimées)
TRANSITION_MATRIX = {
    "reconnaissance":         {"weaponization": 0.3, "delivery": 0.5, "exploitation": 0.15, "stop": 0.05},
    "weaponization":          {"delivery": 0.7, "exploitation": 0.2, "stop": 0.1},
    "delivery":               {"exploitation": 0.65, "installation": 0.2, "stop": 0.15},
    "exploitation":           {"installation": 0.6, "command_and_control": 0.25, "stop": 0.15},
    "installation":           {"command_and_control": 0.7, "actions_on_objectives": 0.15, "stop": 0.15},
    "command_and_control":    {"actions_on_objectives": 0.6, "lateral_movement": 0.25, "stop": 0.15},
    "actions_on_objectives":  {"data_exfiltration": 0.4, "ransomware": 0.3, "stop": 0.3},
}

# Threat Actor behavior profiles
ACTOR_PATTERNS = {
    "APT28":       {"speed": "slow", "persistence": 0.9, "lateral_prob": 0.8, "preferred_final": "data_exfiltration"},
    "APT41":       {"speed": "medium", "persistence": 0.85, "lateral_prob": 0.7, "preferred_final": "ransomware"},
    "Lazarus":     {"speed": "slow", "persistence": 0.95, "lateral_prob": 0.6, "preferred_final": "data_exfiltration"},
    "ScriptKiddie":{"speed": "fast", "persistence": 0.3, "lateral_prob": 0.1, "preferred_final": "ddos"},
    "Insider":     {"speed": "variable", "persistence": 0.7, "lateral_prob": 0.5, "preferred_final": "data_exfiltration"},
    "Botnet":      {"speed": "fast", "persistence": 0.4, "lateral_prob": 0.2, "preferred_final": "ddos"},
}

# Contre-mesures recommandées
COUNTERMEASURES = {
    "reconnaissance":         ["Renforcer le monitoring réseau", "Déployer des honeypots", "Activer l'IDS/IPS"],
    "delivery":               ["Vérifier les filtres email", "Scanner les pièces jointes", "Bloquer les domaines suspects"],
    "exploitation":           ["Patcher les vulnérabilités", "Isoler les systèmes affectés", "Activer l'EDR"],
    "installation":           ["Scanner les processus suspects", "Vérifier les clés de registre", "Analyser le trafic C2"],
    "command_and_control":    ["Bloquer les IPs C2", "Filtrer le DNS", "Capturer le trafic réseau"],
    "lateral_movement":       ["Segmenter le réseau", "Réinitialiser les credentials", "Surveiller SMB/RDP"],
    "actions_on_objectives":  ["Isoler immédiatement les systèmes", "Activer le plan IR", "Préserver les preuves"],
}


class AnticipationEngine:
    """Moteur de prédiction des prochaines étapes d'attaque."""

    def __init__(self):
        self.session_history = defaultdict(list)
        self.predictions = []

    def analyze_session(self, session: dict) -> dict:
        """
        Analyse une session Kill Chain active et prédit les prochaines étapes.

        Args:
            session: {session_id, threat_actor, current_phase, events, target_vlans, ...}

        Returns:
            Prédiction avec prochaines phases, probabilités, TTI et contre-mesures.
        """
        session_id = session.get("session_id", "unknown")
        actor = session.get("threat_actor", "unknown")
        current_phase = session.get("kill_chain_phase", session.get("current_phase", ""))
        event_count = session.get("event_count", 0)
        target_vlans = session.get("target_vlans", [])

        actor_profile = ACTOR_PATTERNS.get(actor, ACTOR_PATTERNS["ScriptKiddie"])

        # Phase actuelle dans l'ordre
        current_idx = PHASE_INDEX.get(current_phase, 0)

        # Prédire les prochaines phases
        next_phases = self._predict_next_phases(current_phase, actor_profile)

        # Estimer le Time-to-Impact (TTI)
        tti_minutes = self._estimate_tti(current_idx, actor_profile, event_count)

        # Calculer le risk score
        risk_score = self._compute_risk_score(current_idx, actor_profile, target_vlans, event_count)

        # Contre-mesures recommandées
        countermeasures = self._recommend_countermeasures(current_phase, next_phases)

        prediction = {
            "session_id": session_id,
            "threat_actor": actor,
            "current_phase": current_phase,
            "current_phase_index": current_idx,
            "progress_pct": round((current_idx + 1) / len(KILL_CHAIN_ORDER) * 100, 1),
            "next_phases": next_phases,
            "risk_score": round(risk_score, 2),
            "tti_minutes": tti_minutes,
            "persistence_score": actor_profile["persistence"],
            "lateral_probability": actor_profile["lateral_prob"],
            "predicted_final_action": actor_profile["preferred_final"],
            "countermeasures": countermeasures,
            "urgency": self._classify_urgency(risk_score, tti_minutes),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

        self.predictions.append(prediction)
        return prediction

    def _predict_next_phases(self, current_phase: str, actor_profile: dict) -> list[dict]:
        """Prédit les prochaines phases probables."""
        transitions = TRANSITION_MATRIX.get(current_phase, {})
        if not transitions:
            return [{"phase": "actions_on_objectives", "probability": 0.8}]

        predictions = []
        for phase, base_prob in transitions.items():
            if phase == "stop":
                adj_prob = base_prob * (1 - actor_profile["persistence"])
            elif phase == "lateral_movement":
                adj_prob = base_prob * actor_profile["lateral_prob"]
            else:
                adj_prob = base_prob * actor_profile["persistence"]
            predictions.append({"phase": phase, "probability": round(adj_prob, 3)})

        # Normaliser
        total = sum(p["probability"] for p in predictions)
        if total > 0:
            for p in predictions:
                p["probability"] = round(p["probability"] / total, 3)

        predictions.sort(key=lambda x: -x["probability"])
        return predictions[:4]

    def _estimate_tti(self, current_idx: int, actor_profile: dict, event_count: int) -> int:
        """Estime le Time-to-Impact en minutes."""
        remaining_phases = len(KILL_CHAIN_ORDER) - current_idx - 1
        if remaining_phases <= 0:
            return 0

        speed_multiplier = {"slow": 3.0, "medium": 1.5, "fast": 0.5, "variable": 1.0}
        base_minutes_per_phase = 30
        multiplier = speed_multiplier.get(actor_profile["speed"], 1.0)

        # Ajuster selon le nombre d'événements (plus d'events = progression plus rapide)
        activity_factor = max(0.3, 1.0 - (event_count / 100))

        tti = int(remaining_phases * base_minutes_per_phase * multiplier * activity_factor)
        return max(5, tti)

    def _compute_risk_score(self, current_idx: int, actor_profile: dict,
                            target_vlans: list, event_count: int) -> float:
        """Calcule un score de risque global (0-10)."""
        # Base: progression dans la Kill Chain
        progress_score = (current_idx + 1) / len(KILL_CHAIN_ORDER) * 4

        # Sophistication de l'acteur
        persistence_score = actor_profile["persistence"] * 2

        # Criticité des VLANs ciblées
        critical_vlans = {30, 40, 50, 70}
        vlan_score = len(set(target_vlans) & critical_vlans) * 0.5

        # Volume d'activité
        activity_score = min(event_count / 20, 2.0)

        return min(10.0, progress_score + persistence_score + vlan_score + activity_score)

    def _recommend_countermeasures(self, current_phase: str, next_phases: list) -> list[str]:
        """Recommande des contre-mesures basées sur la situation."""
        measures = list(COUNTERMEASURES.get(current_phase, []))

        # Ajouter les mesures préventives pour les phases suivantes
        for np_dict in next_phases[:2]:
            phase = np_dict["phase"]
            if phase in COUNTERMEASURES:
                for m in COUNTERMEASURES[phase]:
                    if m not in measures:
                        measures.append(f"[PRÉVENTIF] {m}")

        return measures[:8]

    def _classify_urgency(self, risk_score: float, tti_minutes: int) -> str:
        """Classifie le niveau d'urgence."""
        if risk_score >= 8 or tti_minutes <= 15:
            return "CRITIQUE"
        elif risk_score >= 6 or tti_minutes <= 60:
            return "ÉLEVÉE"
        elif risk_score >= 4:
            return "MOYENNE"
        return "BASSE"

    def batch_analyze(self, sessions: list[dict]) -> list[dict]:
        """Analyse un lot de sessions."""
        logger.info("🔮 Analyse de %d sessions actives...", len(sessions))
        results = [self.analyze_session(s) for s in sessions]
        results.sort(key=lambda x: -x["risk_score"])

        critical = len([r for r in results if r["urgency"] == "CRITIQUE"])
        high = len([r for r in results if r["urgency"] == "ÉLEVÉE"])
        logger.info("🔮 Résultats: %d CRITIQUE, %d ÉLEVÉE, %d total", critical, high, len(results))

        return results

    def get_summary(self) -> dict:
        """Retourne un résumé des prédictions."""
        if not self.predictions:
            return {"total": 0}

        return {
            "total_predictions": len(self.predictions),
            "avg_risk_score": round(np.mean([p["risk_score"] for p in self.predictions]), 2),
            "avg_tti_minutes": int(np.mean([p["tti_minutes"] for p in self.predictions])),
            "urgency_distribution": {
                "CRITIQUE": len([p for p in self.predictions if p["urgency"] == "CRITIQUE"]),
                "ÉLEVÉE": len([p for p in self.predictions if p["urgency"] == "ÉLEVÉE"]),
                "MOYENNE": len([p for p in self.predictions if p["urgency"] == "MOYENNE"]),
                "BASSE": len([p for p in self.predictions if p["urgency"] == "BASSE"]),
            },
        }


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(levelname)s: %(message)s")

    engine = AnticipationEngine()

    # Test avec des sessions simulées
    test_sessions = [
        {"session_id": "s-001", "threat_actor": "APT28", "kill_chain_phase": "exploitation",
         "event_count": 15, "target_vlans": [40, 50]},
        {"session_id": "s-002", "threat_actor": "Lazarus", "kill_chain_phase": "command_and_control",
         "event_count": 28, "target_vlans": [30, 20]},
        {"session_id": "s-003", "threat_actor": "ScriptKiddie", "kill_chain_phase": "reconnaissance",
         "event_count": 5, "target_vlans": [200]},
    ]

    results = engine.batch_analyze(test_sessions)
    for r in results:
        logger.info("Session %s [%s] — Risk: %.1f | TTI: %dm | Urgence: %s",
                     r["session_id"], r["threat_actor"], r["risk_score"],
                     r["tti_minutes"], r["urgency"])
        logger.info("  Prochaines phases: %s", [f"{p['phase']}({p['probability']:.0%})" for p in r["next_phases"][:3]])

    logger.info("Résumé: %s", json.dumps(engine.get_summary(), indent=2))
