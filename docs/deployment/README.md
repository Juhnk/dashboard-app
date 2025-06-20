# Deployment Guide

## Overview

Mustache Cashstage is designed for cloud-native deployment with enterprise-grade reliability, security, and scalability. This guide covers deployment strategies for staging and production environments.

## 🏗️ Infrastructure Architecture

### Production Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CDN / Load Balancer                    │
│                    (Cloudflare/AWS ALB)                    │
└─────────────────┬───────────────────────┬───────────────────┘
                  │                       │
        ┌─────────▼─────────┐   ┌─────────▼─────────┐
        │   Web Tier        │   │   API Tier        │
        │  (Next.js App)    │   │  (NestJS API)     │
        │  - Port 3000      │   │  - Port 3001      │
        │  - 2+ instances   │   │  - 2+ instances   │
        │  - Auto-scaling   │   │  - Auto-scaling   │
        └─────────┬─────────┘   └─────────┬─────────┘
                  │                       │
                  └───────────┬───────────┘
                              │
               ┌──────────────▼──────────────┐
               │        Data Tier            │
               │                             │
               │  ┌─────────────────────┐   │
               │  │   PostgreSQL        │   │
               │  │   - Primary/Replica │   │
               │  │   - Automated       │   │
               │  │     Backups         │   │
               │  └─────────────────────┘   │
               │                             │
               │  ┌─────────────────────┐   │
               │  │   Redis Cluster     │   │
               │  │   - High Availability│   │
               │  │   - Persistence     │   │
               │  └─────────────────────┘   │
               └─────────────────────────────┘
```

### Environments

| Environment | Purpose | URL Pattern | Infrastructure |
|-------------|---------|-------------|----------------|
| **Development** | Local development | `localhost:3000` | Docker Compose |
| **Staging** | Pre-production testing | `staging.mustache-cashstage.dev` | Kubernetes/Docker |
| **Production** | Live service | `app.mustache-cashstage.dev` | Kubernetes/Docker |

## 🚀 Deployment Methods

### Method 1: Docker Compose (Recommended for Staging)

#### **Prerequisites**
- Docker 24+ and Docker Compose v2
- 4GB+ RAM, 2+ CPU cores
- 20GB+ storage space
- SSL certificates (Let's Encrypt recommended)

#### **Quick Deployment**
```bash
# Clone repository
git clone https://github.com/your-org/mustache-cashstage.git
cd mustache-cashstage

# Configure environment
cp .env.example .env.production
# Edit .env.production with production values

# Deploy with Docker Compose
docker-compose -f docker-compose.production.yml up -d

# Verify deployment
docker-compose -f docker-compose.production.yml ps
curl -f http://localhost/health || echo "Deployment failed"
```

#### **Production Docker Compose Configuration**

**docker-compose.production.yml:**
```yaml
version: '3.8'

services:
  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
      target: production
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
      target: production
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/api/v1/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  worker:
    build:
      context: .
      dockerfile: apps/worker/Dockerfile
      target: production
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=mustache_prod
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./docker/postgres/init:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d mustache_prod"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./docker/nginx/ssl:/etc/nginx/ssl
    depends_on:
      - web
      - api
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

---

### Method 2: Kubernetes (Recommended for Production)

#### **Prerequisites**
- Kubernetes cluster (v1.24+)
- kubectl configured
- Helm 3.x installed
- Container registry access
- Persistent volume provisioner

#### **Helm Chart Deployment**

