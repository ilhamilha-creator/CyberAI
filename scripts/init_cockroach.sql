-- ============================================================
-- CyberAI-Expert v8.0 — CockroachDB Initialization Script
-- With Distributed Vector Indexing for Agentic Memory
-- ============================================================

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS cyberai_soc;

-- Connect to the database
\c cyberai_soc

-- Enable vector extension (CockroachDB has built-in vector support)
-- Note: CockroachDB v24.1+ has native vector support

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- AGENTIC_memory TABLES WITH VECTOR INDEXING
-- ============================================================

-- Agent Memory Table with Vector Indexing
CREATE TABLE IF NOT EXISTS agent_memory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id STRING(64) NOT NULL,
    agent_id STRING(100) NOT NULL,
    memory_type STRING(50) NOT NULL,
    content STRING NOT NULL,
    embedding VECTOR(1536),
    metadata JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    importance_score FLOAT DEFAULT 0.5,
    is_active BOOL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    INDEX ix_agent_memory_session (session_id),
    INDEX ix_agent_memory_agent (agent_id),
    INDEX ix_agent_memory_type (memory_type),
    INDEX ix_agent_memory_timestamp (timestamp)
);

-- Create vector index for semantic search on agent memory
CREATE INDEX ix_agent_memory_embedding_ivf ON agent_memory 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

-- Agent Context Table
CREATE TABLE IF NOT EXISTS agent_context (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_id STRING(100) UNIQUE NOT NULL,
    context_key STRING(255) NOT NULL,
    context_value STRING,
    embedding VECTOR(1536),
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    access_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    INDEX ix_agent_context_agent (agent_id),
    INDEX ix_agent_context_key (context_key)
);

-- Create vector index for context retrieval
CREATE INDEX ix_agent_context_embedding_ivf ON agent_context 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 50);

-- Agent Task Table
CREATE TABLE IF NOT EXISTS agent_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id STRING(100) UNIQUE NOT NULL,
    agent_id STRING(100) NOT NULL,
    task_type STRING(50) NOT NULL,
    status STRING(20) DEFAULT 'pending',
    input_data JSONB,
    output_data JSONB,
    error_message STRING,
    embedding VECTOR(1536),
    priority INT DEFAULT 5,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    INDEX ix_agent_tasks_task_id (task_id),
    INDEX ix_agent_tasks_agent (agent_id),
    INDEX ix_agent_tasks_status (status),
    INDEX ix_agent_tasks_type (task_type)
);

-- Create vector index for task similarity search
CREATE INDEX ix_agent_tasks_embedding_ivf ON agent_tasks 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 50);

-- Threat Embeddings Table
CREATE TABLE IF NOT EXISTS threat_embeddings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    threat_id STRING(100) NOT NULL,
    threat_type STRING(50) NOT NULL,
    description STRING,
    embedding VECTOR(1536) NOT NULL,
    iocs JSONB,
    mitre_techniques ARRAY(STRING),
    severity STRING(20) DEFAULT 'medium',
    source STRING(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    INDEX ix_threat_embeddings_id (threat_id),
    INDEX ix_threat_embeddings_type (threat_type),
    INDEX ix_threat_embeddings_severity (severity)
);

-- Create vector index for threat semantic search
CREATE INDEX ix_threat_embeddings_embedding_ivf ON threat_embeddings 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

-- ============================================================
-- ORIGINAL CYBERAI TABLES (PostgreSQL-compatible)
-- ============================================================

-- Network Events Table
CREATE TABLE IF NOT EXISTS network_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    uid STRING(64) UNIQUE NOT NULL,
    ts TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    src_ip STRING(45) NOT NULL,
    dst_ip STRING(45) NOT NULL,
    src_port INT,
    dst_port INT,
    proto STRING(10) DEFAULT 'TCP',
    service STRING(50),
    duration FLOAT DEFAULT 0,
    orig_bytes DECIMAL,
    resp_bytes DECIMAL,
    orig_pkts INT DEFAULT 0,
    resp_pkts INT DEFAULT 0,
    conn_state STRING(10),
    vlan_id INT,
    is_attack BOOL DEFAULT false,
    attack_type STRING(50) DEFAULT 'normal',
    severity STRING(20) DEFAULT 'info',
    mitre_tactic STRING(15),
    mitre_technique STRING(15),
    kill_chain_phase STRING(50),
    confidence FLOAT DEFAULT 0.0,
    threat_actor STRING(50),
    session_id STRING(64),
    indicators JSONB,
    source STRING(20) DEFAULT 'generator',
    dataset_name STRING(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    INDEX ix_network_events_uid (uid),
    INDEX ix_network_events_ts (ts),
    INDEX ix_network_events_src_ip (src_ip),
    INDEX ix_network_events_dst_ip (dst_ip),
    INDEX ix_network_events_vlan_id (vlan_id),
    INDEX ix_network_events_is_attack (is_attack),
    INDEX ix_network_events_severity (severity),
    INDEX ix_network_events_session_id (session_id)
);

