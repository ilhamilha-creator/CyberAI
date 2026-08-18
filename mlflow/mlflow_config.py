"""
Configuration MLflow pour CyberAI Expert v8.0
"""

import mlflow
import mlflow.sklearn
import mlflow.pytorch
import mlflow.tensorflow
from mlflow.tracking import MlflowClient
import numpy as np
from datetime import datetime
import os

class CyberAIMLflowManager:
    """Gestionnaire MLflow pour le tracking des modèles de ML"""
    
    def __init__(self, tracking_uri="http://localhost:5000"):
        self.tracking_uri = tracking_uri
        mlflow.set_tracking_uri(tracking_uri)
        self.client = MlflowClient()
        
    def create_experiment(self, experiment_name):
        """Créer une expérience MLflow"""
        try:
            experiment_id = mlflow.create_experiment(
                name=experiment_name,
                tags={
                    "project": "CyberAI-Expert",
                    "version": "v8.0",
                    "created_at": datetime.now().isoformat()
                }
            )
            print(f"✅ Expérience créée: {experiment_name} (ID: {experiment_id})")
            return experiment_id
        except Exception as e:
            print(f"⚠️ L'expérience existe déjà: {experiment_name}")
            return mlflow.get_experiment_by_name(experiment_name).experiment_id
    
    def log_model_metrics(self, model_name, metrics, params, artifacts=None):
        """Logger les métriques d'un modèle"""
        with mlflow.start_run(run_name=f"{model_name}_training"):
            # Logger les hyperparamètres
            for param, value in params.items():
                mlflow.log_param(param, value)
            
            # Logger les métriques
            for metric, value in metrics.items():
                mlflow.log_metric(metric, value)
            
            # Logger les artefacts (modèle, graphiques, etc.)
            if artifacts:
                for artifact_path, artifact_data in artifacts.items():
                    if hasattr(artifact_data, 'save'):  # C'est un modèle
                        mlflow.sklearn.log_model(artifact_data, artifact_path)
                    else:  # C'est un fichier
                        with open(artifact_path, 'w') as f:
                            f.write(str(artifact_data))
                        mlflow.log_artifact(artifact_path)
            
            print(f"📊 Métriques loggées pour {model_name}")
    
    def log_security_model(self, model_type, model, X_test, y_test, predictions):
        """Logger un modèle de sécurité avec ses performances"""
        run_name = f"security_model_{model_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        with mlflow.start_run(run_name=run_name):
            # Paramètres du modèle
            mlflow.log_param("model_type", model_type)
            mlflow.log_param("training_samples", len(X_test))
            mlflow.log_param("features_count", X_test.shape[1] if hasattr(X_test, 'shape') else len(X_test[0]))
            
            # Calculer les métriques de sécurité
            from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
            
            accuracy = accuracy_score(y_test, predictions)
            precision = precision_score(y_test, predictions, average='weighted')
            recall = recall_score(y_test, predictions, average='weighted')
            f1 = f1_score(y_test, predictions, average='weighted')
            
            # Logger les métriques
            mlflow.log_metric("accuracy", accuracy)
            mlflow.log_metric("precision", precision)
            mlflow.log_metric("recall", recall)
            mlflow.log_metric("f1_score", f1)
            
            # Métriques spécifiques à la sécurité
            if hasattr(predictions, 'predict_proba'):
                try:
                    auc = roc_auc_score(y_test, predictions.predict_proba(X_test)[:, 1])
                    mlflow.log_metric("roc_auc", auc)
                except:
                    pass
            
            # Logger le modèle
            mlflow.sklearn.log_model(model, "security_model")
            
            # Logger les artefacts
            import matplotlib.pyplot as plt
            import seaborn as sns
            
            # Matrice de confusion
            from sklearn.metrics import confusion_matrix
            cm = confusion_matrix(y_test, predictions)
            
            plt.figure(figsize=(8, 6))
            sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
            plt.title(f'Confusion Matrix - {model_type}')
            plt.ylabel('True Label')
            plt.xlabel('Predicted Label')
            plt.savefig('confusion_matrix.png')
            mlflow.log_artifact('confusion_matrix.png')
            plt.close()
            
            print(f"🛡️ Modèle de sécurité loggé: {model_type}")
            print(f"   Accuracy: {accuracy:.4f}")
            print(f"   F1-Score: {f1:.4f}")
            
            return mlflow.active_run().info.run_id
    
    def get_best_model(self, experiment_name, metric="f1_score"):
        """Récupérer le meilleur modèle d'une expérience"""
        experiment = mlflow.get_experiment_by_name(experiment_name)
        if not experiment:
            return None
        
        runs = mlflow.search_runs(
            experiment_ids=[experiment.experiment_id],
            order_by=[f"metrics.{metric} DESC"]
        )
        
        if runs.empty:
            return None
        
        best_run = runs.iloc[0]
        print(f"🏆 Meilleur modèle trouvé: {best_run['run_name']}")
        print(f"   {metric}: {best_run[f'metrics.{metric}']:.4f}")
        
        return {
            'run_id': best_run['run_id'],
            'model_uri': f"runs:/{best_run['run_id']}/security_model",
            'metrics': {k: v for k, v in best_run.items() if k.startswith('metrics.')}
        }
    
    def register_model(self, run_id, model_name, stage="Production"):
        """Enregistrer un modèle en production"""
        model_uri = f"runs:/{run_id}/security_model"
        
        try:
            registered_model = mlflow.register_model(
                model_uri=model_uri,
                name=model_name
            )
            
            # Transition vers le stage spécifié
            self.client.transition_model_version_stage(
                name=model_name,
                version=registered_model.version,
                stage=stage
            )
            
            print(f"✅ Modèle enregistré: {model_name} v{registered_model.version} ({stage})")
            return registered_model
            
        except Exception as e:
            print(f"❌ Erreur lors de l'enregistrement du modèle: {e}")
            return None
    
    def compare_models(self, experiment_name):
        """Comparer tous les modèles d'une expérience"""
        experiment = mlflow.get_experiment_by_name(experiment_name)
        if not experiment:
            print(f"❌ Expérience {experiment_name} non trouvée")
            return
        
        runs = mlflow.search_runs(experiment_ids=[experiment.experiment_id])
        
        if runs.empty:
            print(f"❌ Aucun run trouvé dans {experiment_name}")
            return
        
        print(f"\n📊 Comparaison des modèles dans {experiment_name}:")
        print("=" * 80)
        
        for _, run in runs.iterrows():
            print(f"\n🤖 Modèle: {run['run_name']}")
            print(f"   Run ID: {run['run_id']}")
            
            # Afficher les métriques principales
            metrics = {k: v for k, v in run.items() if k.startswith('metrics.')}
            for metric, value in metrics.items():
                metric_name = metric.replace('metrics.', '')
                print(f"   {metric_name}: {value:.4f}")
        
        print("=" * 80)

