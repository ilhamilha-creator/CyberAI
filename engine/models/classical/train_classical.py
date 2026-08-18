"""
CyberAI-Expert v7.0 — Entraînement ML Classique
Random Forest + XGBoost + LightGBM + Ensemble Voting
Avec tracking MLflow et export des modèles.
"""

import os
import json
import time
import logging
import pickle
import warnings
from datetime import datetime, timezone

# Importer les fonctions de conversion
from .dataset_converters import (
    _convert_nsl_kdd_to_cyberai_format,
    _convert_cic_ids_to_cyberai_format, 
    _convert_unsw_to_cyberai_format
)

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier, VotingClassifier, GradientBoostingClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, classification_report
)
from sklearn.pipeline import Pipeline
import joblib

warnings.filterwarnings("ignore")
logger = logging.getLogger("cyberai.ml.classical")

# ============================================================
# Feature Engineering
# ============================================================
FEATURE_COLUMNS = [
    "src_port", "dst_port", "duration", "orig_bytes", "resp_bytes",
    "orig_pkts", "resp_pkts", "vlan_id",
]

CATEGORICAL_FEATURES = ["proto", "service", "conn_state"]

ATTACK_CLASSES = {
    "normal": 0, "ddos": 1, "port_scan": 2, "brute_force": 3,
    "sql_injection": 4, "malware_c2": 5, "lateral_movement": 6,
    "data_exfiltration": 7, "ransomware": 8, "dns_tunneling": 9,
    "credential_dumping": 10,
}

CLASS_NAMES = {v: k for k, v in ATTACK_CLASSES.items()}


def extract_features(df: pd.DataFrame) -> tuple[np.ndarray, np.ndarray]:
    """Extrait les features numériques et encode les labels."""
    df = df.copy()

    # Features numériques
    for col in FEATURE_COLUMNS:
        if col not in df.columns:
            df[col] = 0
        df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

    # Features catégorielles → one-hot
    for cat in CATEGORICAL_FEATURES:
        if cat in df.columns:
            dummies = pd.get_dummies(df[cat], prefix=cat, drop_first=True)
            df = pd.concat([df, dummies], axis=1)

    # Features dérivées
    df["bytes_ratio"] = df["orig_bytes"] / (df["resp_bytes"] + 1)
    df["pkts_ratio"] = df["orig_pkts"] / (df["resp_pkts"] + 1)
    df["bytes_per_pkt"] = (df["orig_bytes"] + df["resp_bytes"]) / (df["orig_pkts"] + df["resp_pkts"] + 1)
    df["duration_log"] = np.log1p(df["duration"])
    df["total_bytes"] = df["orig_bytes"] + df["resp_bytes"]
    df["total_pkts"] = df["orig_pkts"] + df["resp_pkts"]

    # Sélection des colonnes numériques seulement
    feature_cols = [c for c in df.columns if df[c].dtype in [np.float64, np.int64, np.float32, np.int32]]
    feature_cols = [c for c in feature_cols if c not in ["is_attack", "vlan_id"] and c in df.columns]

    X = df[feature_cols].values.astype(np.float32)
    X = np.nan_to_num(X, nan=0.0, posinf=1e6, neginf=-1e6)

    # Labels
    if "attack_type" in df.columns:
        y = df["attack_type"].map(ATTACK_CLASSES).fillna(0).astype(int).values
    else:
        y = np.zeros(len(df), dtype=int)

    return X, y, feature_cols


