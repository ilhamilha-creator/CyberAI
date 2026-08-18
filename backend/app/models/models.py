"""CyberAI-Expert v8.0 — Database Models with CockroachDB Vector Indexing"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, BigInteger, JSON, ForeignKey, Index, ARRAY
from sqlalchemy.dialects.postgresql import UUID, INET, VECTOR
from app.core.database import Base


class NetworkEvent(Base):
    __tablename__ = "network_events"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    uid = Column(String(64), unique=True, nullable=False, index=True)
    ts = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), index=True)
    src_ip = Column(String(45), nullable=False, index=True)
    dst_ip = Column(String(45), nullable=False, index=True)
    src_port = Column(Integer)
    dst_port = Column(Integer)
    proto = Column(String(10), default="TCP")
    service = Column(String(50))
    duration = Column(Float, default=0)
    orig_bytes = Column(BigInteger, default=0)
    resp_bytes = Column(BigInteger, default=0)
    orig_pkts = Column(Integer, default=0)
    resp_pkts = Column(Integer, default=0)
    conn_state = Column(String(10))
    vlan_id = Column(Integer, index=True)
    is_attack = Column(Boolean, default=False, index=True)
    attack_type = Column(String(50), default="normal")
    severity = Column(String(20), default="info", index=True)
    mitre_tactic = Column(String(15))
    mitre_technique = Column(String(15))
    kill_chain_phase = Column(String(50))
    confidence = Column(Float, default=0.0)
    threat_actor = Column(String(50))
    session_id = Column(String(64), index=True)
    indicators = Column(JSON, default={})
    source = Column(String(20), default="generator")  # generator, zeek, suricata, dataset
    dataset_name = Column(String(50))
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class Alert(Base):
    __tablename__ = "alerts"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_uid = Column(String(64), index=True)
    ts = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), index=True)
    severity = Column(String(20), nullable=False, default="medium", index=True)
    alert_type = Column(String(50), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    src_ip = Column(String(45))
    dst_ip = Column(String(45))
    src_port = Column(Integer)
    dst_port = Column(Integer)
    vlan_id = Column(Integer)
    mitre_tactic = Column(String(15))
    mitre_technique = Column(String(15))
    kill_chain_phase = Column(String(50))
    confidence = Column(Float, default=0.0)
    threat_actor = Column(String(50))
    model_name = Column(String(100))
    model_version = Column(String(20))
    status = Column(String(20), default="new", index=True)
    assigned_to = Column(String(100))
    resolved_at = Column(DateTime(timezone=True))
    resolution_notes = Column(Text)
    false_positive = Column(Boolean, default=False)
    session_id = Column(String(64))
    raw_event = Column(JSON, default={})
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class Prediction(Base):
    __tablename__ = "predictions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_uid = Column(String(64), index=True)
    ts = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
    model_name = Column(String(100), nullable=False, index=True)
    model_version = Column(String(20))
    predicted_class = Column(String(50), nullable=False)
    confidence = Column(Float, nullable=False)
    inference_latency_ms = Column(Float)
    features = Column(JSON, default={})
    mitre_mapping = Column(JSON, default={})
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class MLModel(Base):
    __tablename__ = "ml_models"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    version = Column(String(20), nullable=False)
    model_type = Column(String(50), nullable=False)
    framework = Column(String(50))
    accuracy = Column(Float)
    precision_score = Column(Float)
    recall = Column(Float)
    f1_score = Column(Float)
    roc_auc = Column(Float)
    training_samples = Column(Integer)
    training_duration_sec = Column(Float)
    file_path = Column(String(500))
    is_production = Column(Boolean, default=False)
    description = Column(Text)
    hyperparameters = Column(JSON, default={})
    feature_importance = Column(JSON, default={})
    confusion_matrix = Column(JSON, default={})
    dataset_used = Column(String(100))
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    __table_args__ = (Index("uix_model_name_version", "name", "version", unique=True),)


class SOCLabel(Base):
    __tablename__ = "soc_labels"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    alert_id = Column(UUID(as_uuid=True), index=True)
    event_uid = Column(String(64))
    analyst = Column(String(100), nullable=False)
    label = Column(String(20), nullable=False)
    confirmed_type = Column(String(50))
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class IPBlocklist(Base):
    __tablename__ = "ip_blocklist"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ip_address = Column(String(45), nullable=False, index=True)
    reason = Column(Text)
    blocked_by = Column(String(100))
    severity = Column(String(20), default="high")
    expires_at = Column(DateTime(timezone=True))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class ThreatIntel(Base):
    __tablename__ = "threat_intel"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ioc_type = Column(String(20), nullable=False)  # ip, domain, hash, url
    ioc_value = Column(String(500), nullable=False, index=True)
    threat_type = Column(String(50))
    confidence = Column(Float, default=0.5)
    source = Column(String(100))
    first_seen = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    last_seen = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    tags = Column(JSON, default=[])
    is_active = Column(Boolean, default=True)


class DatasetMeta(Base):
    __tablename__ = "dataset_meta"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text)
    source = Column(String(100))  # nsl-kdd, cicids2017, unsw-nb15, gns3, etc.
    total_samples = Column(Integer)
    attack_ratio = Column(Float)
    features_count = Column(Integer)
    file_path = Column(String(500))
    minio_bucket = Column(String(100), default="datasets")
    status = Column(String(20), default="ready")  # ready, processing, error
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


# ==================== AGENTIC MEMORY MODELS ====================

class AgentMemory(Base):
    """Agentic memory for storing conversation history and context"""
    __tablename__ = "agent_memory"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(String(64), nullable=False, index=True)
    agent_id = Column(String(100), nullable=False, index=True)  # Which agent created this memory
    memory_type = Column(String(50), nullable=False, index=True)  # conversation, context, task_state, observation
    content = Column(Text, nullable=False)
    embedding = Column(VECTOR(1536))  # For semantic search using CockroachDB vector indexing
    metadata = Column(JSON, default={})
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
    importance_score = Column(Float, default=0.5)  # For memory prioritization
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    __table_args__ = (
        Index("ix_agent_memory_session", "session_id"),
        Index("ix_agent_memory_agent", "agent_id"),
        Index("ix_agent_memory_type", "memory_type"),
    )


class AgentContext(Base):
    """Long-term context storage for agents"""
    __tablename__ = "agent_context"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    agent_id = Column(String(100), nullable=False, unique=True, index=True)
    context_key = Column(String(255), nullable=False)
    context_value = Column(Text)
    embedding = Column(VECTOR(1536))  # Vector embedding for context retrieval
    last_accessed = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    access_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class AgentTask(Base):
    """Task state management for agentic workflows"""
    __tablename__ = "agent_tasks"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    task_id = Column(String(100), unique=True, nullable=False, index=True)
    agent_id = Column(String(100), nullable=False, index=True)
    task_type = Column(String(50), nullable=False)  # threat_analysis, investigation, response, etc.
    status = Column(String(20), default="pending", index=True)  # pending, in_progress, completed, failed
    input_data = Column(JSON, default={})
    output_data = Column(JSON, default={})
    error_message = Column(Text)
    embedding = Column(VECTOR(1536))  # For task similarity search
    priority = Column(Integer, default=5)
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class ThreatEmbedding(Base):
    """Vector embeddings for threat intelligence and semantic search"""
    __tablename__ = "threat_embeddings"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    threat_id = Column(String(100), nullable=False, index=True)
    threat_type = Column(String(50), nullable=False)  # malware, phishing, ddos, etc.
    description = Column(Text)
    embedding = Column(VECTOR(1536), nullable=False)  # Vector embedding for semantic search
    iocs = Column(JSON, default=[])  # Indicators of compromise
    mitre_techniques = Column(ARRAY(String), default=[])
    severity = Column(String(20), default="medium")
    source = Column(String(100))
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    __table_args__ = (
        Index("ix_threat_embeddings_type", "threat_type"),
        Index("ix_threat_embeddings_severity", "severity"),
    )
