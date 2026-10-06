// NAGAR-BOT: Core Express, HTTPS & WebSocket Server
import express from 'express';
import cors from 'cors';
import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { fileURLToPath } from 'url';
import { router, broadcastEvent } from './routes.js';
import { store } from './store.js';
import { analyzeFrameWithVLM } from './vision_engine.js';
import { findDuplicateCandidates } from './deduplication_engine.js';
import { generateDraftWorkOrder } from './work_order_engine.js';
import { CANONICAL_WAYPOINTS, WARD_METADATA } from './canonical_topology.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT_HTTP = process.env.PORT || 3000;
const PORT_HTTPS = process.env.PORT_HTTPS || 3443;

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Static frontend files
const frontendDir = path.join(__dirname, '../frontend');
app.use(express.static(frontendDir));

// API Routes
app.use('/api', router);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: "HEALTHY",
    service: "NAGAR-BOT Municipal Core",
    version: "1.0.0",
    active_issues: store.state.issues.length,
    active_work_orders: store.state.work_orders.length,
    timestamp: new Date().toISOString()
  });
});

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

// 1. Create HTTP Server
const httpServer = http.createServer(app);

// 2. Create HTTPS Server (for secure mobile camera access)
let httpsServer = null;
const keyPath = path.join(__dirname, '../../key.pem');
const certPath = path.join(__dirname, '../../cert.pem');

if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
  try {
    const sslOptions = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    };
    httpsServer = https.createServer(sslOptions, app);
  } catch (e) {
    console.warn("[HTTPS] Could not initialize SSL server:", e.message);
  }
}

// 3. WebSocket Hub for both HTTP and HTTPS
const dashboardClients = new Set();
let isProcessingFrame = false;
let lastDetectionTime = 0;

function handleWsConnection(ws) {
  dashboardClients.add(ws);
  console.log(`[WebSocket] Client connected. Total active clients: ${dashboardClients.size}`);

  ws.on('message', async (data) => {
    try {
      const msg = JSON.parse(data.toString());

      if (msg.type === "ROVER_FRAME") {
        // Broadcast live frame to dashboard
        const payload = JSON.stringify({
          type: "LIVE_FRAME_BROADCAST",
          image_base64: msg.image_base64,
          timestamp: msg.timestamp
        });

        for (const client of dashboardClients) {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(payload);
          }
        }

        // Run AI detection (rate limited)
        const now = Date.now();
        if (!isProcessingFrame && (now - lastDetectionTime > 3000)) {
          isProcessingFrame = true;
          lastDetectionTime = now;

          const wpId = store.state.rover_telemetry.current_waypoint_id || "WP-04";
          const wp = CANONICAL_WAYPOINTS.find(w => w.id === wpId) || CANONICAL_WAYPOINTS[0];

          analyzeFrameWithVLM(msg.image_base64, { waypoint_id: wp.id }).then(aiResult => {
            isProcessingFrame = false;

            const aiPayload = JSON.stringify({
              type: "LIVE_AI_RESULT",
              ai_result: aiResult,
              waypoint: wp
            });
            for (const client of dashboardClients) {
              if (client.readyState === WebSocket.OPEN) client.send(aiPayload);
            }

            if (aiResult.detected && aiResult.hazard_type !== "CLEAN_ROAD") {
              const duplicates = findDuplicateCandidates({
                coords: wp.coords,
                hazard_type: aiResult.hazard_type
              }, store.state.issues);

              const createdIssue = store.addIssue({
                hazard_type: aiResult.hazard_type,
                severity: aiResult.severity,
                confidence_score: aiResult.confidence_score,
                visual_description: aiResult.visual_description,
                is_uncertain: aiResult.is_uncertain,
                waypoint_id: wp.id,
                waypoint_name: wp.name,
                coords: wp.coords,
                pos3d: wp.pos3d,
                primary_evidence_image: msg.image_base64,
                source_device: "PHONE_LIVE_STREAM",
                ai_model: aiResult.model_used,
                duplicate_candidates: duplicates,
                ward_id: WARD_METADATA.ward_id,
                demo_provenance: WARD_METADATA.demo_label
              });

              const draftWOData = generateDraftWorkOrder(createdIssue);
              const draftWorkOrder = store.addWorkOrder(draftWOData);
              store.updateIssue(createdIssue.id, {
                work_order_id: draftWorkOrder.id,
                status: "DRAFTED"
              }, "SYSTEM", "LIVE_STREAM_DETECTED", "Real-time phone stream defect logged.");

              broadcastEvent("ISSUE_CREATED", { issue: store.getIssue(createdIssue.id), work_order: draftWorkOrder });
            }
          }).catch(err => {
            isProcessingFrame = false;
            console.warn("[VLM Live Stream] Detection error:", err.message);
          });
        }
      }
    } catch (e) {
      console.warn("[WebSocket] Message parse error:", e.message);
    }
  });

  ws.on('close', () => {
    dashboardClients.delete(ws);
    console.log(`[WebSocket] Client disconnected. Active: ${dashboardClients.size}`);
  });
}

// Bind WS on HTTP
const wssHttp = new WebSocketServer({ server: httpServer, path: '/ws/camera' });
wssHttp.on('connection', handleWsConnection);

// Bind WS on HTTPS if enabled
if (httpsServer) {
  const wssHttps = new WebSocketServer({ server: httpsServer, path: '/ws/camera' });
  wssHttps.on('connection', handleWsConnection);
}

// Start HTTP
httpServer.listen(PORT_HTTP, () => {
  console.log(`\n=============================================================`);
  console.log(`  NAGAR-BOT Civic Intelligence & Accountability System`);
  console.log(`  Dashboard (Laptop): http://localhost:${PORT_HTTP}`);
  console.log(`  Phone (HTTP Snap):  http://10.50.195.37:${PORT_HTTP}/camera.html`);
});

// Start HTTPS
if (httpsServer) {
  httpsServer.listen(PORT_HTTPS, () => {
    console.log(`  Phone (HTTPS Video): https://10.50.195.37:${PORT_HTTPS}/camera.html`);
    console.log(`=============================================================\n`);
  });
}