```bash
# Add Mustache Cashstage Helm repository
helm repo add mustache-cashstage https://charts.mustache-cashstage.dev
helm repo update

# Install with custom values
cat > values.production.yaml << EOF
global:
  environment: production
  domain: mustache-cashstage.dev
  
web:
  replicaCount: 2
  image:
    repository: mustache/web
    tag: "0.1.0"
  
api:
  replicaCount: 2
  image:
    repository: mustache/api
    tag: "0.1.0"

postgresql:
  enabled: true
  primary:
    persistence:
      size: 100Gi
  auth:
    username: mustache
    database: mustache_prod

redis:
  enabled: true
  architecture: standalone
  auth:
    enabled: true

ingress:
  enabled: true
  className: nginx
  hosts:
    - host: app.mustache-cashstage.dev
      paths:
        - path: /
          pathType: Prefix
          service: web
    - host: api.mustache-cashstage.dev
      paths:
        - path: /
          pathType: Prefix
          service: api
  tls:
    - secretName: mustache-tls
      hosts:
        - app.mustache-cashstage.dev
        - api.mustache-cashstage.dev
EOF

# Deploy to production namespace
kubectl create namespace mustache-production
helm install mustache-cashstage mustache-cashstage/mustache-cashstage \
  -f values.production.yaml \
  -n mustache-production

# Verify deployment
kubectl get pods -n mustache-production
kubectl get ingress -n mustache-production
```

#### **Manual Kubernetes Manifests**

**namespace.yaml:**
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: mustache-production
  labels:
    app: mustache-cashstage
    environment: production
```

**configmap.yaml:**
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: mustache-config
  namespace: mustache-production
data:
  NODE_ENV: "production"
  NEXTAUTH_URL: "https://app.mustache-cashstage.dev"
  API_BASE_URL: "https://api.mustache-cashstage.dev"
```

**secret.yaml:**
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: mustache-secrets
  namespace: mustache-production
type: Opaque
data:
  # Base64 encoded values
  NEXTAUTH_SECRET: <base64-encoded-secret>
  JWT_SECRET: <base64-encoded-secret>
  POSTGRES_PASSWORD: <base64-encoded-password>
  REDIS_PASSWORD: <base64-encoded-password>
  GOOGLE_CLIENT_SECRET: <base64-encoded-secret>
```

**web-deployment.yaml:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mustache-web
  namespace: mustache-production
spec:
  replicas: 2
  selector:
    matchLabels:
      app: mustache-web
  template:
    metadata:
      labels:
        app: mustache-web
    spec:
      containers:
      - name: web
        image: mustache/web:0.1.0
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          valueFrom:
            configMapKeyRef:
              name: mustache-config
              key: NODE_ENV
        - name: NEXTAUTH_SECRET
          valueFrom:
            secretKeyRef:
              name: mustache-secrets
              key: NEXTAUTH_SECRET
        - name: DATABASE_URL
          value: "postgresql://mustache:$(POSTGRES_PASSWORD)@postgres:5432/mustache_prod"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
```

---

### Method 3: Cloud Platform Deployment

#### **Vercel (Next.js App Only)**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project root
vercel --prod

# Configure environment variables in Vercel dashboard
# Required variables:
# - DATABASE_URL
# - REDIS_URL  
# - NEXTAUTH_SECRET
# - NEXTAUTH_URL
# - GOOGLE_CLIENT_ID
# - GOOGLE_CLIENT_SECRET
```

**vercel.json:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "apps/web/package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "apps/web/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "apps/web/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### **Railway (Full Stack)**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and initialize
railway login
railway init

# Deploy services
railway up --service web
railway up --service api
railway up --service worker

# Add databases
railway add postgresql
railway add redis
```

**railway.json:**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "numReplicas": 2,
    "sleepApplication": false,
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300
  }
}
```

#### **AWS (ECS + RDS)**

**infrastructure/aws/ecs-task-definition.json:**
```json
{
  "family": "mustache-cashstage",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "web",
      "image": "ACCOUNT.dkr.ecr.REGION.amazonaws.com/mustache-web:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:REGION:ACCOUNT:secret:mustache/database-url"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/mustache-cashstage",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:3000/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3
      }
    }
  ]
}
```

## 🔧 Environment Configuration

### Environment Variables

#### **Required Variables**

```bash
# Database Configuration
DATABASE_URL="postgresql://user:password@host:5432/database"
REDIS_URL="redis://user:password@host:6379"

