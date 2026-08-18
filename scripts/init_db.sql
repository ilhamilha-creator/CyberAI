-- ============================================================
-- CyberAI-Expert v7.0 — Schéma PostgreSQL Complet
-- Base de données SOC avec tables, indexes, vues et données initiales
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- TABLE : network_events — Événements réseau bruts
-- ============================================================
CREATE TABLE IF NOT EXISTS network_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uid VARCHAR(64) UNIQUE NOT NULL,
    ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    src_ip INET NOT NULL,
    dst_ip INET NOT NULL,
    src_port INTEGER,
    dst_port INTEGER,
    proto VARCHAR(10) DEFAULT 'TCP',
    service VARCHAR(50),
    duration FLOAT DEFAULT 0,
    orig_bytes BIGINT DEFAULT 0,
    resp_bytes BIGINT DEFAULT 0,
    orig_pkts INTEGER DEFAULT 0,
    resp_pkts INTEGER DEFAULT 0,
    conn_state VARCHAR(10),
    vlan_id INTEGER,
    is_attack BOOLEAN DEFAULT FALSE,
    attack_type VARCHAR(50),
    severity VARCHAR(20) DEFAULT 'info',
    mitre_tactic VARCHAR(10),
    mitre_technique VARCHAR(10),
    kill_chain_phase VARCHAR(50),
    confidence FLOAT DEFAULT 0.0,
    threat_actor VARCHAR(50),
    session_id VARCHAR(64),
    indicators JSONB DEFAULT '{}',
    geo_src JSONB DEFAULT '{}',
    geo_dst JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE : alerts — Alertes SOC
-- ============================================================
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_uid VARCHAR(64) REFERENCES network_events(uid) ON DELETE SET NULL,
    ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    severity VARCHAR(20) NOT NULL DEFAULT 'medium',
    alert_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    src_ip INET,
    dst_ip INET,
    src_port INTEGER,
    dst_port INTEGER,
    vlan_id INTEGER,
    mitre_tactic VARCHAR(10),
    mitre_technique VARCHAR(10),
    kill_chain_phase VARCHAR(50),
    confidence FLOAT DEFAULT 0.0,
    threat_actor VARCHAR(50),
    model_name VARCHAR(100),
    model_version VARCHAR(20),
    status VARCHAR(20) DEFAULT 'new',
    assigned_to VARCHAR(100),
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    false_positive BOOLEAN DEFAULT FALSE,
    session_id VARCHAR(64),
    raw_event JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE : predictions — Prédictions ML
-- ============================================================
CREATE TABLE IF NOT EXISTS predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_uid VARCHAR(64),
    ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    model_name VARCHAR(100) NOT NULL,
    model_version VARCHAR(20),
    predicted_class VARCHAR(50) NOT NULL,
    confidence FLOAT NOT NULL,
    inference_latency_ms FLOAT,
    features JSONB DEFAULT '{}',
    mitre_mapping JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE : ml_models — Registre des Modèles
-- ============================================================
CREATE TABLE IF NOT EXISTS ml_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    version VARCHAR(20) NOT NULL,
    model_type VARCHAR(50) NOT NULL,
    framework VARCHAR(50),
    accuracy FLOAT,
    precision_score FLOAT,
    recall FLOAT,
    f1_score FLOAT,
    roc_auc FLOAT,
    training_samples INTEGER,
    training_duration_sec FLOAT,
    file_path VARCHAR(500),
    is_production BOOLEAN DEFAULT FALSE,
    description TEXT,
    hyperparameters JSONB DEFAULT '{}',
    feature_importance JSONB DEFAULT '{}',
    confusion_matrix JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(name, version)
);

-- ============================================================
-- TABLE : soc_labels — Feedback Analystes
-- ============================================================
CREATE TABLE IF NOT EXISTS soc_labels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_id UUID REFERENCES alerts(id) ON DELETE CASCADE,
    event_uid VARCHAR(64),
    analyst VARCHAR(100) NOT NULL,
    label VARCHAR(20) NOT NULL,
    confirmed_type VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE : ip_blocklist — IPs Bloquées
-- ============================================================
CREATE TABLE IF NOT EXISTS ip_blocklist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ip_address INET NOT NULL,
    reason TEXT,
    blocked_by VARCHAR(100),
    severity VARCHAR(20) DEFAULT 'high',
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE : api_keys — Clés API
-- ============================================================
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key_hash VARCHAR(128) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'analyst',
    is_active BOOLEAN DEFAULT TRUE,
    last_used TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE : generator_stats — Stats du Générateur
