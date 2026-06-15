# Gin Rummy Tracker - Deployment Setup

## Architecture

- **Frontend**: GitHub Pages (PWA)
- **Backend**: Node.js/Express on Oracle VM
- **Container Registry**: GitHub Container Registry (GHCR)
- **Deployment**: Docker Compose on Oracle VM
- **Reverse Proxy**: Traefik v3.3
- **DNS & SSL**: Cloudflare (gin-rummy.yancmo.xyz)
- **Public Access**: Via Cloudflare Tunnel + Traefik

## Public Endpoints

### API
- **URL**: `https://gin-rummy.yancmo.xyz/api`
- **Endpoints**:
  - `GET /api/data` - Fetch user's game data
  - `POST /api/data` - Save game data
  - `GET /health` - Health check

### Frontend
- **URL**: `https://shepswork.github.io/Gin-rummy-tracker/`
- Syncs data to backend via API

## Deployment Process

### Initial Setup (One-Time)
1. Build Docker image on Oracle VM (arm64 native):
   ```bash
   cd /opt/infra-new/apps/gin-rummy-tracker
   docker build -t gin-rummy-tracker:arm64 .
   ```

2. Update `docker-compose.prod.yml` with Traefik labels

3. Start container:
   ```bash
   docker compose -f docker-compose.prod.yml up -d
   ```

### CI/CD Deployment (GitHub Actions)
1. Push code to `main` branch triggers workflow
2. GitHub Actions builds multi-platform image (amd64, arm64)
3. Image pushed to GHCR as `ghcr.io/shepswork/gin-rummy-tracker:latest`
4. Manual SSH required to pull and restart on VM (until webhook is implemented)

### Future: Webhook-Based Auto-Deployment
A deployment webhook endpoint (`deploy-webhook.js`) has been created but requires:
- Node.js service running on VM with Docker socket access
- Exposed through Traefik on separate route
- GitHub Actions POST to webhook via public endpoint

## Data Persistence

User game data stored at:
```
/opt/infra-new/apps/gin-rummy-tracker/data/gin-rummy-personal.json
```

Mounted in container at `/app/data`

## Frontend Configuration

Frontend sync endpoint can be configured in Browser DevTools:
- Open Settings → Debug → Set Sync Server URL
- Default: `https://gin-rummy.yancmo.xyz/api`
- Data syncs on save and on login

## Health Monitoring

```bash
# Check container status
docker ps | grep gin

# View logs
docker logs gin-rummy-server

# Test health endpoint
curl https://gin-rummy.yancmo.xyz/health
```

## Traefik Labels

Container configured with labels for automatic routing:
- **Enabled**: `traefik.enable=true`
- **Rule**: `Host(gin-rummy.yancmo.xyz)`
- **Entrypoint**: `websecure` (HTTPS)
- **TLS**: Enabled with Cloudflare resolver
- **Backend Port**: 3000

## Environment Variables

Running on Oracle VM at `/opt/infra-new/apps/gin-rummy-tracker/`:
- `PORT=3000` - Express server port
- `NODE_ENV=production` - Production mode
