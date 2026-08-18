"""
Fonctions de conversion pour datasets publics vers format CyberAI
"""

import pandas as pd
import numpy as np
import logging

logger = logging.getLogger("cyberai.ml.converters")

# Mapping des classes d'attaques CyberAI
ATTACK_CLASSES = {
    "normal": 0, "ddos": 1, "port_scan": 2, "brute_force": 3,
    "sql_injection": 4, "malware_c2": 5, "lateral_movement": 6,
    "data_exfiltration": 7, "ransomware": 8, "dns_tunneling": 9,
    "credential_dumping": 10,
}

def _convert_nsl_kdd_to_cyberai_format(df: pd.DataFrame, label_mapping: dict) -> pd.DataFrame:
    """Convertit NSL-KDD vers format CyberAI."""
    try:
        # Mapper les labels
        df['attack_type'] = df['label'].map(label_mapping).fillna('normal')
        
        # Mapper les protocoles
        proto_mapping = {'tcp': 'TCP', 'udp': 'UDP', 'icmp': 'ICMP'}
        df['proto'] = df['protocol_type'].str.lower().map(proto_mapping).fillna('TCP')
        
        # Mapper les services (simplification)
        service_mapping = {
            'http': 'http', 'ftp': 'ftp', 'smtp': 'smtp', 'dns': 'dns',
            'telnet': 'ssh', 'ssh': 'ssh', 'pop3': 'mail', 'imap': 'mail'
        }
        df['service'] = df['service'].str.lower().map(service_mapping).fillna('other')
        
        # Mapper les états de connexion
        flag_mapping = {
            'SF': 'SF', 'S0': 'S0', 'REJ': 'REJ', 'RSTR': 'REJ',
            'RSTO': 'RSTO', 'RSTOS0': 'RSTO', 'OTH': 'OTH'
        }
        df['conn_state'] = df['flag'].map(flag_mapping).fillna('SF')
        
        # Convertir les ports
        df['src_port'] = np.random.randint(1024, 65535, len(df))  # NSL-KDD n'a pas de ports src
        df['dst_port'] = np.where(
            df['service'] == 'http', 80,
            np.where(df['service'] == 'ftp', 21,
            np.where(df['service'] == 'ssh', 22,
            np.where(df['service'] == 'dns', 53,
            np.where(df['service'] == 'smtp', 25, np.random.randint(1, 65535, len(df))))))
        )
        
        # Durée (déjà en secondes)
        df['duration'] = df['duration'].fillna(0)
        
        # Bytes et paquets
        df['orig_bytes'] = df['src_bytes'].fillna(0)
        df['resp_bytes'] = df['dst_bytes'].fillna(0)
        
        # Estimer les paquets à partir des bytes
        df['orig_pkts'] = np.maximum(1, df['orig_bytes'] // 1500).astype(int)
        df['resp_pkts'] = np.maximum(1, df['resp_bytes'] // 1500).astype(int)
        
        # VLAN aléatoire
        df['vlan_id'] = np.random.choice([10, 20, 30, 40, 50, 100, 200], len(df))
        
        # Flag attaque
        df['is_attack'] = df['attack_type'] != 'normal'
        
        # Sélectionner les colonnes CyberAI
        cyberai_cols = [
            'src_port', 'dst_port', 'proto', 'service', 'conn_state',
            'duration', 'orig_bytes', 'resp_bytes', 'orig_pkts', 'resp_pkts',
            'vlan_id', 'is_attack', 'attack_type'
        ]
        
        return df[cyberai_cols]
        
    except Exception as e:
        logger.error("Erreur conversion NSL-KDD: %s", e)
        raise


def _convert_cic_ids_to_cyberai_format(df: pd.DataFrame) -> pd.DataFrame:
    """Convertit CIC-IDS2017 vers format CyberAI."""
    try:
        # Nettoyer et mapper les labels
        if 'Label' in df.columns:
            df['is_attack'] = df['Label'] != 'BENIGN'
            
            # Mapper les types d'attaques spécifiques
            attack_mapping = {
                'DDoS': 'ddos', 'DoS': 'ddos', 'DoS GoldenEye': 'ddos',
                'DoS Hulk': 'ddos', 'DoS Slowhttptest': 'ddos', 'DoS slowloris': 'ddos',
                'PortScan': 'port_scan', 'Web Attack': 'sql_injection',
                'Web Attack Brute Force': 'brute_force', 
                'Web Attack Sql Injection': 'sql_injection',
                'Web Attack XSS': 'sql_injection',
                'Infiltration': 'lateral_movement', 'Bot': 'malware_c2',
                'FTP-Patator': 'brute_force', 'SSH-Patator': 'brute_force',
                'Heartbleed': 'malware_c2'
            }
            
            df['attack_type'] = df['Label'].map(attack_mapping).fillna('normal')
        else:
            df['is_attack'] = False
            df['attack_type'] = 'normal'
        
        # Mapper les protocoles
        if 'Protocol' in df.columns:
            proto_mapping = {'TCP': 'TCP', 'UDP': 'UDP', 'ICMP': 'ICMP'}
            df['proto'] = df['Protocol'].map(proto_mapping).fillna('TCP')
        else:
            df['proto'] = 'TCP'
        
        # Ports
        if 'Destination Port' in df.columns:
            df['dst_port'] = df['Destination Port'].fillna(80)
        else:
            df['dst_port'] = 80
            
        df['src_port'] = np.random.randint(1024, 65535, len(df))
        
        # Service basé sur le port destination
        def map_service(port):
            if port in [80, 443, 8080]: return 'http'
            elif port in [21, 22, 23]: return 'ssh'
            elif port == 53: return 'dns'
            elif port in [25, 110, 143]: return 'mail'
            else: return 'other'
        
        df['service'] = df['dst_port'].apply(map_service)
        
        # État de connexion (généré)
        df['conn_state'] = np.where(df['is_attack'], 
                                   np.random.choice(['S0', 'REJ', 'RSTO'], len(df)),
                                   'SF')
        
        # Durée
        if 'Flow Duration' in df.columns:
            df['duration'] = df['Flow Duration'] / 1_000_000  # microseconds to seconds
        else:
            df['duration'] = 1.0
        
        # Bytes et paquets
        if 'Total Length of Fwd Packets' in df.columns:
            df['orig_bytes'] = df['Total Length of Fwd Packets'].fillna(0)
        else:
            df['orig_bytes'] = 5000
            
        if 'Total Length of Backward Packets' in df.columns:
            df['resp_bytes'] = df['Total Length of Backward Packets'].fillna(0)
        else:
            df['resp_bytes'] = 3000
        
        # Estimer les paquets
        if 'Total Forward Packets' in df.columns:
            df['orig_pkts'] = df['Total Forward Packets'].fillna(1)
        else:
            df['orig_pkts'] = np.maximum(1, df['orig_bytes'] // 1500).astype(int)
            
        if 'Total Backward Packets' in df.columns:
            df['resp_pkts'] = df['Total Backward Packets'].fillna(1)
        else:
            df['resp_pkts'] = np.maximum(1, df['resp_bytes'] // 1500).astype(int)
        
        # VLAN
        df['vlan_id'] = np.random.choice([10, 20, 30, 40, 50, 100, 200], len(df))
        
        # Colonnes CyberAI
        cyberai_cols = [
            'src_port', 'dst_port', 'proto', 'service', 'conn_state',
            'duration', 'orig_bytes', 'resp_bytes', 'orig_pkts', 'resp_pkts',
            'vlan_id', 'is_attack', 'attack_type'
        ]
        
        return df[cyberai_cols]
        
    except Exception as e:
        logger.error("Erreur conversion CIC-IDS2017: %s", e)
        raise


def _convert_unsw_to_cyberai_format(df: pd.DataFrame) -> pd.DataFrame:
    """Convertit UNSW-NB15 vers format CyberAI."""
    try:
        # Labels
        if 'Label' in df.columns:
            df['is_attack'] = df['Label'] == 1
            
            # Mapper les catégories d'attaques
            if 'attack_cat' in df.columns:
                attack_mapping = {
                    'Normal': 'normal', 'Analysis': 'normal', 'Fuzzers': 'ddos',
                    'DoS': 'ddos', 'Exploits': 'malware_c2', 'Backdoor': 'malware_c2',
                    'Shellcode': 'malware_c2', 'Worms': 'malware_c2', 'Generic': 'malware_c2',
                    'Reconnaissance': 'port_scan', 'Backdoors': 'malware_c2'
                }
                df['attack_type'] = df['attack_cat'].map(attack_mapping).fillna('normal')
            else:
                df['attack_type'] = np.where(df['is_attack'], 'malware_c2', 'normal')
        else:
            df['is_attack'] = False
            df['attack_type'] = 'normal'
        
        # Protocole
        if 'proto' in df.columns:
            proto_mapping = {'tcp': 'TCP', 'udp': 'UDP', 'icmp': 'ICMP'}
            df['proto'] = df['proto'].str.lower().map(proto_mapping).fillna('TCP')
        else:
            df['proto'] = 'TCP'
        
        # Ports
        if 'dport' in df.columns:
            df['dst_port'] = df['dport'].fillna(80)
        else:
            df['dst_port'] = 80
            
        if 'sport' in df.columns:
            df['src_port'] = df['sport'].fillna(1024)
        else:
            df['src_port'] = np.random.randint(1024, 65535, len(df))
        
        # Service
        if 'service' in df.columns:
            service_mapping = {
                'http': 'http', 'ftp': 'ftp', 'dns': 'dns', 'ssh': 'ssh',
                'smtp': 'mail', 'pop3': 'mail', 'imap': 'mail'
            }
            df['service'] = df['service'].str.lower().map(service_mapping).fillna('other')
        else:
            df['service'] = 'other'
        
        # État de connexion
        if 'state' in df.columns:
            state_mapping = {
                'FIN': 'SF', 'EST': 'SF', 'INT': 'SF', 'REQ': 'S0',
                'RST': 'REJ', 'CON': 'REJ', 'URP': 'OTH', 'ECO': 'OTH'
            }
            df['conn_state'] = df['state'].map(state_mapping).fillna('SF')
        else:
            df['conn_state'] = 'SF'
        
        # Durée
        if 'dur' in df.columns:
            df['duration'] = df['dur'].fillna(0)
        else:
            df['duration'] = 1.0
        
        # Bytes et paquets
        if 'sbytes' in df.columns:
            df['orig_bytes'] = df['sbytes'].fillna(0)
        else:
            df['orig_bytes'] = 5000
            
        if 'dbbytes' in df.columns:
            df['resp_bytes'] = df['dbbytes'].fillna(0)
        else:
            df['resp_bytes'] = 3000
        
        if 'spkts' in df.columns:
            df['orig_pkts'] = df['spkts'].fillna(1)
        else:
            df['orig_pkts'] = np.maximum(1, df['orig_bytes'] // 1500).astype(int)
            
        if 'dpkts' in df.columns:
            df['resp_pkts'] = df['dpkts'].fillna(1)
        else:
            df['resp_pkts'] = np.maximum(1, df['resp_bytes'] // 1500).astype(int)
        
        # VLAN
        df['vlan_id'] = np.random.choice([10, 20, 30, 40, 50, 100, 200], len(df))
        
        # Colonnes CyberAI
        cyberai_cols = [
            'src_port', 'dst_port', 'proto', 'service', 'conn_state',
            'duration', 'orig_bytes', 'resp_bytes', 'orig_pkts', 'resp_pkts',
            'vlan_id', 'is_attack', 'attack_type'
        ]
        
        return df[cyberai_cols]
        
    except Exception as e:
        logger.error("Erreur conversion UNSW-NB15: %s", e)
        raise