# Authentication
NEXTAUTH_SECRET="your-secure-random-string-min-32-chars"
NEXTAUTH_URL="https://your-domain.com"
JWT_SECRET="your-jwt-secret-string"

# Google OAuth (for Sheets integration)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Application
NODE_ENV="production"
API_BASE_URL="https://api.your-domain.com"
```

#### **Optional Variables**

```bash
# Monitoring & Logging
SENTRY_DSN="https://your-sentry-dsn"
LOG_LEVEL="info"
ENABLE_METRICS="true"

# Performance
REDIS_CACHE_TTL="300"
DATABASE_POOL_SIZE="10"
API_RATE_LIMIT="100"

# Security
CORS_ORIGIN="https://your-domain.com"
HELMET_CSP="true"
SESSION_TIMEOUT="86400"

# External Services
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Analytics (Optional)
GOOGLE_ANALYTICS_ID="GA-XXXXXXXXX"
MIXPANEL_TOKEN="your-mixpanel-token"
```

### Configuration Management

#### **Development (.env.local)**
```bash
# Copy from example
cp .env.example .env.local

# Edit with development values
DATABASE_URL="postgresql://mustache:mustache_dev_password@localhost:5432/mustache_dev"
REDIS_URL="redis://localhost:6379"
NEXTAUTH_SECRET="development-secret-min-32-characters"
NEXTAUTH_URL="http://localhost:3000"
```

#### **Staging (.env.staging)**
```bash
# Use staging database and services
DATABASE_URL="postgresql://mustache:staging_password@staging-db:5432/mustache_staging"
REDIS_URL="redis://staging-redis:6379"
NEXTAUTH_SECRET="staging-secret-different-from-prod"
NEXTAUTH_URL="https://staging.mustache-cashstage.dev"
```

#### **Production (Secure Environment Management)**

**Option 1: Docker Secrets**
```yaml
# docker-compose.production.yml
services:
  web:
    secrets:
      - db_password
      - jwt_secret
    environment:
      - DATABASE_URL=postgresql://mustache:$(cat /run/secrets/db_password)@postgres:5432/mustache_prod

secrets:
  db_password:
    file: ./secrets/db_password.txt
  jwt_secret:
    file: ./secrets/jwt_secret.txt
```

**Option 2: Kubernetes Secrets**
```bash
# Create secrets from command line
kubectl create secret generic mustache-secrets \
  --from-literal=NEXTAUTH_SECRET="your-secret" \
  --from-literal=DATABASE_URL="postgresql://..." \
  -n mustache-production
```

**Option 3: AWS Secrets Manager**
```bash
# Store secrets in AWS
aws secretsmanager create-secret \
  --name "mustache-cashstage/production" \
  --description "Production secrets for Mustache Cashstage" \
  --secret-string '{
    "DATABASE_URL": "postgresql://...",
    "NEXTAUTH_SECRET": "...",
    "JWT_SECRET": "..."
  }'
```

## 📦 Build & Release Process

### Automated CI/CD Pipeline

#### **GitHub Actions Workflow**

**.github/workflows/deploy.yml:**
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
    tags: ['v*']

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: |
          npm run typecheck
          npm run lint
          npm run test
          npm run build

  build:
    needs: test
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    outputs:
      image-digest: ${{ steps.build.outputs.digest }}
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
      
      - name: Build and push Docker images
        id: build
        uses: docker/build-push-action@v5
        with:
          context: .
          platforms: linux/amd64,linux/arm64
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: staging
    
    steps:
      - name: Deploy to staging
        run: |
          echo "Deploying ${{ needs.build.outputs.image-digest }} to staging"
          # Add your staging deployment commands here

  deploy-production:
    needs: build
    runs-on: ubuntu-latest
    if: startsWith(github.ref, 'refs/tags/v')
    environment: production
    
    steps:
      - name: Deploy to production
        run: |
          echo "Deploying ${{ needs.build.outputs.image-digest }} to production"
          # Add your production deployment commands here
```

