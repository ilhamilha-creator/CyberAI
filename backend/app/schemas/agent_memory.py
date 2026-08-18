"""CyberAI-Expert v8.0 — Agentic Memory Schemas
CockroachDB × AWS Hackathon - Persistent Memory Layer for AI Agents
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


class MemoryCreate(BaseModel):
    session_id: str = Field(..., description="Session identifier")
    agent_id: str = Field(..., description="Agent identifier")
    memory_type: str = Field(..., description="Type of memory: conversation, context, task_state, observation")
    content: str = Field(..., description="Memory content")
    embedding: Optional[List[float]] = Field(None, description="Vector embedding for semantic search")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional metadata")
    importance_score: float = Field(default=0.5, ge=0.0, le=1.0, description="Importance score for prioritization")


class MemoryResponse(BaseModel):
    id: str
    session_id: str
    agent_id: str
    memory_type: str
    content: str
    embedding: Optional[List[float]]
    metadata: Dict[str, Any]
    timestamp: datetime
    importance_score: float
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class ContextCreate(BaseModel):
    agent_id: str = Field(..., description="Agent identifier")
    context_key: str = Field(..., description="Context key")
    context_value: str = Field(..., description="Context value")
    embedding: Optional[List[float]] = Field(None, description="Vector embedding for context retrieval")


class ContextResponse(BaseModel):
    id: str
    agent_id: str
    context_key: str
    context_value: str
    embedding: Optional[List[float]]
    last_accessed: datetime
    access_count: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class TaskCreate(BaseModel):
    task_id: str = Field(..., description="Unique task identifier")
    agent_id: str = Field(..., description="Agent identifier")
    task_type: str = Field(..., description="Type of task: threat_analysis, investigation, response")
    input_data: Dict[str, Any] = Field(default_factory=dict, description="Task input data")
    priority: int = Field(default=5, ge=1, le=10, description="Task priority (1-10)")
    embedding: Optional[List[float]] = Field(None, description="Vector embedding for task similarity")


class TaskResponse(BaseModel):
    id: str
    task_id: str
    agent_id: str
    task_type: str
    status: str
    input_data: Dict[str, Any]
    output_data: Dict[str, Any]
    error_message: Optional[str]
    embedding: Optional[List[float]]
    priority: int
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ThreatEmbeddingCreate(BaseModel):
    threat_id: str = Field(..., description="Threat identifier")
    threat_type: str = Field(..., description="Type of threat: malware, phishing, ddos")
    description: str = Field(..., description="Threat description")
    embedding: List[float] = Field(..., description="Vector embedding for semantic search")
    iocs: Optional[List[Dict[str, Any]]] = Field(default_factory=list, description="Indicators of compromise")
    mitre_techniques: Optional[List[str]] = Field(default_factory=list, description="MITRE ATT&CK techniques")
    severity: str = Field(default="medium", description="Threat severity")
    source: str = Field(default="internal", description="Threat intelligence source")


class ThreatEmbeddingResponse(BaseModel):
    id: str
    threat_id: str
    threat_type: str
    description: str
    embedding: List[float]
    iocs: List[Dict[str, Any]]
    mitre_techniques: List[str]
    severity: str
    source: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class SemanticSearchRequest(BaseModel):
    query_embedding: List[float] = Field(..., description="Query vector embedding")
    agent_id: Optional[str] = Field(None, description="Filter by agent ID")
    memory_type: Optional[str] = Field(None, description="Filter by memory type")
    limit: int = Field(default=10, ge=1, le=100, description="Maximum results")
    similarity_threshold: float = Field(default=0.7, ge=0.0, le=1.0, description="Minimum similarity score")


class SemanticSearchResponse(BaseModel):
    memory: MemoryResponse
    similarity: float = Field(..., description="Cosine similarity score")