# Exemples d'utilisation
def setup_mlflow_experiments():
    """Configuration initiale des expériences MLflow"""
    manager = CyberAIMLflowManager()
    
    # Créer les expériences pour chaque type de modèle
    experiments = [
        "DDoS_Detection_RandomForest",
        "DDoS_Detection_LSTM", 
        "DDoS_Detection_CNN",
        "Intrusion_Detection_GNN",
        "Anomaly_Detection_Autoencoder",
        "Threat_Intelligence_Transformer"
    ]
    
    for exp in experiments:
        manager.create_experiment(exp)
    
    print("🎯 Expériences MLflow configurées")

def log_demo_model():
    """Exemple de logging d'un modèle de démonstration"""
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.datasets import make_classification
    
    manager = CyberAIMLflowManager()
    
    # Générer des données de démonstration
    X, y = make_classification(
        n_samples=1000,
        n_features=20,
        n_informative=15,
        n_redundant=5,
        random_state=42
    )
    
    # Entraîner un modèle simple
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    # Faire des prédictions
    predictions = model.predict(X)
    
    # Logger le modèle
    run_id = manager.log_security_model(
        model_type="RandomForest",
        model=model,
        X_test=X,
        y_test=y,
        predictions=predictions
    )
    
    return run_id

if __name__ == "__main__":
    # Configuration
    setup_mlflow_experiments()
    
    # Démonstration
    run_id = log_demo_model()
    
    # Comparaison
    manager = CyberAIMLflowManager()
    manager.compare_models("DDoS_Detection_RandomForest")