### Manual Release Process

#### **1. Prepare Release**
```bash
# Update version in package.json
npm version patch  # or minor, major

# Update CHANGELOG.md
# Document all changes since last release

# Commit and tag
git add .
git commit -m "chore: release v0.1.1"
git tag v0.1.1
git push origin main --tags
```

#### **2. Build Docker Images**
```bash
# Build all services
docker build -t mustache/web:0.1.1 -f apps/web/Dockerfile .
docker build -t mustache/api:0.1.1 -f apps/api/Dockerfile .
docker build -t mustache/worker:0.1.1 -f apps/worker/Dockerfile .

# Push to registry
docker push mustache/web:0.1.1
docker push mustache/api:0.1.1
docker push mustache/worker:0.1.1
```

#### **3. Deploy to Staging**
```bash
# Deploy to staging environment
docker-compose -f docker-compose.staging.yml pull
docker-compose -f docker-compose.staging.yml up -d

# Run health checks
curl -f https://staging.mustache-cashstage.dev/health
curl -f https://api-staging.mustache-cashstage.dev/api/v1/health

# Run smoke tests
npm run test:e2e:staging
```

#### **4. Deploy to Production**
```bash
# Deploy to production (with blue-green deployment)
helm upgrade mustache-cashstage mustache-cashstage/mustache-cashstage \
  --set web.image.tag=0.1.1 \
  --set api.image.tag=0.1.1 \
  --set worker.image.tag=0.1.1 \
  -n mustache-production

# Monitor deployment
kubectl rollout status deployment/mustache-web -n mustache-production
kubectl rollout status deployment/mustache-api -n mustache-production

# Verify health
curl -f https://app.mustache-cashstage.dev/health
curl -f https://api.mustache-cashstage.dev/api/v1/health
```

## 🔍 Monitoring & Health Checks

### Health Check Endpoints

| Service | Endpoint | Response |
|---------|----------|----------|
| **Web App** | `GET /health` | Basic health status |
| **API** | `GET /api/v1/health` | Basic health status |
| **API** | `GET /api/v1/health/detailed` | Comprehensive health check |

### Health Check Implementation

**Basic Health Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-21T10:30:00Z",
  "uptime": 3600.45,
  "version": "0.1.0"
}
```

**Detailed Health Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-21T10:30:00Z",
  "services": {
    "database": {
      "status": "healthy",
      "responseTime": 12,
      "connections": {"active": 3, "idle": 7}
    },
    "redis": {
      "status": "healthy", 
      "responseTime": 2,
      "memory": {"used": "15.2MB", "peak": "23.1MB"}
    },
    "queue": {
      "status": "healthy",
      "jobs": {"waiting": 0, "active": 2, "completed": 1543}
    }
  }
}
```

### Monitoring Setup

#### **Prometheus Metrics**
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'mustache-web'
    static_configs:
      - targets: ['web:3000']
    metrics_path: '/metrics'
    
  - job_name: 'mustache-api'
    static_configs:
      - targets: ['api:3001']
    metrics_path: '/api/v1/metrics'