def load_nsl_kdd(dataset_path: str = "/app/datasets/NSL-KDD/") -> pd.DataFrame:
    """Charge et prétraite le dataset NSL-KDD."""
    try:
        # Fichiers NSL-KDD
        train_file = os.path.join(dataset_path, "KDDTrain+.txt")
        test_file = os.path.join(dataset_path, "KDDTest+.txt")
        
        if not os.path.exists(train_file):
            logger.warning("Fichier NSL-KDD non trouvé: %s", train_file)
            return None
            
        # Colonnes NSL-KDD
        columns = [
            "duration", "protocol_type", "service", "flag", "src_bytes", "dst_bytes",
            "land", "wrong_fragment", "urgent", "hot", "num_failed_logins", "logged_in",
            "num_compromised", "root_shell", "su_attempted", "num_root", "num_file_creations",
            "num_shells", "num_access_files", "num_outbound_cmds", "is_host_login",
            "is_guest_login", "count", "srv_count", "serror_rate", "srv_serror_rate",
            "rerror_rate", "srv_rerror_rate", "same_srv_rate", "diff_srv_rate",
            "srv_diff_host_rate", "dst_host_count", "dst_host_srv_count",
            "dst_host_same_srv_rate", "dst_host_diff_srv_rate", "dst_host_same_src_port_rate",
            "dst_host_srv_diff_host_rate", "dst_host_serror_rate", "dst_host_srv_serror_rate",
            "dst_host_rerror_rate", "dst_host_srv_rerror_rate", "label", "difficulty"
        ]
        
        # Charger les données
        df_train = pd.read_csv(train_file, header=None, names=columns)
        df_test = pd.read_csv(test_file, header=None, names=columns)
        
        # Combiner train+test
        df = pd.concat([df_train, df_test], ignore_index=True)
        
        # Mapper les labels à nos classes d'attaques
        label_mapping = {
            "normal": "normal",
            "back": "ddos", "land": "ddos", "neptune": "ddos", "pod": "ddos", 
            "smurf": "ddos", "teardrop": "ddos", "udpstorm": "ddos", "apache2": "ddos",
            "processtable": "ddos", "worm": "malware_c2",
            "ipsweep": "port_scan", "nmap": "port_scan", "portsweep": "port_scan", 
            "satan": "port_scan", "mscan": "port_scan", "saint": "port_scan",
            "ftp_write": "brute_force", "guess_passwd": "brute_force", "imap": "brute_force",
            "multihop": "brute_force", "phf": "brute_force", "spy": "brute_force",
            "warezclient": "brute_force", "warezmaster": "brute_force",
            "buffer_overflow": "malware_c2", "loadmodule": "malware_c2", 
            "perl": "malware_c2", "rootkit": "malware_c2", "xterm": "malware_c2",
            "sqlattack": "sql_injection", "xlock": "sql_injection", "xsnoop": "sql_injection"
        }
        
        # Convertir en format CyberAI
        df = _convert_nsl_kdd_to_cyberai_format(df, label_mapping)
        logger.info("NSL-KDD: %d échantillons chargés", len(df))
        return df
        
    except Exception as e:
        logger.error("Erreur chargement NSL-KDD: %s", e)
        return None


def load_cic_ids2017(dataset_path: str = "/app/datasets/CIC-IDS2017/") -> pd.DataFrame:
    """Charge et prétraite le dataset CIC-IDS2017."""
    try:
        # Chercher les fichiers CSV du dataset
        csv_files = []
        for file in os.listdir(dataset_path):
            if file.endswith(".csv") and "Traffic" in file:
                csv_files.append(os.path.join(dataset_path, file))
        
        if not csv_files:
            logger.warning("Aucun fichier CIC-IDS2017 trouvé dans: %s", dataset_path)
            return None
            
        dfs = []
        for csv_file in csv_files[:5]:  # Limiter à 5 fichiers pour mémoire
            try:
                df = pd.read_csv(csv_file, low_memory=False)
                # Nettoyer les colonnes
                df.columns = df.columns.str.strip().str.replace(' ', '_')
                dfs.append(df)
            except Exception as e:
                logger.warning("Erreur fichier %s: %s", csv_file, e)
                continue
        
        if not dfs:
            return None
            
        df = pd.concat(dfs, ignore_index=True)
        df = _convert_cic_ids_to_cyberai_format(df)
        logger.info("CIC-IDS2017: %d échantillons chargés", len(df))
        return df
        
    except Exception as e:
        logger.error("Erreur chargement CIC-IDS2017: %s", e)
        return None


