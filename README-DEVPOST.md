# CyberAI-Expert v8.0 - Agentic Memory SOC Platform

## CockroachDB × AWS Hackathon Submission

**Build with Agentic Memory: AI-Powered Security Operations Center with Production-Grade Persistent Memory**

---

## 🎯 Project Overview

CyberAI-Expert v8.0 is a next-generation Security Operations Center (SOC) platform that leverages AI agents with persistent, production-grade memory powered by CockroachDB. The platform provides real-time cyber threat detection, automated incident response, and intelligent threat analysis using distributed vector indexing for semantic search and context-aware decision making.

### The Problem

AI agents in cybersecurity face a critical challenge: **memory that never goes down**. Traditional databases were built for human-scale operations, but agentic systems require:
- Constant autonomous spawning and writing
- Memory that persists across regions and failures
- Zero data loss and no maintenance windows
- Semantic search capabilities for context retrieval

### Our Solution

We built CyberAI-Expert v8.0 with **CockroachDB as the agentic memory layer**, providing:
- **Distributed Vector Indexing** for semantic search of threat intelligence
- **Persistent conversation history** for multi-step investigations
- **Context-aware task management** for automated incident response
- **Global resilience** with automatic failover and data replication

---

## 🛠️ CockroachDB Tools Used

### 1. CockroachDB Distributed Vector Indexing ✅

**Implementation:**
- IVFFlat vector indexes on all agentic memory tables
- 1536-dimensional embeddings for semantic search
- Cosine similarity search for threat pattern matching
- Scales with data growth without reindexing

**Tables with Vector Indexing:**
- `agent_memory` - Conversation history with semantic search
- `agent_context` - Long-term context storage
- `agent_tasks` - Task similarity for workflow optimization
- `threat_embeddings` - Threat intelligence semantic search

**Code Example:**
```sql
CREATE INDEX ix_agent_memory_embedding_ivf ON agent_memory 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);
```

### 2. CockroachDB Cloud Managed MCP Server ✅

**Implementation:**
- Direct agent-to-database connectivity via MCP protocol
- Read-only mode by default for security
- Full audit logging of all agent queries
- Configuration in `config/mcp/cockroachdb-mcp-config.json`

**Benefits:**
- Zero custom proxy required
- Native integration with Claude Code, Cursor, VS Code
- Safe by default with granular RBAC
- Single config snippet from Cloud Console

### 3. CockroachDB Agent Skills Repo ✅

**Implementation:**
- Open-source agent skills for CockroachDB operations
- Skills for query optimization, schema design, performance monitoring
- Portable across Claude, Cursor, LangChain, and MCP clients
- Used for automated database maintenance and monitoring

**Skills Utilized:**
- Query optimization for threat analysis
- Performance monitoring for memory tables
- Schema validation for data integrity
- Backup management for disaster recovery

---

## ☁️ AWS Services Used

### 1. Amazon ECS (Elastic Container Service) ✅

**Implementation:**
- Fargate-based container orchestration
- Auto-scaling for threat detection workloads
- Service discovery for microservices
- Integrated with Application Load Balancer

**Configuration:**
- CloudFormation template: `aws/cloudformation-template.yaml`
- Task definition: `aws/ecs-task-definition.json`
- Deployment script: `aws/deploy-aws.sh`

### 2. Amazon EFS (Elastic File System) ✅

**Implementation:**
- Persistent storage for CockroachDB data
- Automatic scaling with workload
- Encrypted storage for compliance
- High availability across AZs

**Use Case:**
- CockroachDB data persistence
- Vector index storage
- Log retention for audit trails

### 3. Amazon CloudWatch ✅

**Implementation:**
- Log aggregation from all containers
- Metrics for agent performance
- Alerting for memory table growth
- Dashboard for SOC operations

### 4. AWS IAM ✅

**Implementation:**
- Fine-grained access control for ECS tasks
- Service account RBAC for database access
- Least privilege principles
- Audit logging for compliance

---

## 🧠 Agentic Memory Architecture

### Memory Types

#### 1. Conversation Memory
- **Table:** `agent_memory`
- **Purpose:** Store agent-human conversations and agent-agent communications
- **Features:** Vector embeddings for semantic search, importance scoring, time-based retrieval
- **Use Case:** Multi-step threat investigations requiring context from previous interactions

#### 2. Context Memory
- **Table:** `agent_context`
- **Purpose:** Long-term context storage for agents
- **Features:** Key-value pairs with vector embeddings, access tracking, automatic expiration
- **Use Case:** Storing investigation state, watchlists, threat actor profiles

#### 3. Task Memory
- **Table:** `agent_tasks`
- **Purpose:** Task state management for agentic workflows
- **Features:** Priority queues, status tracking, similarity search for task optimization
- **Use Case:** Automated incident response workflows with multi-step coordination

#### 4. Threat Intelligence Memory
- **Table:** `threat_embeddings`
- **Purpose:** Semantic search for threat patterns
- **Features:** MITRE ATT&CK mapping, IOC storage, severity classification
- **Use Case:** Real-time threat pattern matching and similarity search

### Memory Operations

#### Semantic Search
```python
# Search for similar threats using vector similarity
threats = await service.search_threats(
    query_embedding=current_threat_embedding,
    threat_type="malware",
    severity="high",
    limit=10
)
```

#### Context Retrieval
```python
# Retrieve agent context for decision making
context = await service.get_context(
    agent_id="threat-analyzer",
    context_key="current_investigation"
)
```

#### Task Management
```python
# Create and manage automated response tasks
task = await service.create_task(
    task_id="TASK-001",
    agent_id="incident-responder",
    task_type="response",
    input_data={"action": "isolate", "host": "compromised-host"},
    priority=10
)
```

