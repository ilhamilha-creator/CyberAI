# Demo Video Guide - CockroachDB × AWS Hackathon

## Video Requirements
- **Duration:** Less than 3 minutes
- **Platform:** YouTube or Vimeo (public)
- **Format:** 16:9 aspect ratio, 1080p recommended
- **Audio:** Clear narration with background music (optional)

## Recording Setup

### Recommended Tools
- **Screen Recording:** OBS Studio, Loom, or Camtasia
- **Video Editing:** DaVinci Resolve, iMovie, or CapCut
- **Microphone:** USB condenser microphone for clear audio
- **Environment:** Quiet room with good lighting

### Recording Settings
- **Resolution:** 1920x1080 (1080p)
- **Frame Rate:** 30 fps
- **Bitrate:** 4000-8000 kbps
- **Audio:** 48 kHz, 16-bit or higher

---

## Demo Script (2:45 total)

### Scene 1: Introduction (0:00 - 0:25)
**Visual:** CyberAI-Expert v8.0 dashboard with animated background
**Audio:** "Welcome to CyberAI-Expert v8.0, an AI-powered Security Operations Center with production-grade agentic memory powered by CockroachDB."

**Visual:** Show project title and hackathon logo
**Audio:** "Built for the CockroachDB × AWS Hackathon, this platform demonstrates how AI agents can maintain persistent memory across regions, failures, and scale."

### Scene 2: Architecture Overview (0:25 - 0:45)
**Visual:** Architecture diagram showing CockroachDB, AWS services, and AI agents
**Audio:** "Our architecture uses CockroachDB's distributed vector indexing for semantic search, AWS ECS for container orchestration, and a complete agentic memory layer for conversation history, context storage, and task management."

**Visual:** Highlight CockroachDB components in the diagram
**Audio:** "We're using three key CockroachDB tools: Distributed Vector Indexing for threat pattern matching, the Cloud Managed MCP Server for direct agent connectivity, and the Agent Skills Repo for automated database operations."

### Scene 3: Threat Detection Demo (0:45 - 1:15)
**Visual:** SOC dashboard showing real-time threat detection
**Audio:** "Let me show you the platform in action. Here's our SOC dashboard detecting a potential cyber attack in real-time."

**Visual:** AI agent analyzing the threat with vector similarity search
**Audio:** "Our AI agent uses CockroachDB's vector indexing to search for similar threats in our threat intelligence database. This semantic search finds patterns that traditional keyword matching would miss."

**Visual:** Show vector search results with similarityscores
**Audio:** "The vector similarity search returns threats with 92% similarity, allowing our agent to quickly identify the attack type and recommend appropriate response actions."

### Scene 4: Agentic Memory in Action (1:15 - 1:45)
**Visual:** Agent conversation history retrieval from CockroachDB
**Audio:** "Now let's see the agentic memory layer in action. Our agent retrieves conversation history from previous investigations to provide context-aware recommendations."

**Visual:** Show context storage and task management
**Audio:** "The agent stores context in CockroachDB with vector embeddings, enabling semantic retrieval of relevant information. It also manages multi-step response tasks with priority queues and status tracking."

**Visual:** Demonstrate task creation and workflow execution
**Audio:** "When an incident is detected, the agent automatically creates response tasks, assigns priorities, and tracks progress - all persisted in CockroachDB for reliability."

### Scene 5: CockroachDB Features (1:45 - 2:15)
**Visual:** CockroachDB Admin UI showing vector indexes
**Audio:** "Here's the CockroachDB Admin UI showing our vector indexes. We're using IVFFlat indexes with cosine similarity for fast semantic search across millions of embeddings."

**Visual:** Show distributed architecture and automatic failover
**Audio:** "CockroachDB's distributed architecture ensures our memory layer never goes down. Automatic failover and data replication mean our agents maintain continuity even during regional outages."

**Visual:** Show MCP Server configuration
**Audio:** "The CockroachDB Cloud Managed MCP Server provides direct, secure connectivity for our AI agents with read-only mode, audit logging, and zero custom proxy requirements."

### Scene 6: AWS Deployment (2:15 - 2:35)
**Visual:** AWS Console showing ECS cluster and services
**Audio:** "On AWS, we're deployed using ECS Fargate for serverless container orchestration, EFS for persistent CockroachDB storage, and CloudWatch for comprehensive monitoring."

**Visual:** Show auto-scaling and load balancing
**Audio:** "The platform auto-scales based on threat volume, with an Application Load Balancer distributing traffic across multiple backend instances for optimal performance."

### Scene 7: Conclusion (2:35 - 2:45)
**Visual:** Summary screen with key features and compliance checklist
**Audio:** "CyberAI-Expert v8.0 demonstrates production-grade agentic memory with CockroachDB and AWS, providing resilient, scalable, and intelligent threat detection for modern security operations."

**Visual:** Project title, repository link, and "Thank You"
**Audio:** "Thank you for watching our submission to the CockroachDB × AWS Hackathon. The code is open source and available on GitHub."

---

## Recording Checklist

### Pre-Recording
- [ ] Test all demo environments (local or AWS)
- [ ] Prepare sample data for threat detection demo
- [ ] Set up recording software and test audio
- [ ] Create clean browser tabs with necessary URLs
- [ ] Prepare CockroachDB Admin UI with sample data
- [ ] Test AWS Console access if using cloud deployment

### During Recording
- [ ] Start with a clear introduction
- [ ] Speak clearly and at a moderate pace
- [ ] Use mouse movements to guide attention
- [ ] Highlight key elements on screen
- [ ] Maintain consistent timing for each scene
- [ ] Keep transitions smooth between scenes

