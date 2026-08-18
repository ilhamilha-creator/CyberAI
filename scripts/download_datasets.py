#!/usr/bin/env python3
"""
CyberAI-Expert v8.0 - Téléchargement automatique des datasets publics
"""

import os
import sys
import logging
import requests
import zipfile
import tarfile
from pathlib import Path
from urllib.parse import urlparse

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# Configuration
DATASET_DIR = "/app/datasets"
BASE_URL = "https://raw.githubusercontent.com/elastic/examples/master/Common%20Data%20Formats/nsld-kdd/"

# URLs des datasets (remplacer par les vraies URLs)
DATASET_URLS = {
    "NSL-KDD": {
        "train": "https://iscx.ca/NSL-KDD-Dataset/KDDTrain+.txt",
        "test": "https://iscx.ca/NSL-KDD-Dataset/KDDTest+.txt",
        "info": "https://iscx.ca/NSL-KDD-Dataset/KDDTrain+.arff"
    },
    "CIC-IDS2017": {
        "info": "https://www.unb.ca/cic/datasets/ids-2017.html",
        "note": "Téléchargement manuel requis - voir documentation"
    },
    "UNSW-NB15": {
        "info": "https://www.unsw.adfa.edu.au/unsw-canberra-cyber-security/",
        "note": "Téléchargement manuel requis - voir documentation"
    }
}