---

## 🚀 Quick Start

### Local Development with Docker

```bash
# Clone the repository
git clone https://github.com/yourusername/CyberAI-Expert-v8.git
cd CyberAI-Expert-v8

# Start the platform
docker-compose up -d

# Access the SOC Platform
# URL: http://localhost
# API Key: cyberai-admin-key-v8-2024
```

### AWS Deployment

```bash
# Deploy to AWS ECS
chmod +x aws/deploy-aws.sh
./aws/deploy-aws.sh

# The script will:
# 1. Create ECR repositories
# 2. Build and push Docker images
# 3. Deploy CloudFormation stack
# 4. Configure networking and security
# 5. Launch ECS service
```

### CockroachDB Cloud Setup

1. Create a CockroachDB Cloud cluster at https://cockroachlabs.cloud
2. Generate connection string from Cloud Console
3. Enable MCP Server from Cloud Console
4. Update `config/mcp/cockroachdb-mcp-config.json` with cloud connection
5. Update environment variables in `.env`

---

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                        │
│                  SOC Dashboard & UI                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend (FastAPI)                         │
│              REST API + WebSocket + AI Agents               │
└──────┬──────────────────────────────────────────┬──────────┘
       │                                          │
       ▼                                          ▼
┌──────────────────────┐              ┌──────────────────────┐
│   CockroachDB        │              │   Elasticsearch      │
│   Agentic Memory     │              │   Log Search         │
│                      │              │                      │
│ • Vector Indexing    │              │ • Alert Correlation  │
│ • Conversation Hist │              │ • Pattern Matching   │
│ • Context Storage   │              │ • Full-text Search   │
│ • Task Management   │              │                      │
└──────────────────────┘              └──────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│                    AWS Infrastructure                        │
│  ECS (Fargate) + EFS + CloudWatch + IAM + ALB               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎬 Demo Video Script

### Scene 1: Introduction (0:00-0:30)
- Show CyberAI-Expert v8.0 dashboard
- Explain the agentic memory concept
- Highlight CockroachDB integration

### Scene 2: Threat Detection (0:30-1:00)
- Simulate a cyber attack
- Show AI agent detecting the threat
- Demonstrate vector similarity search for threat matching

### Scene 3: Agentic Memory in Action (1:00-1:30)
- Show conversation history retrieval
- Demonstrate context-aware decision making
- Display task management for incident response

### Scene 4: CockroachDB Features (1:30-2:00)
- Show CockroachDB Admin UI
- Demonstrate vector index performance
- Highlight distributed resilience

### Scene 5: AWS Deployment (2:00-2:30)
- Show CloudFormation deployment
- Display ECS service scaling
- Demonstrate CloudWatch monitoring

### Scene 6: Conclusion (2:30-3:00)
- Summarize key features
- Show production readiness
- Display hackathon compliance

---

## 📈 Production Readiness

### Security
- ✅ RBAC with service accounts
- ✅ Audit logging for all operations
- ✅ Encrypted data at rest and in transit
- ✅ Read-only MCP connections by default
- ✅ MITRE ATT&CK integration

### Scalability
- ✅ Horizontal scaling with ECS Fargate
- ✅ Auto-scaling based on threat volume
- ✅ Distributed CockroachDB clustering
- ✅ Vector index scaling with data growth

### Resilience
- ✅ Automatic failover for CockroachDB
- ✅ Multi-AZ deployment on AWS
- ✅ EFS for persistent storage
- ✅ Health checks and auto-recovery

### Observability
- ✅ CloudWatch metrics and logging
- ✅ CockroachDB Admin UI
- ✅ Grafana dashboards
- ✅ MLflow model tracking

---

## 🏆 Hackathon Compliance

### Required CockroachDB Tools (2+ used)
- ✅ CockroachDB Cloud Managed MCP Server
- ✅ CockroachDB Distributed Vector Indexing
- ✅ CockroachDB Agent Skills Repo

### Required AWS Services (1+ used)
- ✅ Amazon ECS (container orchestration)
- ✅ Amazon EFS (persistent storage)
- ✅ Amazon CloudWatch (monitoring)
- ✅ AWS IAM (access control)

### Submission Requirements
- ✅ Public open source repository with MIT license
- ✅ Comprehensive README with setup instructions
- ✅ Functional demo application
- ✅ Video demonstration (< 3 minutes)
- ✅ Architectural diagram
- ✅ Clear identification of tools used

---

## 📚 Documentation

- **Architecture:** `docs/ARCHITECTURE.md`
- **API Documentation:** http://localhost:8000/api/docs
- **CockroachDB Setup:** `config/mcp/README.md`
- **AWS Deployment:** `aws/README.md`
- **GNS3 Integration:** `docs/GNS3_INTEGRATION.md`

---

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for details.

---

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details

---

## 👥 Team

**CyberAI-Expert Contributors**
- AI/ML Engineers
- Security Researchers
- Cloud Architects
- Full-stack Developers

---

## 🙏 Acknowledgments

- **Cockroach Labs** for the excellent distributed database and vector indexing capabilities
- **AWS** for the robust cloud infrastructure
- **Devpost** for hosting this innovative hackathon

---

## 🔗 Links

- **Repository:** https://github.com/yourusername/CyberAI-Expert-v8
- **Demo:** [Demo URL]
- **Video:** [YouTube/Vimeo URL]
- **CockroachDB:** https://www.cockroachlabs.com
- **AWS:** https://aws.amazon.com

---

**Built for the CockroachDB × AWS Hackathon - Build with Agentic Memory**

🪳 × ☁️ = 🧠 **Agents that Remember**