def load_unsw_nb15(dataset_path: str = "/app/datasets/UNSW-NB15/") -> pd.DataFrame:
    """Charge et prétraite le dataset UNSW-NB15."""
    try:
        # Fichiers UNSW-NB15
        features_file = os.path.join(dataset_path, "UNSW-NB15_features.csv")
        train_file = os.path.join(dataset_path, "UNSW-NB15_training-set.csv")
        test_file = os.path.join(dataset_path, "UNSW-NB15_test-set.csv")
        
        if not all(os.path.exists(f) for f in [features_file, train_file, test_file]):
            logger.warning("Fichiers UNSW-NB15 manquants")
            return None
            
        # Charger les données
        df_train = pd.read_csv(train_file)
        df_test = pd.read_csv(test_file)
        
        df = pd.concat([df_train, df_test], ignore_index=True)
        df = _convert_unsw_to_cyberai_format(df)
        logger.info("UNSW-NB15: %d échantillons chargés", len(df))
        return df
        
    except Exception as e:
        logger.error("Erreur chargement UNSW-NB15: %s", e)
        return None


def load_data_from_postgres(limit: int = 50000) -> pd.DataFrame:
    """Charge les données depuis PostgreSQL."""
    import psycopg2
    import psycopg2.extras

    db_url = os.getenv("DATABASE_URL", "postgresql://cyberai:CyberAI_S3cur3_2024!@postgres:5432/cyberai_soc")
    conn = psycopg2.connect(db_url)
    query = f"""
        SELECT src_port, dst_port, proto, service, conn_state,
               duration, orig_bytes, resp_bytes, orig_pkts, resp_pkts,
               vlan_id, is_attack, attack_type
        FROM network_events
        ORDER BY ts DESC
        LIMIT {limit}
    """
    df = pd.read_sql(query, conn)
    conn.close()
    logger.info("Chargé %d événements depuis PostgreSQL", len(df))
    return df


def load_public_datasets(dataset_dir: str = "/app/datasets") -> pd.DataFrame:
    """Charge les datasets publics dans l'ordre de priorité."""
    datasets = [
        ("NSL-KDD", load_nsl_kdd),
        ("CIC-IDS2017", load_cic_ids2017), 
        ("UNSW-NB15", load_unsw_nb15)
    ]
    
    for name, loader in datasets:
        try:
            df = loader(os.path.join(dataset_dir, name))
            if df is not None and len(df) > 1000:
                logger.info("✅ Dataset %s chargé: %d échantillons", name, len(df))
                return df
        except Exception as e:
            logger.warning("❌ Échec dataset %s: %s", name, e)
            continue
    
    logger.warning("Aucun dataset public disponible, utilisation synthétique")
    return None


def generate_synthetic_data(n_samples: int = 10000) -> pd.DataFrame:
    """Génère des données synthétiques pour l'entraînement initial."""
    np.random.seed(42)
    records = []

    for _ in range(n_samples):
        is_attack = np.random.random() < 0.25
        if is_attack:
            attack_type = np.random.choice(list(ATTACK_CLASSES.keys())[1:])
        else:
            attack_type = "normal"

        base_bytes = 5000 if attack_type == "normal" else 50000
        base_duration = 1.0 if attack_type == "normal" else 5.0

        records.append({
            "src_port": np.random.randint(1024, 65535),
            "dst_port": np.random.choice([22, 53, 80, 443, 445, 3306, 3389, 8080]) if is_attack else np.random.randint(1, 65535),
            "proto": np.random.choice(["TCP", "UDP", "ICMP"], p=[0.7, 0.25, 0.05]),
            "service": np.random.choice(["http", "https", "dns", "ssh", "smb", "rdp", "ftp", "mysql"]),
            "conn_state": np.random.choice(["SF", "S0", "REJ", "RSTO", "OTH"]),
            "duration": abs(np.random.exponential(base_duration)),
            "orig_bytes": abs(int(np.random.exponential(base_bytes))),
            "resp_bytes": abs(int(np.random.exponential(base_bytes * 0.5))),
            "orig_pkts": np.random.randint(1, 500 if is_attack else 100),
            "resp_pkts": np.random.randint(1, 300 if is_attack else 150),
            "vlan_id": np.random.choice([10, 20, 30, 40, 50, 60, 70, 100, 200]),
            "is_attack": is_attack,
            "attack_type": attack_type,
        })

    return pd.DataFrame(records)


