# Datasets pour CyberAI-Expert v8.0

## ✅ Datasets Publiques Intégrés

### 1. NSL-KDD (2009) ✅ **IMPLÉMENTÉ**
- **Enregistrements**: 148,517 (train: 125,973, test: 22,544)
- **Features**: 41 features numériques + label
- **Types d'attaques**: DoS, Probe, R2L, U2R
- **Fichiers**: KDDTrain+.txt, KDDTest+.txt
- **Conversion**: `_convert_nsl_kdd_to_cyberai_format()` dans `dataset_converters.py`
- **Téléchargement**: Automatique via `scripts/download_datasets.py`

### 2. CIC-IDS2017 ✅ **IMPLÉMENTÉ**
- **Enregistrements**: 2.8M+ (7 jours de capture)
- **Features**: 80 features PCAP + Flow
- **Attaques**: DDoS, Web attacks, Brute force, Infiltration, Bot, Heartbleed
- **Fichiers**: Multiple CSV par jour (Monday-...)
- **Conversion**: `_convert_cic_ids_to_cyberai_format()` dans `dataset_converters.py`
- **Téléchargement**: Manuel requis (voir URL dans script)

### 3. CIC-DDoS2019 📋 **PLANIFIÉ**
- **Enregistrements**: 100M+ paquets
- **Features**: 88 features flow
- **Spécialisation**: Détection DDoS uniquement
- **Statut**: Non implémenté (priorité basse)

### 4. UNSW-NB15 ✅ **IMPLÉMENTÉ**
- **Enregistrements**: 2.5M+ (train: 175,341, test: 82,332)
- **Features**: 45 features hybrides (packet + flow)
- **Catégories**: 10 types d'attaques (Fuzzers, Analysis, DoS, Exploits, etc.)
- **Fichiers**: UNSW-NB15_*.csv
- **Conversion**: `_convert_unsw_to_cyberai_format()` dans `dataset_converters.py`
- **Téléchargement**: Manuel requis

### 5. TON_IoT 📋 **PLANIFIÉ**
- **Enregistrements**: IoT devices traffic
- **Features**: 42 features
- **Attaques**: 9 types d'attaques IoT
- **Statut**: Non implémenté (priorité basse)

### 6. GNS3-Live ✅ **DISPONIBLE**
- **Description**: Données générées en temps réel via GNS3
- **Format**: Flux réseau en direct (Zeek/Suricata)
- **Configuration**: `docs/GNS3_INTEGRATION.md`
- **Utilisation**: Tests en environnement réel

## 🔧 Implémentation Technique

### Pipeline de Chargement
```python
# Ordre de priorité (train_classical.py)
datasets = [
    ("NSL-KDD", load_nsl_kdd),           # ✅ Implémenté
    ("CIC-IDS2017", load_cic_ids2017),    # ✅ Implémenté  
    ("UNSW-NB15", load_unsw_nb15)         # ✅ Implémenté
]
```

### Fonctions de Conversion
- **`_convert_nsl_kdd_to_cyberai_format()`** - NSL-KDD → Format CyberAI
- **`_convert_cic_ids_to_cyberai_format()`** - CIC-IDS2017 → Format CyberAI
- **`_convert_unsw_to_cyberai_format()`** - UNSW-NB15 → Format CyberAI

### Features CyberAI Standard
```python
cyberai_columns = [
    'src_port', 'dst_port', 'proto', 'service', 'conn_state',
    'duration', 'orig_bytes', 'resp_bytes', 'orig_pkts', 'resp_pkts',
    'vlan_id', 'is_attack', 'attack_type'
]
```

## 📊 Statistiques des Datasets Implémentés

| Dataset | Enregistrements | Features | Attaques | Conversion |
|----------|---------------|-----------|-----------|-------------|
| NSL-KDD | 148,517 | 41 | 4 types | ✅ Complète |
| CIC-IDS2017 | 2.8M+ | 80 | 6 types | ✅ Complète |
| UNSW-NB15 | 2.5M+ | 45 | 10 types | ✅ Complète |

## 🚀 Installation

### Automatique (Recommandé)
```bash
# Téléchargement automatique NSL-KDD + exemples
python scripts/download_datasets.py

# Entraînement avec datasets
python scripts/train_models.py
```

### Manuel
1. Télécharger CIC-IDS2017 et UNSW-NB15 manuellement
2. Placer dans `/datasets/[NOM-DATASET]/`
3. Lancer l'entraînement

## ⚠️ Note importante
- **Fallback automatique**: Si aucun dataset public → PostgreSQL → Synthétique
- **Données synthétiques**: 10,000 échantillons avec 10 types d'attaques
- **Production**: Utilisez les datasets réels pour meilleures performances
- **Conversion**: Tous les datasets sont convertis vers format CyberAI standard

## 🎯 Performance Attendue
- **NSL-KDD**: Accuracy 88-92%
- **CIC-IDS2017**: Accuracy 90-95% 
- **UNSW-NB15**: Accuracy 85-90%
- **Synthétique**: Accuracy 70-80% (baseline)