-- ============================================================
CREATE TABLE IF NOT EXISTS generator_stats (
    id SERIAL PRIMARY KEY,
    ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    total_events BIGINT DEFAULT 0,
    total_attacks BIGINT DEFAULT 0,
    events_per_second FLOAT DEFAULT 0,
    active_sessions INTEGER DEFAULT 0,
    attack_distribution JSONB DEFAULT '{}'
);

-- ============================================================
-- INDEXES — Performance des requêtes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_events_ts ON network_events(ts DESC);
CREATE INDEX IF NOT EXISTS idx_events_severity ON network_events(severity);
CREATE INDEX IF NOT EXISTS idx_events_src_ip ON network_events(src_ip);
CREATE INDEX IF NOT EXISTS idx_events_dst_ip ON network_events(dst_ip);
CREATE INDEX IF NOT EXISTS idx_events_vlan ON network_events(vlan_id);
CREATE INDEX IF NOT EXISTS idx_events_attack ON network_events(is_attack);
CREATE INDEX IF NOT EXISTS idx_events_session ON network_events(session_id);

CREATE INDEX IF NOT EXISTS idx_alerts_ts ON alerts(ts DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_type ON alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_alerts_vlan ON alerts(vlan_id);
CREATE INDEX IF NOT EXISTS idx_alerts_session ON alerts(session_id);

CREATE INDEX IF NOT EXISTS idx_predictions_ts ON predictions(ts DESC);
CREATE INDEX IF NOT EXISTS idx_predictions_model ON predictions(model_name);
CREATE INDEX IF NOT EXISTS idx_predictions_class ON predictions(predicted_class);

CREATE INDEX IF NOT EXISTS idx_blocklist_ip ON ip_blocklist(ip_address);
CREATE INDEX IF NOT EXISTS idx_blocklist_active ON ip_blocklist(is_active);

-- ============================================================
-- VUES — Agrégations SOC
-- ============================================================

-- Vue principale SOC
CREATE OR REPLACE VIEW v_soc_dashboard AS
SELECT
    a.id,
    a.ts,
    a.severity,
    a.alert_type,
    a.title,
    a.src_ip,
    a.dst_ip,
    a.vlan_id,
    a.mitre_tactic,
    a.mitre_technique,
    a.kill_chain_phase,
    a.confidence,
    a.threat_actor,
    a.model_name,
    a.status,
    a.false_positive,
    a.session_id,
    p.predicted_class,
    p.inference_latency_ms,
    l.label AS analyst_label,
    l.confirmed_type
FROM alerts a
LEFT JOIN predictions p ON a.event_uid = p.event_uid
LEFT JOIN soc_labels l ON a.id = l.alert_id;

-- KPIs 24h
CREATE OR REPLACE VIEW v_kpis_24h AS
SELECT
    COUNT(*) AS total_alerts,
    COUNT(*) FILTER (WHERE severity = 'critical') AS critical_alerts,
    COUNT(*) FILTER (WHERE severity = 'high') AS high_alerts,
    COUNT(*) FILTER (WHERE severity = 'medium') AS medium_alerts,
    COUNT(*) FILTER (WHERE severity = 'low') AS low_alerts,
    COUNT(*) FILTER (WHERE status = 'new') AS new_alerts,
    COUNT(*) FILTER (WHERE status = 'acknowledged') AS ack_alerts,
    COUNT(*) FILTER (WHERE status = 'closed') AS closed_alerts,
    COUNT(*) FILTER (WHERE false_positive = TRUE) AS false_positives,
    ROUND(AVG(EXTRACT(EPOCH FROM (resolved_at - ts)))::numeric / 60, 2) AS avg_mttr_minutes,
    ROUND(
        (COUNT(*) FILTER (WHERE status = 'closed' AND false_positive = FALSE)::numeric /
        NULLIF(COUNT(*) FILTER (WHERE status = 'closed'), 0)) * 100, 2
    ) AS detection_accuracy_pct
FROM alerts
WHERE ts >= NOW() - INTERVAL '24 hours';

-- Vue timeline horaire
CREATE OR REPLACE VIEW v_alerts_timeline AS
SELECT
    date_trunc('hour', ts) AS hour,
    severity,
    COUNT(*) AS count
FROM alerts
WHERE ts >= NOW() - INTERVAL '24 hours'
GROUP BY date_trunc('hour', ts), severity
ORDER BY hour DESC;

-- Vue risk score par VLAN
CREATE OR REPLACE VIEW v_vlan_risk AS
SELECT
    vlan_id,
    COUNT(*) AS total_alerts,
    COUNT(*) FILTER (WHERE severity = 'critical') * 4 +
    COUNT(*) FILTER (WHERE severity = 'high') * 3 +
    COUNT(*) FILTER (WHERE severity = 'medium') * 2 +
    COUNT(*) FILTER (WHERE severity = 'low') * 1 AS risk_score,
    array_agg(DISTINCT alert_type) AS attack_types,
    array_agg(DISTINCT threat_actor) FILTER (WHERE threat_actor IS NOT NULL) AS threat_actors
FROM alerts
WHERE ts >= NOW() - INTERVAL '24 hours'
GROUP BY vlan_id;

-- ============================================================
-- DONNÉES INITIALES
-- ============================================================

-- API Keys par défaut
INSERT INTO api_keys (key_hash, username, role) VALUES
    (md5('cyberai-admin-key-2024'), 'admin', 'admin'),
    (md5('cyberai-analyst-key-2024'), 'analyst', 'analyst')
ON CONFLICT (key_hash) DO NOTHING;

-- Modèles ML initiaux
INSERT INTO ml_models (name, version, model_type, framework, accuracy, precision_score, recall, f1_score, roc_auc, is_production, description) VALUES
    ('RandomForest', 'v1.0', 'classification', 'scikit-learn', 0.9745, 0.9812, 0.9678, 0.9744, 0.9956, TRUE, 'Random Forest 100 arbres — Classification 5 classes'),
    ('XGBoost', 'v1.0', 'classification', 'xgboost', 0.9823, 0.9867, 0.9789, 0.9828, 0.9978, FALSE, 'XGBoost optimisé — Classification multi-classes'),
    ('LSTM', 'v1.0', 'sequence', 'tensorflow', 0.9567, 0.9623, 0.9512, 0.9567, 0.9890, FALSE, 'LSTM 2 couches — Détection séquences d''attaques'),
    ('Autoencoder', 'v1.0', 'anomaly', 'tensorflow', 0.9234, 0.9345, 0.9123, 0.9233, NULL, FALSE, 'Autoencoder — Détection anomalies non supervisée'),
    ('GNN-GraphSAGE', 'v1.0', 'graph', 'pytorch-geometric', 0.9456, 0.9512, 0.9401, 0.9456, 0.9834, FALSE, 'GraphSAGE — Détection lateral movement'),
    ('Ensemble-Voting', 'v1.0', 'ensemble', 'scikit-learn', 0.9867, 0.9901, 0.9834, 0.9867, 0.9989, FALSE, 'Ensemble RF + XGBoost + LightGBM')
ON CONFLICT (name, version) DO NOTHING;

RAISE NOTICE '=== CyberAI-Expert v7.0 — Base de données initialisée ===';

-- v8.0 additions
ALTER TABLE network_events ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'generator';
ALTER TABLE network_events ADD COLUMN IF NOT EXISTS dataset_name VARCHAR(50);

-- Threat Intelligence table
CREATE TABLE IF NOT EXISTS threat_intel (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ioc_type VARCHAR(20) NOT NULL,
    ioc_value VARCHAR(500) NOT NULL,
    threat_type VARCHAR(50),
    confidence FLOAT DEFAULT 0.5,
    source VARCHAR(100),
    first_seen TIMESTAMPTZ DEFAULT NOW(),
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    tags JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE
);
CREATE INDEX IF NOT EXISTS idx_threat_intel_value ON threat_intel(ioc_value);

-- Dataset metadata table
CREATE TABLE IF NOT EXISTS dataset_meta (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    source VARCHAR(100),
    total_samples INTEGER,
    attack_ratio FLOAT,
    features_count INTEGER,
    file_path VARCHAR(500),
    minio_bucket VARCHAR(100) DEFAULT 'datasets',
    status VARCHAR(20) DEFAULT 'ready',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed datasets
INSERT INTO dataset_meta (name, source, description, status) VALUES
    ('NSL-KDD', 'public', 'NSL-KDD intrusion detection dataset', 'available'),
    ('CIC-IDS2017', 'public', 'Canadian Institute for Cybersecurity IDS 2017', 'available'),
    ('CIC-DDoS2019', 'public', 'CIC DDoS 2019 dataset', 'available'),
    ('UNSW-NB15', 'public', 'UNSW-NB15 network dataset', 'available'),
    ('TON_IoT', 'public', 'TON_IoT telemetry dataset', 'available'),
    ('GNS3-Live', 'gns3', 'Real-time GNS3 network capture via Zeek/Suricata', 'active')
ON CONFLICT (name) DO NOTHING;