# ============================================================
# Entraînement
# ============================================================
class ClassicalTrainer:
    """Entraîne les modèles ML classiques."""

    def __init__(self, output_dir: str = "/app/engine/models/artifacts"):
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)
        self.models = {}
        self.scaler = StandardScaler()
        self.feature_cols = []
        self.results = {}

    def prepare_data(self, df: pd.DataFrame):
        """Prépare les données pour l'entraînement."""
        X, y, self.feature_cols = extract_features(df)
        logger.info("Features: %d | Samples: %d | Classes: %d", X.shape[1], X.shape[0], len(np.unique(y)))

        # Split stratifié
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )

        # Scaling
        X_train = self.scaler.fit_transform(X_train)
        X_test = self.scaler.transform(X_test)

        return X_train, X_test, y_train, y_test

    def train_random_forest(self, X_train, y_train, X_test, y_test):
        """Entraîne un Random Forest."""
        logger.info("🌲 Entraînement Random Forest...")
        start = time.time()

        rf = RandomForestClassifier(
            n_estimators=200,
            max_depth=20,
            min_samples_split=5,
            min_samples_leaf=2,
            max_features="sqrt",
            n_jobs=-1,
            random_state=42,
            class_weight="balanced",
        )
        rf.fit(X_train, y_train)
        duration = time.time() - start

        metrics = self._evaluate(rf, X_test, y_test, "RandomForest", duration)
        self.models["RandomForest"] = rf

        # Feature importance
        if len(self.feature_cols) == X_train.shape[1]:
            importance = dict(zip(self.feature_cols, rf.feature_importances_.tolist()))
            metrics["feature_importance"] = dict(sorted(importance.items(), key=lambda x: -x[1])[:15])

        logger.info("🌲 RF terminé — F1: %.4f | Accuracy: %.4f | Durée: %.1fs",
                     metrics["f1_score"], metrics["accuracy"], duration)
        return metrics

    def train_xgboost(self, X_train, y_train, X_test, y_test):
        """Entraîne un XGBoost."""
        logger.info("🚀 Entraînement XGBoost...")
        start = time.time()

        try:
            from xgboost import XGBClassifier
            xgb = XGBClassifier(
                n_estimators=300,
                max_depth=8,
                learning_rate=0.05,
                subsample=0.8,
                colsample_bytree=0.8,
                min_child_weight=3,
                gamma=0.1,
                reg_alpha=0.1,
                reg_lambda=1.0,
                n_jobs=-1,
                random_state=42,
                eval_metric="mlogloss",
                use_label_encoder=False,
            )
            xgb.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=False)
        except ImportError:
            logger.warning("XGBoost non disponible, utilisation de GradientBoosting sklearn")
            xgb = GradientBoostingClassifier(
                n_estimators=200, max_depth=6, learning_rate=0.05,
                subsample=0.8, random_state=42
            )
            xgb.fit(X_train, y_train)

        duration = time.time() - start
        metrics = self._evaluate(xgb, X_test, y_test, "XGBoost", duration)
        self.models["XGBoost"] = xgb

        logger.info("🚀 XGBoost terminé — F1: %.4f | Accuracy: %.4f | Durée: %.1fs",
                     metrics["f1_score"], metrics["accuracy"], duration)
        return metrics

    def train_ensemble(self, X_train, y_train, X_test, y_test):
        """Entraîne un Ensemble Voting des modèles existants."""
        if len(self.models) < 2:
            logger.warning("Pas assez de modèles pour l'ensemble")
            return {}

        logger.info("🎯 Entraînement Ensemble Voting...")
        start = time.time()

        estimators = [(name, model) for name, model in self.models.items()]
        ensemble = VotingClassifier(estimators=estimators, voting="soft", n_jobs=-1)
        ensemble.fit(X_train, y_train)
        duration = time.time() - start

        metrics = self._evaluate(ensemble, X_test, y_test, "Ensemble-Voting", duration)
        self.models["Ensemble-Voting"] = ensemble

        logger.info("🎯 Ensemble terminé — F1: %.4f | Accuracy: %.4f",
                     metrics["f1_score"], metrics["accuracy"])
        return metrics

    def _evaluate(self, model, X_test, y_test, name: str, duration: float) -> dict:
        """Évalue un modèle et retourne les métriques."""
        y_pred = model.predict(X_test)
        y_proba = None
        try:
            y_proba = model.predict_proba(X_test)
        except Exception:
            pass

        metrics = {
            "name": name,
            "accuracy": float(accuracy_score(y_test, y_pred)),
            "precision_score": float(precision_score(y_test, y_pred, average="weighted", zero_division=0)),
            "recall": float(recall_score(y_test, y_pred, average="weighted", zero_division=0)),
            "f1_score": float(f1_score(y_test, y_pred, average="weighted", zero_division=0)),
            "training_duration_sec": round(duration, 2),
            "training_samples": len(y_test) * 5,  # ~80/20 split
            "confusion_matrix": confusion_matrix(y_test, y_pred).tolist(),
        }

        if y_proba is not None:
            try:
                metrics["roc_auc"] = float(roc_auc_score(y_test, y_proba, multi_class="ovr", average="weighted"))
            except Exception:
                metrics["roc_auc"] = None

        self.results[name] = metrics
        return metrics

    def save_models(self):
        """Sauvegarde tous les modèles entraînés."""
        for name, model in self.models.items():
            path = os.path.join(self.output_dir, f"{name.lower().replace(' ', '_')}.pkl")
            joblib.dump(model, path)
            logger.info("💾 Modèle sauvegardé : %s", path)

        # Sauvegarder le scaler
        scaler_path = os.path.join(self.output_dir, "scaler.pkl")
        joblib.dump(self.scaler, scaler_path)

        # Sauvegarder les feature columns
        meta_path = os.path.join(self.output_dir, "metadata.json")
        with open(meta_path, "w") as f:
            json.dump({
                "feature_columns": self.feature_cols,
                "attack_classes": ATTACK_CLASSES,
                "class_names": CLASS_NAMES,
                "trained_at": datetime.now(timezone.utc).isoformat(),
            }, f, indent=2)

    def log_to_mlflow(self):
        """Enregistre les résultats dans MLflow."""
        try:
            import mlflow
            mlflow.set_tracking_uri(os.getenv("MLFLOW_TRACKING_URI", "http://mlflow:5050"))
            mlflow.set_experiment("CyberAI-Classical-ML")

            for name, metrics in self.results.items():
                with mlflow.start_run(run_name=f"{name}-{datetime.now().strftime('%Y%m%d-%H%M')}"):
                    mlflow.log_params({
                        "model_type": name,
                        "training_samples": metrics.get("training_samples", 0),
                    })
                    mlflow.log_metrics({
                        "accuracy": metrics["accuracy"],
                        "precision": metrics["precision_score"],
                        "recall": metrics["recall"],
                        "f1_score": metrics["f1_score"],
                        "training_duration": metrics["training_duration_sec"],
                    })
                    if metrics.get("roc_auc"):
                        mlflow.log_metric("roc_auc", metrics["roc_auc"])

                    # Log model artifact
                    model_path = os.path.join(self.output_dir, f"{name.lower().replace(' ', '_')}.pkl")
                    if os.path.exists(model_path):
                        mlflow.log_artifact(model_path)

            logger.info("📊 Résultats enregistrés dans MLflow")
        except Exception as e:
            logger.warning("MLflow indisponible: %s", e)

    def update_postgres(self):
        """Met à jour les métriques dans PostgreSQL."""
        try:
            import psycopg2
            db_url = os.getenv("DATABASE_URL", "postgresql://cyberai:CyberAI_S3cur3_2024!@postgres:5432/cyberai_soc")
            conn = psycopg2.connect(db_url)
            conn.autocommit = True
            cur = conn.cursor()

            for name, m in self.results.items():
                cur.execute("""
                    INSERT INTO ml_models (name, version, model_type, framework, accuracy,
                        precision_score, recall, f1_score, roc_auc, training_samples,
                        training_duration_sec, is_production, confusion_matrix, updated_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
                    ON CONFLICT (name, version) DO UPDATE SET
                        accuracy = EXCLUDED.accuracy,
                        precision_score = EXCLUDED.precision_score,
                        recall = EXCLUDED.recall,
                        f1_score = EXCLUDED.f1_score,
                        roc_auc = EXCLUDED.roc_auc,
                        training_samples = EXCLUDED.training_samples,
                        training_duration_sec = EXCLUDED.training_duration_sec,
                        confusion_matrix = EXCLUDED.confusion_matrix,
                        updated_at = NOW()
                """, (
                    name, "v2.0", "classification", "scikit-learn",
                    m["accuracy"], m["precision_score"], m["recall"], m["f1_score"],
                    m.get("roc_auc"), m.get("training_samples", 0),
                    m["training_duration_sec"], name == "Ensemble-Voting",
                    json.dumps(m.get("confusion_matrix", [])),
                ))

            cur.close()
            conn.close()
            logger.info("✅ Métriques mises à jour dans PostgreSQL")
        except Exception as e:
            logger.warning("Erreur PostgreSQL update: %s", e)

    def run_full_pipeline(self, use_synthetic: bool = False):
        """Exécute le pipeline complet d'entraînement."""
        logger.info("=" * 60)
        logger.info("CyberAI-Expert v7.0 — Pipeline ML Classique")
        logger.info("=" * 60)

        # Chargement des données par ordre de priorité
        dataset_dir = os.getenv("DATASET_DIR", "/app/datasets")
        
        # 1. Essayer les datasets publics
        df = load_public_datasets(dataset_dir)
        
        # 2. Sinon, essayer PostgreSQL
        if df is None:
            try:
                df = load_data_from_postgres(limit=50000)
                if len(df) < 1000:
                    logger.info("Pas assez de données réelles, datasets publics...")
                    df = load_public_datasets(dataset_dir)
            except Exception as e:
                logger.warning("Impossible de charger depuis PostgreSQL: %s", e)
        
        # 3. Fallback sur données synthétiques
        if df is None or len(df) < 1000:
            logger.info("Génération de données synthétiques...")
            df = generate_synthetic_data(n_samples=20000)

        # Préparation
        X_train, X_test, y_train, y_test = self.prepare_data(df)

        # Entraînement
        self.train_random_forest(X_train, y_train, X_test, y_test)
        self.train_xgboost(X_train, y_train, X_test, y_test)
        self.train_ensemble(X_train, y_train, X_test, y_test)

        # Sauvegarde et logging
        self.save_models()
        self.log_to_mlflow()
        self.update_postgres()

        logger.info("=" * 60)
        logger.info("Pipeline terminé — %d modèles entraînés", len(self.models))
        for name, m in self.results.items():
            logger.info("  %s — F1: %.4f | Acc: %.4f | AUC: %s",
                         name, m["f1_score"], m["accuracy"],
                         f"{m['roc_auc']:.4f}" if m.get("roc_auc") else "N/A")
        logger.info("=" * 60)

        return self.results


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(levelname)s: %(message)s")
    trainer = ClassicalTrainer(output_dir="./artifacts")
    trainer.run_full_pipeline(use_synthetic=True)