```

#### **Grafana Dashboard**
```json
{
  "dashboard": {
    "title": "Mustache Cashstage - Production Metrics",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{service}} - {{method}} {{route}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph", 
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])",
            "legendFormat": "5xx errors"
          }
        ]
      }
    ]
  }
}
```

#### **Alerting Rules**
```yaml
# alerting-rules.yml
groups:
  - name: mustache-cashstage
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors per second"
      
      - alert: DatabaseDown
        expr: up{job="postgres"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Database is down"
          description: "PostgreSQL database is not responding"
      
      - alert: HighMemoryUsage
        expr: (container_memory_usage_bytes / container_spec_memory_limit_bytes) > 0.8
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Container memory usage is above 80%"
```

## 🔒 Security Configuration

### SSL/TLS Setup

#### **Let's Encrypt with Certbot**
```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificates
sudo certbot --nginx -d app.mustache-cashstage.dev -d api.mustache-cashstage.dev

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### **Nginx SSL Configuration**
```nginx
# /etc/nginx/sites-available/mustache-cashstage
server {
    listen 443 ssl http2;
    server_name app.mustache-cashstage.dev;
    
    ssl_certificate /etc/letsencrypt/live/app.mustache-cashstage.dev/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.mustache-cashstage.dev/privkey.pem;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options DENY always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Proxy to Next.js app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name app.mustache-cashstage.dev;
    return 301 https://$server_name$request_uri;
}
```

### Firewall Configuration

#### **UFW (Ubuntu Firewall)**
```bash
# Reset and configure firewall
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (change port if needed)
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow database access from application servers only
sudo ufw allow from 10.0.0.0/8 to any port 5432
sudo ufw allow from 10.0.0.0/8 to any port 6379

# Enable firewall
sudo ufw --force enable
sudo ufw status verbose
```

### Database Security

#### **PostgreSQL Security Configuration**
```sql
-- Create application user with limited privileges
CREATE USER mustache_app WITH ENCRYPTED PASSWORD 'secure-random-password';

-- Create database
CREATE DATABASE mustache_prod OWNER mustache_app;

-- Grant minimal required privileges
GRANT CONNECT ON DATABASE mustache_prod TO mustache_app;
GRANT USAGE ON SCHEMA public TO mustache_app;
GRANT CREATE ON SCHEMA public TO mustache_app;

-- Revoke unnecessary privileges
REVOKE ALL ON DATABASE postgres FROM mustache_app;
REVOKE ALL ON SCHEMA information_schema FROM mustache_app;
```

**postgresql.conf:**
```bash
# Connection settings
listen_addresses = 'localhost,10.0.0.1'  # Internal network only
port = 5432
max_connections = 100

# Security settings
ssl = on
ssl_cert_file = '/etc/ssl/certs/server.crt'
ssl_key_file = '/etc/ssl/private/server.key'
password_encryption = scram-sha-256

# Logging
log_connections = on
log_disconnections = on
log_statement = 'mod'
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
```

## 🔄 Backup & Recovery

### Database Backup Strategy

#### **Automated Backups**
```bash
#!/bin/bash
# backup-database.sh

# Configuration
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="mustache_prod"
DB_USER="mustache_app"
BACKUP_DIR="/backups/postgresql"
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Generate backup filename with timestamp
BACKUP_FILE="$BACKUP_DIR/mustache_prod_$(date +%Y%m%d_%H%M%S).sql.gz"

# Create compressed backup
PGPASSWORD=$DB_PASSWORD pg_dump \
  -h $DB_HOST \
  -p $DB_PORT \
  -U $DB_USER \
  -d $DB_NAME \
  --no-owner \
  --no-privileges \
  | gzip > $BACKUP_FILE

# Verify backup was created
if [ -f "$BACKUP_FILE" ]; then
    echo "Backup created successfully: $BACKUP_FILE"
    
    # Upload to cloud storage (optional)
    aws s3 cp $BACKUP_FILE s3://mustache-backups/database/
    
    # Remove old backups
    find $BACKUP_DIR -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete
    
    echo "Backup completed successfully"
else
    echo "ERROR: Backup failed"
    exit 1
fi
```

#### **Cron Schedule**
```bash
# Run daily at 2 AM
0 2 * * * /path/to/backup-database.sh >> /var/log/backup.log 2>&1

# Run hourly incremental backups during business hours
0 9-17 * * 1-5 /path/to/incremental-backup.sh >> /var/log/backup.log 2>&1
```

### Application Data Backup

#### **File System Backups**
```bash
#!/bin/bash
# backup-files.sh

# Backup uploaded files, logs, and configuration
tar -czf /backups/files/mustache_files_$(date +%Y%m%d).tar.gz \
    /app/uploads/ \
    /app/logs/ \
    /app/.env.production \
    /etc/nginx/sites-available/mustache-cashstage

# Upload to cloud storage
aws s3 cp /backups/files/mustache_files_$(date +%Y%m%d).tar.gz \
    s3://mustache-backups/files/

# Cleanup old backups
find /backups/files/ -name "*.tar.gz" -mtime +7 -delete
```

### Disaster Recovery Plan

#### **Recovery Time Objectives (RTO)**
- **Database Recovery**: 15 minutes
- **Application Recovery**: 30 minutes
- **Full System Recovery**: 1 hour

#### **Recovery Point Objectives (RPO)**
- **Database**: 1 hour (hourly backups during business hours)
- **Files**: 24 hours (daily backups)
- **Configuration**: 24 hours (daily backups)

#### **Recovery Procedures**

**1. Database Recovery:**
```bash
# Stop applications
docker-compose down

# Restore database from backup
PGPASSWORD=$DB_PASSWORD psql -h localhost -U mustache_app -d mustache_prod < backup_file.sql

# Restart applications
docker-compose up -d

# Verify recovery
curl -f https://app.mustache-cashstage.dev/health
```

**2. Full System Recovery:**
```bash
# 1. Provision new infrastructure
# 2. Restore configuration files
tar -xzf mustache_files_backup.tar.gz -C /

# 3. Restore database
# (see database recovery above)

# 4. Deploy application
docker-compose -f docker-compose.production.yml up -d

# 5. Verify all services
./scripts/health-check-all.sh
```

## 📊 Performance Optimization

### Application Performance

#### **Next.js Optimizations**
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable compression
  compress: true,
  
  // Optimize images
  images: {
    domains: ['docs.google.com', 'drive.google.com'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Enable experimental features
  experimental: {
    // Server Components optimizations
    serverComponentsExternalPackages: ['@prisma/client'],
    
    // Bundle analyzer
    bundlePagesRouterDependencies: true,
  },
  
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Production client-side optimizations
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      };
    }
    return config;
  },
  
  // Headers for caching
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