-- Alerts Table
CREATE TABLE IF NOT EXISTS alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_uid STRING(64),
    ts TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    severity STRING(20) NOT NULL DEFAULT 'medium',
    alert_type STRING(50) NOT NULL,
    title STRING(255) NOT NULL,
    description STRING,
    src_ip STRING(45),
    dst_ip STRING(45),
    src_port INT,
    dst_port INT,
    vlan_id INT,
    mitre_tactic STRING(15),
    mitre_technique STRING(15),
    kill_chain_phase STRING(50),
    confidence FLOAT DEFAULT 0.0,
    threat_actor STRING(50),
    model_name STRING(100),
    model_version STRING(20),
    status STRING(20) DEFAULT 'new',
    assigned_to STRING(100),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes STRING,
    false_positive BOOL DEFAULT false,
    session_id STRING(64),
    raw_event JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    INDEX ix_alerts_event_uid (event_uid),
    INDEX ix_alerts_ts (ts),
    INDEX ix_alerts_severity (severity),
    INDEX ix_alerts_alert_type (alert_type),
    INDEX ix_alerts_status (status)
);

-- Predictions Table
CREATE TABLE IF NOT EXISTS predictions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_uid STRING(64),
    ts TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    model_name STRING(100) NOT NULL,
    model_version STRING(20),
    predicted_class STRING(50) NOT NULL,
    confidence FLOAT NOT NULL,
    inference_latency_ms FLOAT,
    features JSONB,
    mitre_mapping JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    INDEX ix_predictions_event_uid (event_uid),
    INDEX ix_predictions_ts (ts),
    INDEX ix_predictions_model_name (model_name)
);

-- ML Models Table
CREATE TABLE IF NOT EXISTS ml_models (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name STRING(100) NOT NULL,
    version STRING(20) NOT NULL,
    model_type STRING(50) NOT NULL,
    framework STRING(50),
    accuracy FLOAT,
    precision_score FLOAT,
    recall FLOAT,
    f1_score FLOAT,
    roc_auc FLOAT,
    training_samples INT,
    training_duration_sec FLOAT,
    file_path STRING(500),
    is_production BOOL DEFAULT false,
    description STRING,
    hyperparameters JSONB,
    feature_importance JSONB,
    confusion_matrix JSONB,
    dataset_used STRING(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uix_model_name_version UNIQUE (name, version)
);

-- SOC Labels Table
CREATE TABLE IF NOT EXISTS soc_labels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    alert_id UUID,
    event_uid STRING(64),
    analyst STRING(100) NOT NULL,
    label STRING(20) NOT NULL,
    confirmed_type STRING(50),
    notes STRING,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    INDEX ix_soc_labels_alert_id (alert_id)
);

-- IP Blocklist Table
CREATE TABLE IF NOT EXISTS ip_blocklist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_address STRING(45) NOT NULL,
    reason STRING,
    blocked_by STRING(100),
    severity STRING(20) DEFAULT 'high',
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    INDEX ix_ip_blocklist_ip (ip_address)
);

-- Threat Intel Table
CREATE TABLE IF NOT EXISTS threat_intel (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ioc_type STRING(20) NOT NULL,
    ioc_value STRING(500) NOT NULL,
    threat_type STRING(50),
    confidence FLOAT DEFAULT 0.5,
    source STRING(100),
    first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tags JSONB,
    is_active BOOL DEFAULT true,
    INDEX ix_threat_intel_ioc_value (ioc_value)
);

-- Dataset Meta Table
CREATE TABLE IF NOT EXISTS dataset_meta (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name STRING(100) UNIQUE NOT NULL,
    description STRING,
    source STRING(100),
    total_samples INT,
    attack_ratio FLOAT,
    features_count INT,
    file_path STRING(500),
    minio_bucket STRING(100) DEFAULT 'datasets',
    status STRING(20) DEFAULT 'ready',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- SAMPLE DATA FOR AGENTIC MEMORY DEMO
-- ============================================================

-- Insert sample agent memory
INSERT INTO agent_memory (session_id, agent_id, memory_type, content, metadata, importance_score)
VALUES 
    ('session-001', 'threat-analyzer', 'conversation', 'User reported suspicious activity from IP 192.168.1.100', '{"source": "user_report", "priority": "high"}', 0.8),
    ('session-001', 'threat-analyzer', 'context', 'Investigating potential lateral movement in network segment 192.168.1.0/24', '{"investigation_id": "INV-2024-001"}', 0.9),
    ('session-002', 'incident-responder', 'task_state', 'Isolating affected host 192.168.1.100 from network', '{"action": "isolation", "host": "192.168.1.100"}', 0.95);

-- Insert sample agent context
INSERT INTO agent_context (agent_id, context_key, context_value, access_count)
VALUES 
    ('threat-analyzer', 'current_investigation', 'INV-2024-001: Lateral movement detection', 5),
    ('threat-analyzer', 'watchlist_ips', '["192.168.1.100", "10.0.0.50", "172.16.0.25"]', 12),
    ('incident-responder', 'active_incidents', '["INC-2024-089", "INC-2024-090"]', 8);

-- Insert sample agent tasks
INSERT INTO agent_tasks (task_id, agent_id, task_type, status, input_data, priority)
VALUES 
    ('TASK-001', 'threat-analyzer', 'threat_analysis', 'in_progress', '{"ip": "192.168.1.100", "time_range": "24h"}', 8),
    ('TASK-002', 'incident-responder', 'response', 'pending', '{"incident_id": "INC-2024-089", "action": "isolate"}', 10);

-- ============================================================
-- GRANT PERMISSIONS
-- ============================================================

-- Grant necessary permissions (adjust based on your security requirements)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO cyberai;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO cyberai;

-- ============================================================
-- COMPLETION MESSAGE
-- ============================================================

SELECT 'CockroachDB initialization completed successfully!' AS status;
SELECT 'Vector indexes created for agentic memory tables' AS vector_status;
SELECT 'Agentic memory system ready for AI agents' AS agent_status;