### Post-Recording
- [ ] Edit out mistakes and pauses
- [ ] Add background music (optional, keep volume low)
- [ ] Add text overlays for key terms
- [ ] Ensure audio levels are consistent
- [ ] Export in appropriate format for YouTube/Vimeo
- [ ] Test upload to platform

---

## Demo Environment Setup

### Local Demo (Recommended)
```bash
# Start the platform
docker-compose up -d

# Wait for services to be ready (2-3 minutes)
# Access: http://localhost
# API Key: cyberai-admin-key-v8-2024

# Generate sample data
curl -X POST http://localhost:8000/api/v1/generate/sample-data
```

### AWS Demo
```bash
# Deploy to AWS
./aws/deploy-aws.sh

# Get the Load Balancer DNS from CloudFormation outputs
# Access via: http://LOAD_BALANCER_DNS
```

### Sample Data Generation
```python
# Generate sample threats with embeddings
python scripts/generate_sample_threats.py

# Generate sample agent conversations
python scripts/generate_sample_conversations.py

# Generate sample tasks
python scripts/generate_sample_tasks.py
```

---

## Key Demo Points to Highlight

### CockroachDB Features
1. **Vector Indexing Performance:** Show fast semantic search (< 50ms)
2. **Distributed Resilience:** Mention automatic failover
3. **MCP Integration:** Show direct agent connectivity
4. **Scalability:** Mention horizontal scaling capabilities

### AWS Integration
1. **ECS Fargate:** Serverless container orchestration
2. **Auto-scaling:** Dynamic resource allocation
3. **EFS Storage:** Persistent CockroachDB data
4. **CloudWatch:** Comprehensive monitoring

### Agentic Memory
1. **Conversation History:** Context-aware decision making
2. **Semantic Search:** Vector similarity for pattern matching
3. **Task Management:** Multi-step workflow automation
4. **Context Storage:** Long-term agent state management

---

## Video Upload Instructions

### YouTube
1. Create YouTube account (if needed)
2. Click "Create" → "Upload video"
3. Select video file (max 128GB)
4. Add title: "CyberAI-Expert v8.0 - Agentic Memory SOC Platform"
5. Add description (use README-DEVPOST.md content)
6. Add tags: #CockroachDB #AWS #AgenticMemory #Cybersecurity #AI
7. Set visibility: "Public"
8. Click "Publish"
9. Copy video URL for Devpost submission

### Vimeo
1. Create Vimeo account (if needed)
2. Click "New Video" → "Upload"
3. Select video file (max 5GB for free, 25GB for paid)
4. Add title and description
5. Set privacy: "Anyone"
6. Click "Publish"
7. Copy video URL for Devpost submission

---

## Troubleshooting

### Audio Issues
- **Problem:** Audio is too quiet or distorted
- **Solution:** Use audio normalization in editing software, record in quieter environment

### Screen Recording Issues
- **Problem:** Recording is laggy or choppy
- **Solution:** Lower recording resolution to 720p, close unnecessary applications

### Demo Environment Issues
- **Problem:** Services not starting
- **Solution:** Check Docker logs, ensure sufficient system resources

### Video Export Issues
- **Problem:** Export takes too long
- **Solution:** Use lower bitrate, reduce resolution, use hardware acceleration

---

## Alternative Demo Approaches

### Screen Recording Only
- Record screen with voiceover
- No face camera required
- Focus on technical demonstration

### Face Camera + Screen
- Picture-in-picture style
- Personal introduction
- More engaging presentation

### Animation Only
- Use screen recording of animations
- No live demo required
- Focus on architecture and features

---

## Tips for a Successful Demo

1. **Keep it Simple:** Focus on key features, don't try to show everything
2. **Practice First:** Rehearse the script 2-3 times before recording
3. **Clear Audio:** Good audio quality is more important than video quality
4. **Smooth Transitions:** Plan transitions between scenes in advance
5. **Highlight Benefits:** Emphasize why CockroachDB and AWS are essential
6. **Show Real Data:** Use actual sample data, not placeholders
7. **Time Management:** Keep each scene within the allocated time
8. **Technical Accuracy:** Ensure all technical claims are accurate

---

## Final Checklist Before Submission

- [ ] Video is under 3 minutes
- [ ] Video is public on YouTube or Vimeo
- [ ] Audio is clear and understandable
- [ ] All required features are demonstrated
- [ ] CockroachDB tools are clearly identified
- [ ] AWS services are clearly identified
- [ ] Video URL is copied for Devpost submission
- [ ] Video description includes project details
- [ ] Video tags are appropriate for discoverability

---

## Example Video Description

```
CyberAI-Expert v8.0 - Agentic Memory SOC Platform
CockroachDB × AWS Hackathon Submission

This demo showcases an AI-powered Security Operations Center with production-grade persistent memory powered by CockroachDB. The platform features:

CockroachDB Tools Used:
• Distributed Vector Indexing for semantic threat search
• Cloud Managed MCP Server for direct agent connectivity
• Agent Skills Repo for automated database operations

AWS Services Used:
• Amazon ECS for serverless container orchestration
• Amazon EFS for persistent storage
• Amazon CloudWatch for monitoring
• AWS IAM for security

Key Features:
• Real-time threat detection with AI agents
• Agentic memory with conversation history and context storage
• Semantic search using vector similarity
• Multi-step automated incident response
• Distributed resilience with automatic failover

Repository: https://github.com/yourusername/CyberAI-Expert-v8
License: MIT

#CockroachDB #AWS #AgenticMemory #Cybersecurity #AI #Hackathon
```

---

This guide provides everything needed to create a compelling demo video that meets the hackathon requirements and effectively showcases the CyberAI-Expert v8.0 platform's capabilities.
