#!/usr/bin/env node
/**
 * Deployment webhook for gin-rummy-tracker
 * Receives GitHub Actions deployment requests and pulls latest image from GHCR
 * Usage: node deploy-webhook.js [port]
 */

const http = require('http');
const { execSync } = require('child_process');
const crypto = require('crypto');

const PORT = process.env.DEPLOY_WEBHOOK_PORT || process.argv[2] || 8888;
const WEBHOOK_SECRET = process.env.DEPLOY_WEBHOOK_SECRET || 'change-me-in-production';
const APP_DIR = '/opt/infra-new/apps/gin-rummy-tracker';

/**
 * Verify webhook signature (HMAC-SHA256)
 */
function verifySignature(payload, signature) {
  const hash = crypto.createHmac('sha256', WEBHOOK_SECRET).update(payload).digest('hex');
  return hash === signature;
}

/**
 * Execute deployment
 */
function deploy(imageTag) {
  console.log(`🚀 Starting deployment of ${imageTag}...`);
  try {
    const commands = [
      `cd ${APP_DIR}`,
      `docker login ghcr.io -u \$GHCR_USER --password-stdin <<< \$GHCR_TOKEN`,
      `docker pull ghcr.io/shepswork/gin-rummy-tracker:${imageTag}`,
      `docker tag ghcr.io/shepswork/gin-rummy-tracker:${imageTag} gin-rummy-tracker:latest`,
      `docker compose -f docker-compose.prod.yml up -d --remove-orphans`,
      `sleep 2`,
      `curl -fsS http://127.0.0.1:3000/health`,
    ];

    const script = commands.join(' && ');
    execSync(script, {
      stdio: 'inherit',
      shell: '/bin/bash',
      env: { ...process.env },
    });

    console.log('✅ Deployment successful');
    return { success: true, message: 'Deployment completed' };
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    return { success: false, message: error.message };
  }
}

/**
 * HTTP server
 */
const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'ok', service: 'gin-rummy-deploy-webhook' }));
    return;
  }

  if (req.method === 'POST' && req.url === '/deploy') {
    let body = '';
    req.on('data', chunk => (body += chunk.toString()));
    req.on('end', () => {
      try {
        const signature = req.headers['x-deploy-signature'] || '';
        if (!verifySignature(body, signature)) {
          res.writeHead(401);
          res.end(JSON.stringify({ error: 'Invalid signature' }));
          return;
        }

        const payload = JSON.parse(body);
        const { imageTag } = payload;

        if (!imageTag) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Missing imageTag parameter' }));
          return;
        }

        const result = deploy(imageTag);
        res.writeHead(result.success ? 200 : 500);
        res.end(JSON.stringify(result));
      } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: error.message }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`✅ Deployment webhook listening on port ${PORT}`);
  console.log(`   POST /deploy - Trigger deployment`);
  console.log(`   GET /health - Health check`);
});
