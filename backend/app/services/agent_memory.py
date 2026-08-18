"""CyberAI-Expert v8.0 — Agentic Memory Service
CockroachDB × AWS Hackathon - Persistent Memory Layer for AI Agents
"""

import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, func
from sqlalchemy.dialects.postgresql import vector
import numpy as np

from app.models.models import AgentMemory, AgentContext, AgentTask, ThreatEmbedding


class AgentMemoryService:
    """Service for managing agentic memory with CockroachDB vector indexing"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def store_memory(
        self,
        session_id: str,
        agent_id: str,
        memory_type: str,
        content: str,
        embedding: Optional[List[float]] = None,
        metadata: Optional[Dict[str, Any]] = None,
        importance_score: float = 0.5
    ) -> AgentMemory:
        """Store a memory with optional vector embedding for semantic search"""
        memory = AgentMemory(
            session_id=session_id,
            agent_id=agent_id,
            memory_type=memory_type,
            content=content,
            embedding=embedding,
            metadata=metadata or {},
            importance_score=importance_score,
            timestamp=datetime.now(timezone.utc)
        )
        self.db.add(memory)
        await self.db.commit()
        await self.db.refresh(memory)
        return memory
    
    async def retrieve_conversation_history(
        self,
        session_id: str,
        limit: int = 50
    ) -> List[AgentMemory]:
        """Retrieve conversation history for a session"""
        result = await self.db.execute(
            select(AgentMemory)
            .where(AgentMemory.session_id == session_id)
            .where(AgentMemory.memory_type == "conversation")
            .where(AgentMemory.is_active == True)
            .order_by(AgentMemory.timestamp.desc())
            .limit(limit)
        )
        return result.scalars().all()
    
    async def semantic_search(
        self,
        query_embedding: List[float],
        agent_id: Optional[str] = None,
        memory_type: Optional[str] = None,
        limit: int = 10,
        similarity_threshold: float = 0.7
    ) -> List[AgentMemory]:
        """Perform semantic search using CockroachDB vector indexing"""
        query = select(AgentMemory)
        
        if agent_id:
            query = query.where(AgentMemory.agent_id == agent_id)
        if memory_type:
            query = query.where(AgentMemory.memory_type == memory_type)
        
        # Vector similarity search using cosine distance
        query = query.order_by(
            AgentMemory.embedding.cosine_distance(query_embedding)
        ).limit(limit)
        
        result = await self.db.execute(query)
        memories = result.scalars().all()
        
        # Filter by similarity threshold
        filtered_memories = []
        for memory in memories:
            if memory.embedding:
                similarity = self._cosine_similarity(query_embedding, memory.embedding)
                if similarity >= similarity_threshold:
                    filtered_memories.append(memory)
        
        return filtered_memories
    
    async def update_context(
        self,
        agent_id: str,
        context_key: str,
        context_value: str,
        embedding: Optional[List[float]] = None
    ) -> AgentContext:
        """Update or create agent context"""
        result = await self.db.execute(
            select(AgentContext).where(AgentContext.agent_id == agent_id).where(AgentContext.context_key == context_key)
        )
        context = result.scalar_one_or_none()
        
        if context:
            context.context_value = context_value
            context.embedding = embedding
            context.last_accessed = datetime.now(timezone.utc)
            context.access_count += 1
            context.updated_at = datetime.now(timezone.utc)
        else:
            context = AgentContext(
                agent_id=agent_id,
                context_key=context_key,
                context_value=context_value,
                embedding=embedding,
                last_accessed=datetime.now(timezone.utc),
                access_count=1
            )
            self.db.add(context)
        
        await self.db.commit()
        await self.db.refresh(context)
        return context
    
    async def get_context(
        self,
        agent_id: str,
        context_key: Optional[str] = None
    ) -> List[AgentContext]:
        """Retrieve agent context"""
        query = select(AgentContext).where(AgentContext.agent_id == agent_id)
        if context_key:
            query = query.where(AgentContext.context_key == context_key)
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def create_task(
        self,
        task_id: str,
        agent_id: str,
        task_type: str,
        input_data: Dict[str, Any],
        priority: int = 5,
        embedding: Optional[List[float]] = None
    ) -> AgentTask:
        """Create a new agent task"""
        task = AgentTask(
            task_id=task_id,
            agent_id=agent_id,
            task_type=task_type,
            status="pending",
            input_data=input_data,
            priority=priority,
            embedding=embedding,
            created_at=datetime.now(timezone.utc)
        )
        self.db.add(task)
        await self.db.commit()
        await self.db.refresh(task)
        return task
    
    async def update_task_status(
        self,
        task_id: str,
        status: str,
        output_data: Optional[Dict[str, Any]] = None,
        error_message: Optional[str] = None
    ) -> Optional[AgentTask]:
        """Update task status"""
        result = await self.db.execute(
            select(AgentTask).where(AgentTask.task_id == task_id)
        )
        task = result.scalar_one_or_none()
        
        if task:
            task.status = status
            if output_data:
                task.output_data = output_data
            if error_message:
                task.error_message = error_message
            
            if status == "in_progress":
                task.started_at = datetime.now(timezone.utc)
            elif status in ["completed", "failed"]:
                task.completed_at = datetime.now(timezone.utc)
            
            task.updated_at = datetime.now(timezone.utc)
            await self.db.commit()
            await self.db.refresh(task)
        
        return task
    
    async def get_pending_tasks(
        self,
        agent_id: Optional[str] = None,
        task_type: Optional[str] = None,
        limit: int = 10
    ) -> List[AgentTask]:
        """Get pending tasks for agents"""
        query = select(AgentTask).where(AgentTask.status == "pending")
        
        if agent_id:
            query = query.where(AgentTask.agent_id == agent_id)
        if task_type:
            query = query.where(AgentTask.task_type == task_type)
        
        query = query.order_by(AgentTask.priority.desc(), AgentTask.created_at.asc()).limit(limit)
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def store_threat_embedding(
        self,
        threat_id: str,
        threat_type: str,
        description: str,
        embedding: List[float],
        iocs: Optional[List[Dict[str, Any]]] = None,
        mitre_techniques: Optional[List[str]] = None,
        severity: str = "medium",
        source: str = "internal"
    ) -> ThreatEmbedding:
        """Store threat intelligence with vector embedding"""
        threat = ThreatEmbedding(
            threat_id=threat_id,
            threat_type=threat_type,
            description=description,
            embedding=embedding,
            iocs=iocs or [],
            mitre_techniques=mitre_techniques or [],
            severity=severity,
            source=source,
            created_at=datetime.now(timezone.utc)
        )
        self.db.add(threat)
        await self.db.commit()
        await self.db.refresh(threat)
        return threat
    
    async def search_threats(
        self,
        query_embedding: List[float],
        threat_type: Optional[str] = None,
        severity: Optional[str] = None,
        limit: int = 10
    ) -> List[ThreatEmbedding]:
        """Semantic search for threats using vector similarity"""
        query = select(ThreatEmbedding)
        
        if threat_type:
            query = query.where(ThreatEmbedding.threat_type == threat_type)
        if severity:
            query = query.where(ThreatEmbedding.severity == severity)
        
        # Vector similarity search
        query = query.order_by(
            ThreatEmbedding.embedding.cosine_distance(query_embedding)
        ).limit(limit)
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def cleanup_old_memories(
        self,
        days_to_keep: int = 30,
        importance_threshold: float = 0.3
    ) -> int:
        """Clean up old, low-importance memories"""
        cutoff_date = datetime.now(timezone.utc).replace(
            day=datetime.now(timezone.utc).day - days_to_keep
        )
        
        result = await self.db.execute(
            delete(AgentMemory)
            .where(AgentMemory.timestamp < cutoff_date)
            .where(AgentMemory.importance_score < importance_threshold)
            .where(AgentMemory.is_active == True)
        )
        await self.db.commit()
        return result.rowcount
    
    def _cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """Calculate cosine similarity between two vectors"""
        if not vec1 or not vec2:
            return 0.0
        
        vec1_np = np.array(vec1)
        vec2_np = np.array(vec2)
        
        dot_product = np.dot(vec1_np, vec2_np)
        norm1 = np.linalg.norm(vec1_np)
        norm2 = np.linalg.norm(vec2_np)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        return dot_product / (norm1 * norm2)
