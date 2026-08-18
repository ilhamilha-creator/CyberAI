"""CyberAI-Expert v8.0 — Agentic Memory API Endpoints
CockroachDB × AWS Hackathon - Persistent Memory Layer for AI Agents
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.agent_memory import AgentMemoryService
from app.schemas.agent_memory import (
    MemoryCreate,
    MemoryResponse,
    ContextCreate,
    ContextResponse,
    TaskCreate,
    TaskResponse,
    ThreatEmbeddingCreate,
    ThreatEmbeddingResponse,
    SemanticSearchRequest,
    SemanticSearchResponse
)

router = APIRouter()


@router.post("/memories", response_model=MemoryResponse, status_code=status.HTTP_201_CREATED)
async def store_memory(
    memory: MemoryCreate,
    db: AsyncSession = Depends(get_db)
):
    """Store a memory with optional vector embedding for semantic search"""
    service = AgentMemoryService(db)
    memory_obj = await service.store_memory(
        session_id=memory.session_id,
        agent_id=memory.agent_id,
        memory_type=memory.memory_type,
        content=memory.content,
        embedding=memory.embedding,
        metadata=memory.metadata,
        importance_score=memory.importance_score
    )
    return memory_obj


@router.get("/memories/{session_id}", response_model=List[MemoryResponse])
async def get_conversation_history(
    session_id: str,
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
):
    """Retrieve conversation history for a session"""
    service = AgentMemoryService(db)
    memories = await service.retrieve_conversation_history(session_id, limit)
    return memories


@router.post("/memories/search", response_model=List[SemanticSearchResponse])
async def semantic_search(
    request: SemanticSearchRequest,
    db: AsyncSession = Depends(get_db)
):
    """Perform semantic search using CockroachDB vector indexing"""
    if not request.query_embedding:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="query_embedding is required for semantic search"
        )
    
    service = AgentMemoryService(db)
    memories = await service.semantic_search(
        query_embedding=request.query_embedding,
        agent_id=request.agent_id,
        memory_type=request.memory_type,
        limit=request.limit,
        similarity_threshold=request.similarity_threshold
    )
    
    return [
        SemanticSearchResponse(
            memory=memory,
            similarity=service._cosine_similarity(request.query_embedding, memory.embedding) if memory.embedding else 0.0
        )
        for memory in memories
    ]


@router.post("/context", response_model=ContextResponse, status_code=status.HTTP_201_CREATED)
async def update_context(
    context: ContextCreate,
    db: AsyncSession = Depends(get_db)
):
    """Update or create agent context"""
    service = AgentMemoryService(db)
    context_obj = await service.update_context(
        agent_id=context.agent_id,
        context_key=context.context_key,
        context_value=context.context_value,
        embedding=context.embedding
    )
    return context_obj


@router.get("/context/{agent_id}", response_model=List[ContextResponse])
async def get_context(
    agent_id: str,
    context_key: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Retrieve agent context"""
    service = AgentMemoryService(db)
    contexts = await service.get_context(agent_id, context_key)
    return contexts


@router.post("/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task: TaskCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new agent task"""
    service = AgentMemoryService(db)
    task_obj = await service.create_task(
        task_id=task.task_id,
        agent_id=task.agent_id,
        task_type=task.task_type,
        input_data=task.input_data,
        priority=task.priority,
        embedding=task.embedding
    )
    return task_obj


@router.put("/tasks/{task_id}/status", response_model=TaskResponse)
async def update_task_status(
    task_id: str,
    status: str,
    output_data: Optional[Dict[str, Any]] = None,
    error_message: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Update task status"""
    service = AgentMemoryService(db)
    task = await service.update_task_status(
        task_id=task_id,
        status=status,
        output_data=output_data,
        error_message=error_message
    )
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task {task_id} not found"
        )
    
    return task


@router.get("/tasks/pending", response_model=List[TaskResponse])
async def get_pending_tasks(
    agent_id: Optional[str] = None,
    task_type: Optional[str] = None,
    limit: int = 10,
    db: AsyncSession = Depends(get_db)
):
    """Get pending tasks for agents"""
    service = AgentMemoryService(db)
    tasks = await service.get_pending_tasks(agent_id, task_type, limit)
    return tasks


@router.post("/threats", response_model=ThreatEmbeddingResponse, status_code=status.HTTP_201_CREATED)
async def store_threat_embedding(
    threat: ThreatEmbeddingCreate,
    db: AsyncSession = Depends(get_db)
):
    """Store threat intelligence with vector embedding"""
    service = AgentMemoryService(db)
    threat_obj = await service.store_threat_embedding(
        threat_id=threat.threat_id,
        threat_type=threat.threat_type,
        description=threat.description,
        embedding=threat.embedding,
        iocs=threat.iocs,
        mitre_techniques=threat.mitre_techniques,
        severity=threat.severity,
        source=threat.source
    )
    return threat_obj


@router.post("/threats/search", response_model=List[ThreatEmbeddingResponse])
async def search_threats(
    query_embedding: List[float],
    threat_type: Optional[str] = None,
    severity: Optional[str] = None,
    limit: int = 10,
    db: AsyncSession = Depends(get_db)
):
    """Semantic search for threats using vector similarity"""
    if not query_embedding:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="query_embedding is required for semantic search"
        )
    
    service = AgentMemoryService(db)
    threats = await service.search_threats(
        query_embedding=query_embedding,
        threat_type=threat_type,
        severity=severity,
        limit=limit
    )
    return threats


@router.delete("/memories/cleanup")
async def cleanup_old_memories(
    days_to_keep: int = 30,
    importance_threshold: float = 0.3,
    db: AsyncSession = Depends(get_db)
):
    """Clean up old, low-importance memories"""
    service = AgentMemoryService(db)
    deleted_count = await service.cleanup_old_memories(days_to_keep, importance_threshold)
    return {"deleted_count": deleted_count}
