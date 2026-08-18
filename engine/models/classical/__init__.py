"""CyberAI-Expert v8.0 - Modèles ML Classiques"""

from .train_classical import (
    ClassicalTrainer,
    load_public_datasets,
    load_nsl_kdd,
    load_cic_ids2017,
    load_unsw_nb15,
    generate_synthetic_data
)

__all__ = [
    "ClassicalTrainer",
    "load_public_datasets",
    "load_nsl_kdd", 
    "load_cic_ids2017",
    "load_unsw_nb15",
    "generate_synthetic_data"
]
