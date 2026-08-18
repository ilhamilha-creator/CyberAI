"""
CyberAI-Expert v7.0 — Pipeline de Ré-entraînement Automatique
Orchestre le ré-entraînement périodique des modèles ML/DL/GNN
basé sur les nouvelles données et le feedback des analystes SOC.
"""

import os
import json
import time
import logging
import schedule
from datetime import datetime, timezone

logger = logging.getLogger("cyberai.ml.retrain")

RETRAIN_INTERVAL_HOURS = int(os.getenv("RETRAIN_INTERVAL_HOURS", "6"))
MIN_NEW_SAMPLES = int(os.getenv("MIN_NEW_SAMPLES", "500"))
MIN_LABELS_FOR_RETRAIN = int(os.getenv("MIN_LABELS_FOR_RETRAIN", "50"))


class RetrainPipeline:
    """Orchestre le ré-entraînement automatique des modèles."""

    def __init__(self):
        self.last_retrain = None
        self.retrain_count = 0
        self.db_url = os.getenv("DATABASE_URL",
                                 "postgresql://cyberai:CyberAI_S3cur3_2024!@postgres:5432/cyberai_soc")

    def check_retrain_needed(self) -> bool:
        """Vérifie si un ré-entraînement est nécessaire."""
        try:
            import psycopg2
            conn = psycopg2.connect(self.db_url)
            cur = conn.cursor()

            # Compter les nouveaux événements depuis le dernier entraînement
            if self.last_retrain:
                cur.execute(
                    "SELECT COUNT(*) FROM network_events WHERE created_at > %s",
                    (self.last_retrain,)
                )
            else:
                cur.execute("SELECT COUNT(*) FROM network_events")
            new_events = cur.fetchone()[0]

            # Compter les labels analystes récents
            cur.execute("""
                SELECT COUNT(*) FROM soc_labels
                WHERE created_at > NOW() - INTERVAL '%s hours'
            """, (RETRAIN_INTERVAL_HOURS,))
            new_labels = cur.fetchone()[0]

            cur.close()
            conn.close()

            should_retrain = new_events >= MIN_NEW_SAMPLES or new_labels >= MIN_LABELS_FOR_RETRAIN
            logger.info(
                "Check retrain: %d nouveaux events, %d labels → %s",
                new_events, new_labels, "OUI" if should_retrain else "NON"
            )
            return should_retrain

        except Exception as e:
            logger.warning("Erreur check retrain: %s", e)
            return False

    def run_retrain(self):
        """Exécute le pipeline de ré-entraînement."""
        logger.info("=" * 60)
        logger.info("🔄 Démarrage du ré-entraînement — #%d", self.retrain_count + 1)
        logger.info("=" * 60)

        start = time.time()
        results = {}

        # 1. Classical ML
        try:
            from train_classical import ClassicalTrainer
            classical = ClassicalTrainer()
            results["classical"] = classical.run_full_pipeline()
            logger.info("✅ ML Classique terminé")
        except Exception as e:
            logger.error("❌ ML Classique échoué: %s", e)
            results["classical"] = {"error": str(e)}

        # 2. Deep Learning
        try:
            from train_deep_learning import DeepLearningTrainer
            dl = DeepLearningTrainer()
            results["deep_learning"] = dl.run_full_pipeline()
            logger.info("✅ Deep Learning terminé")
        except Exception as e:
            logger.error("❌ Deep Learning échoué: %s", e)
            results["deep_learning"] = {"error": str(e)}

        # 3. GNN
        try:
            from train_gnn import GraphSAGESimulator, generate_synthetic_data
            from train_classical import generate_synthetic_data
            df = generate_synthetic_data(10000)
            gnn = GraphSAGESimulator()
            results["gnn"] = gnn.evaluate(df)
            logger.info("✅ GNN terminé")
        except Exception as e:
            logger.error("❌ GNN échoué: %s", e)
            results["gnn"] = {"error": str(e)}

        duration = time.time() - start
        self.last_retrain = datetime.now(timezone.utc)
        self.retrain_count += 1

        # Log le résumé
        self._log_retrain_summary(results, duration)
        return results

    def _log_retrain_summary(self, results: dict, duration: float):
        """Enregistre le résumé du ré-entraînement."""
        summary = {
            "retrain_number": self.retrain_count,
            "duration_sec": round(duration, 2),
            "timestamp": self.last_retrain.isoformat(),
            "results": {},
        }

        for pipeline, res in results.items():
            if isinstance(res, dict) and "error" not in res:
                best_f1 = max((m.get("f1_score", 0) for m in res.values() if isinstance(m, dict)), default=0)
                summary["results"][pipeline] = {"status": "success", "best_f1": best_f1}
            else:
                summary["results"][pipeline] = {"status": "error"}

        logger.info("📊 Résumé ré-entraînement #%d (%.0fs): %s",
                     self.retrain_count, duration, json.dumps(summary["results"]))

    def run_scheduled(self):
        """Lance le scheduler de ré-entraînement."""
        logger.info("⏰ Scheduler configuré: vérification toutes les %dh", RETRAIN_INTERVAL_HOURS)

        def job():
            if self.check_retrain_needed():
                self.run_retrain()
            else:
                logger.info("⏭️ Pas de ré-entraînement nécessaire")

        schedule.every(RETRAIN_INTERVAL_HOURS).hours.do(job)

        # Premier check au démarrage
        job()

        while True:
            schedule.run_pending()
            time.sleep(60)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(levelname)s: %(message)s")
    pipeline = RetrainPipeline()
    pipeline.run_retrain()