#### **Database Performance**
```sql
-- Create performance indexes
CREATE INDEX CONCURRENTLY idx_dashboards_org_created 
ON dashboards(organization_id, created_at DESC);

CREATE INDEX CONCURRENTLY idx_widgets_dashboard_tab 
ON widgets(dashboard_tab_id);

CREATE INDEX CONCURRENTLY idx_data_snapshots_source_date 
ON data_snapshots(data_source_id, snapshot_date DESC);

-- Analyze query performance
ANALYZE;

-- Update table statistics
UPDATE pg_class SET reltuples = (
  SELECT count(*) FROM dashboards
) WHERE relname = 'dashboards';
```

### Infrastructure Performance

#### **Load Balancer Configuration**
```nginx
# nginx.conf for load balancing
upstream mustache_web {
    least_conn;
    server web1:3000 max_fails=3 fail_timeout=30s;
    server web2:3000 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

upstream mustache_api {
    least_conn;
    server api1:3001 max_fails=3 fail_timeout=30s;
    server api2:3001 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

server {
    location / {
        proxy_pass http://mustache_web;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        
        # Performance headers
        proxy_cache_valid 200 5m;
        proxy_cache_valid 404 1m;
        add_header X-Cache-Status $upstream_cache_status;
    }
}
```

#### **Redis Performance Tuning**
```conf
# redis.conf optimizations
maxmemory 2gb
maxmemory-policy allkeys-lru

# Persistence configuration
save 900 1
save 300 10
save 60 10000

# Network optimizations
tcp-keepalive 300
timeout 0

# Performance tuning
hash-max-ziplist-entries 512
hash-max-ziplist-value 64
list-max-ziplist-size -2
```

## 🚨 Troubleshooting

### Common Deployment Issues