def download_file(url: str, destination: str) -> bool:
    """Télécharge un fichier depuis une URL."""
    try:
        logger.info("Téléchargement: %s", url)
        response = requests.get(url, stream=True, timeout=30)
        response.raise_for_status()
        
        os.makedirs(os.path.dirname(destination), exist_ok=True)
        
        with open(destination, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
        
        logger.info("✅ Téléchargé: %s", destination)
        return True
        
    except Exception as e:
        logger.error("❌ Erreur téléchargement %s: %s", url, e)
        return False

def extract_archive(archive_path: str, extract_to: str) -> bool:
    """Extrait une archive (zip/tar)."""
    try:
        if archive_path.endswith('.zip'):
            with zipfile.ZipFile(archive_path, 'r') as zip_ref:
                zip_ref.extractall(extract_to)
        elif archive_path.endswith(('.tar.gz', '.tgz')):
            with tarfile.open(archive_path, 'r:gz') as tar_ref:
                tar_ref.extractall(extract_to)
        elif archive_path.endswith('.tar'):
            with tarfile.open(archive_path, 'r') as tar_ref:
                tar_ref.extractall(extract_to)
        else:
            logger.warning("Format non supporté: %s", archive_path)
            return False
            
        logger.info("✅ Extrait: %s", archive_path)
        return True
        
    except Exception as e:
        logger.error("❌ Erreur extraction %s: %s", archive_path, e)
        return False

def download_nsl_kdd(dataset_dir: str) -> bool:
    """Télécharge le dataset NSL-KDD."""
    logger.info("Téléchargement NSL-KDD...")
    
    nsl_dir = os.path.join(dataset_dir, "NSL-KDD")
    os.makedirs(nsl_dir, exist_ok=True)
    
    success = True
    for name, url in DATASET_URLS["NSL-KDD"].items():
        if name == "info":
            continue
            
        filename = f"KDD{name.title()}.txt"
        destination = os.path.join(nsl_dir, filename)
        
        if not os.path.exists(destination):
            if not download_file(url, destination):
                success = False
        else:
            logger.info("✅ Déjà présent: %s", filename)
    
    return success

def create_sample_datasets(dataset_dir: str) -> bool:
    """Crée des datasets d'exemple pour test."""
    logger.info("Création datasets d'exemple...")
    
    import pandas as pd
    import numpy as np
    
    # Créer un échantillon NSL-KDD
    nsl_dir = os.path.join(dataset_dir, "NSL-KDD")
    os.makedirs(nsl_dir, exist_ok=True)
    
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
    
    # Générer 1000 échantillons
    np.random.seed(42)
    samples = []
    
    for i in range(1000):
        is_attack = np.random.random() < 0.3
        if is_attack:
            label = np.random.choice(["back", "land", "neptune", "pod", "smurf", "teardrop", "ipsweep", "nmap", "portsweep", "satan"])
        else:
            label = "normal"
            
        sample = [
            np.random.exponential(1.0),  # duration
            np.random.choice(["tcp", "udp", "icmp"]),  # protocol_type
            np.random.choice(["http", "ftp", "smtp", "dns", "ssh", "other"]),  # service
            np.random.choice(["SF", "S0", "REJ", "RSTR"]),  # flag
            np.random.exponential(5000),  # src_bytes
            np.random.exponential(3000),  # dst_bytes
            0,  # land
            0,  # wrong_fragment
            0,  # urgent
            0,  # hot
            0,  # num_failed_logins
            np.random.choice([0, 1]),  # logged_in
            0,  # num_compromised
            0,  # root_shell
            0,  # su_attempted
            0,  # num_root
            0,  # num_file_creations
            0,  # num_shells
            0,  # num_access_files
            0,  # num_outbound_cmds
            0,  # is_host_login
            np.random.choice([0, 1]),  # is_guest_login
            np.random.randint(1, 100),  # count
            np.random.randint(1, 50),  # srv_count
            np.random.random(),  # serror_rate
            np.random.random(),  # srv_serror_rate
            np.random.random(),  # rerror_rate
            np.random.random(),  # srv_rerror_rate
            np.random.random(),  # same_srv_rate
            np.random.random(),  # diff_srv_rate
            np.random.random(),  # srv_diff_host_rate
            np.random.randint(1, 100),  # dst_host_count
            np.random.randint(1, 50),  # dst_host_srv_count
            np.random.random(),  # dst_host_same_srv_rate
            np.random.random(),  # dst_host_diff_srv_rate
            np.random.random(),  # dst_host_same_src_port_rate
            np.random.random(),  # dst_host_srv_diff_host_rate
            np.random.random(),  # dst_host_serror_rate
            np.random.random(),  # dst_host_srv_serror_rate
            np.random.random(),  # dst_host_rerror_rate
            np.random.random(),  # dst_host_srv_rerror_rate
            label,  # label
            np.random.randint(1, 21)  # difficulty
        ]
        samples.append(sample)
    
    # Sauvegarder
    df = pd.DataFrame(samples, columns=columns)
    
    # Split train/test
    train_df = df.iloc[:800]
    test_df = df.iloc[800:]
    
    train_df.to_csv(os.path.join(nsl_dir, "KDDTrain+.txt"), sep=',', index=False, header=False)
    test_df.to_csv(os.path.join(nsl_dir, "KDDTest+.txt"), sep=',', index=False, header=False)
    
    logger.info("✅ Dataset NSL-KDD d'exemple créé: %d échantillons", len(df))
    return True

def main():
    """Fonction principale."""
    logger.info("CyberAI-Expert v8.0 - Téléchargement datasets")
    
    # Créer le dossier datasets
    os.makedirs(DATASET_DIR, exist_ok=True)
    
    # Essayer de télécharger NSL-KDD
    if not download_nsl_kdd(DATASET_DIR):
        logger.warning("Échec téléchargement NSL-KDD, création d'exemples...")
        create_sample_datasets(DATASET_DIR)
    
    # Afficher les informations pour les autres datasets
    logger.info("\n" + "="*60)
    logger.info("AUTRES DATASETS - Téléchargement manuel requis")
    logger.info("="*60)
    
    for name, info in DATASET_URLS.items():
        if name != "NSL-KDD":
            logger.info(f"\n{name}:")
            for key, value in info.items():
                logger.info(f"  {key}: {value}")
    
    logger.info("\n" + "="*60)
    logger.info("Instructions:")
    logger.info("1. Téléchargez manuellement CIC-IDS2017 et UNSW-NB15")
    logger.info("2. Placez-les dans /app/datasets/[NOM-DATASET]/")
    logger.info("3. Les modèles les utiliseront automatiquement")
    logger.info("="*60)
    
    logger.info("✅ Installation terminée")

if __name__ == "__main__":
    main()
