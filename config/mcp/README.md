# CockroachDB MCP Server Configuration

## Overview

This directory contains the Model Context Protocol (MCP) server configuration for integrating CockroachDB with AI agents in the CyberAI-Expert v8.0 platform.

## Hackathon Integration

### CockroachDB Tools Used

1. **CockroachDB Cloud Managed MCP Server**
   - Connects AI agents directly to CockroachDB clusters
   - Works natively with Claude Code, Cursor, and VS Code
   - Safe by default: read-only mode, full audit logging
   - Configuration: `cockroachdb-mcp-config.json`

2. **CockroachDB Distributed Vector Indexing**
   - IVFFlat vector indexes on agentic memory tables
   - Semantic search for conversation history and context
   - Scales with data growth without reindexing
   - Tables: `agent_memory`, `agent_context`, `agent_tasks`, `threat_embeddings`

3. **CockroachDB Agent Skills Repo**
   - Open-source collection of machine-executable Agent Skills
   - Skills for query design, operations, performance, security
   - Portable across Claude, Cursor, LangChain, and MCP clients

## MCP Server Setup

### Local Development

```bash
# Install MCP server
npm install -g @modelcontextprotocol/server-postgres

# Test connection
npx @modelcontextprotocol/server-postgres \
  "postgresql://cyberai:CyberAI_S3cur3_2024!@localhost:26257/cyberai_soc?sslmode=disable"
```

### CockroachDB Cloud

For production deployment with CockroachDB Cloud:

1. Create a CockroachDB Cloud cluster at https://cockroachlabs.cloud
2. Generate connection string from Cloud Console
3. Update `cockroachdb-mcp-config.json` with cloud connection string
4. Enable MCP Server from Cloud Console (single config snippet)

Example cloud connection:
```json
{
  "command": "npx",
  "args": [
    "-y",
    "@modelcontextprotocol/server-postgres@latest",
    "postgresql://user:pass@cluster-name.cockroachlabs.cloud:26257/defaultdb?sslmode=require"
  ]
}
```

## Agentic Memory Schema

### Agent Memory Table
- Stores conversation history with vector embeddings
- Semantic search using IVFFlat vector index
- Supports memory prioritization with importance scores

### Agent Context Table
- Long-term context storage for agents
- Vector embeddings for context retrieval
- Access tracking for context optimization

### Agent Tasks Table
- Task state management for agentic workflows
- Vector embeddings for task similarity search
- Status tracking for multi-step workflows

### Threat Embeddings Table
- Vector embeddings for threat intelligence
- Semantic search for threat patterns
- MITRE technique mapping

## Usage with AI Agents

### Claude Code Integration

1. Add MCP server configuration to Claude Code settings
2. Agents can query CockroachDB directly
3. Vector search for semantic memory retrieval

### Cursor Integration

1. Configure MCP server in Cursor settings
2. Use AI assistant to query agentic memory
3. Leverage vector indexing for context-aware responses

### LangChain Integration

```python
from langchain_community.utilities import SQLDatabase
from langchain_community.agent_toolkits import SQLDatabaseToolkit

# Connect to CockroachDB via MCP
db = SQLDatabase.from_uri(
    "postgresql://cyberai:CyberAI_S3cur3_2024!@cockroachdb:26257/cyberai_soc?sslmode=disable"
)

toolkit = SQLDatabaseToolkit(db=db, llm=llm)
```

## Security Features

- **Read-only mode** by default for MCP connections
- **Full audit logging** of all agent queries
- **Service account RBAC** for granular access control
- **SSL/TLS encryption** for cloud deployments

## Monitoring

Access CockroachDB Admin UI:
- Local: http://localhost:8080
- Cloud: Available in CockroachDB Cloud Console

Monitor:
- Query performance
- Vector index usage
- Agent memory growth
- Connection metrics

## Troubleshooting

### Connection Issues
```bash
# Test CockroachDB connection
docker exec -it cyberai-cockroachdb cockroach sql --insecure --host=localhost

# Check MCP server logs
# Logs available in your AI editor's MCP server panel
```

### Vector Index Issues
```sql
-- Check vector index status
SHOW INDEXES FROM agent_memory;
SHOW INDEXES FROM agent_context;
SHOW INDEXES FROM agent_tasks;
```

## Hackathon Submission Notes

This MCP configuration demonstrates:
- ✅ Direct agent-to-database connectivity
- ✅ Production-grade memory persistence
- ✅ Semantic search capabilities
- ✅ Secure by default design
- ✅ Audit logging for compliance