#### **1. Health Check Failures**
```bash
# Check container logs
docker logs mustache-web
docker logs mustache-api

# Check service status
docker-compose ps

# Manual health check
curl -v http://localhost:3000/health
curl -v http://localhost:3001/api/v1/health

# Check environment variables
docker exec mustache-web env | grep -E "(DATABASE|REDIS|NEXTAUTH)"
```

#### **2. Database Connection Issues**
```bash
# Test database connectivity
docker exec mustache-postgres pg_isready -U mustache -d mustache_prod

# Check database logs
docker logs mustache-postgres

# Test connection from application container
docker exec mustache-web psql $DATABASE_URL -c "SELECT version();"

# Verify connection string format
echo $DATABASE_URL
# Should be: postgresql://user:password@host:port/database
```

#### **3. Authentication Problems**
```bash
# Check OAuth configuration
echo $GOOGLE_CLIENT_ID
echo $NEXTAUTH_URL

# Verify redirect URIs in Google Console
# Should include: https://your-domain.com/api/auth/callback/google

# Test JWT secret is set
echo $JWT_SECRET | wc -c
# Should be >= 32 characters

# Check NextAuth logs
docker exec mustache-web cat /app/.next/trace
```

#### **4. Performance Issues**
```bash
# Check resource usage
docker stats

# Monitor database performance
docker exec mustache-postgres psql -U mustache -d mustache_prod -c "
SELECT query, calls, total_time, mean_time 
FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;"

# Check Redis memory usage
docker exec mustache-redis redis-cli info memory

# Monitor application metrics
curl http://localhost:3001/api/v1/health/detailed
```

### Recovery Procedures

#### **Rolling Back Deployment**
```bash
# Kubernetes rollback
kubectl rollout undo deployment/mustache-web -n mustache-production
kubectl rollout undo deployment/mustache-api -n mustache-production

# Docker Compose rollback
docker-compose -f docker-compose.production.yml down
git checkout previous-version-tag
docker-compose -f docker-compose.production.yml up -d

# Verify rollback
curl -f https://app.mustache-cashstage.dev/health
```

#### **Emergency Procedures**
```bash
# 1. Immediate service stop
docker-compose down
# or
kubectl scale deployment/mustache-web --replicas=0 -n mustache-production

# 2. Enable maintenance mode
# Create maintenance.html page and configure nginx to serve it

# 3. Investigate issue
docker logs --tail=100 mustache-web
kubectl logs deployment/mustache-web -n mustache-production

# 4. Apply hotfix and redeploy
# Follow normal deployment process with hotfix

# 5. Disable maintenance mode and verify
curl -f https://app.mustache-cashstage.dev/health
```

---

## 📚 Additional Resources

### Documentation
- **[API Documentation](../api/README.md)**: Complete API reference
- **[Security Guide](../../SECURITY.md)**: Security best practices and reporting
- **[Contributing Guide](../../CONTRIBUTING.md)**: Development and contribution guidelines

### Tools & Utilities
- **[Health Check Script](../../scripts/health-check.js)**: Comprehensive system diagnostics
- **[Deployment Scripts](../../scripts/deploy/)**: Automated deployment utilities
- **[Monitoring Setup](../../docker/monitoring/)**: Prometheus and Grafana configuration

### External Resources
- **[Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)**
- **[Kubernetes Deployment Guide](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)**
- **[Next.js Deployment Documentation](https://nextjs.org/docs/deployment)**
- **[PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)**

### Support
- **Production Issues**: [Create urgent issue](https://github.com/your-org/mustache-cashstage/issues/new?template=production-issue.md)
- **Deployment Questions**: [Start discussion](https://github.com/your-org/mustache-cashstage/discussions)
- **Security Concerns**: [Report privately](../../SECURITY.md)

---

**Deployment Guide Version**: 1.0  
**Last Updated**: 2024-01-21  
**Maintained By**: DevOps Team

This guide covers enterprise-grade deployment strategies for Mustache Cashstage. For development environment setup, see [DEVELOPMENT_GUIDE.md](../../DEVELOPMENT_GUIDE.md).