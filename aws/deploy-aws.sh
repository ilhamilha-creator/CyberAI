#!/bin/bash
# ============================================================
# CyberAI-Expert v8.0 — AWS Deployment Script
# CockroachDB × AWS Hackathon Submission
# ============================================================

set -e

# Configuration
AWS_REGION="${AWS_REGION:-us-east-1}"
STACK_NAME="cyberai-expert-v8"
ECR_REPOSITORY="cyberai-expert"
CLUSTER_NAME="cyberai-expert-cluster"

echo "🚀 Deploying CyberAI-Expert v8.0 to AWS ECS..."
echo "Region: $AWS_REGION"
echo "Stack: $STACK_NAME"
echo ""

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install it first."
    exit 1
fi

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install it first."
    exit 1
fi

# Login to ECR
echo "📦 Logging into Amazon ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $(aws sts get-caller-identity --query Account --output text).dkr.ecr.$AWS_REGION.amazonaws.com

# Create ECR repository if it doesn't exist
echo "🔧 Creating ECR repositories..."
aws ecr describe-repositories --repository-names cyberai-backend --region $AWS_REGION || \
    aws ecr create-repository --repository-name cyberai-backend --region $AWS_REGION

aws ecr describe-repositories --repository-names cyberai-frontend --region $AWS_REGION || \
    aws ecr create-repository --repository-name cyberai-frontend --region $AWS_REGION

# Build and push backend image
echo "🔨 Building backend Docker image..."
docker build -t cyberai-backend ./backend
docker tag cyberai-backend:latest $(aws sts get-caller-identity --query Account --output text).dkr.ecr.$AWS_REGION.amazonaws.com/cyberai-backend:latest
echo "⬆️  Pushing backend image to ECR..."
docker push $(aws sts get-caller-identity --query Account --output text).dkr.ecr.$AWS_REGION.amazonaws.com/cyberai-backend:latest

# Build and push frontend image
echo "🔨 Building frontend Docker image..."
docker build -t cyberai-frontend ./frontend
docker tag cyberai-frontend:latest $(aws sts get-caller-identity --query Account --output text).dkr.ecr.$AWS_REGION.amazonaws.com/cyberai-frontend:latest
echo "⬆️  Pushing frontend image to ECR..."
docker push $(aws sts get-caller-identity --query Account --output text).dkr.ecr.$AWS_REGION.amazonaws.com/cyberai-frontend:latest

# Deploy CloudFormation stack
echo "🏗️  Deploying CloudFormation stack..."
aws cloudformation deploy \
    --template-file aws/cloudformation-template.yaml \
    --stack-name $STACK_NAME \
    --capabilities CAPABILITY_IAM \
    --region $AWS_REGION \
    --parameter-overrides \
        VpcCidr=10.0.0.0/16 \
        SubnetCidr=10.0.1.0/24 \
        AvailabilityZone=${AWS_REGION}a

# Wait for stack creation
echo "⏳ Waiting for stack creation..."
aws cloudformation wait stack-create-complete --stack-name $STACK_NAME --region $AWS_REGION

# Get outputs
echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "📋 Stack Outputs:"
aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $AWS_REGION \
    --query 'Stacks[0].Outputs' \
    --output table

echo ""
echo "🎉 CyberAI-Expert v8.0 is now running on AWS!"
echo "Access the SOC Platform using the LoadBalancerDNS output above."
