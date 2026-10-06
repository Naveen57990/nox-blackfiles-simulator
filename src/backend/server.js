// NAGAR-BOT: High-Performance Server with Decoupled Video Streaming & Throttled VLM
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

const frontendDir = path.join(__dirname, '../frontend');
app.use(express.static(frontendDir));
app.use('/api', router);

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

app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

const httpServer = http.createServer(app);

let httpsServer = null;
const keyPath = path.join(__dirname, '../../key.pem');
const certPath = path.join(__dirname, '../../cert.pem');

if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
  try {
    httpsServer = https.createServer({
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    }, app);
  } catch (e) {
    console.warn("[HTTPS] SSL init error:", e.message);
  }
}

// --- DECOUPLED HIGH-SPEED WEBSOCKET HUB ---
const dashboardClients = new Set();
let isAIBusy = false;
let lastAITimestamp = 0;

function handleWsConnection(ws) {
  dashboardClients.add(ws);

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());

      if (msg.type === "ROVER_FRAME") {
        // 1. INSTANT ZERO-LATENCY FRAME FORWARDING TO LAPTOP DASHBOARDS
        const framePayload = JSON.stringify({
          type: "LIVE_FRAME_BROADCAST",
          image_base64: msg.image_base64,
          timestamp: msg.timestamp
        });

        for (const client of dashboardClients) {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(framePayload);
          }
        }

        // 2. ASYNC BACKGROUND AI INFERENCE (Throttled to 1 call per 4 seconds)
        const now = Date.now();
        if (!isAIBusy && (now - lastAITimestamp > 4000)) {
          isAIBusy = true;
          lastAITimestamp = now;

          const wpId = store.state.rover_telemetry.current_waypoint_id || "WP-04";
          const wp = CANONICAL_WAYPOINTS.find(w => w.id === wpId) || CANONICAL_WAYPOINTS[0];

          // Run VLM in background without blocking the video pipeline
          analyzeFrameWithVLM(msg.image_base64, { waypoint_id: wp.id })
            .then(aiResult => {
              isAIBusy = false;

              // Send AI result to dashboard
              const aiPayload = JSON.stringify({
                type: "LIVE_AI_RESULT",
                ai_result: aiResult,
                waypoint: wp
              });
              for (const client of dashboardClients) {
                if (client.readyState === WebSocket.OPEN) client.send(aiPayload);
              }

              // Create issue ONLY if a confirmed, non-hallucinated hazard is detected
              if (aiResult.detected && ["POTHOLE", "GARBAGE_HEAP", "WATERLOGGING"].includes(aiResult.hazard_type)) {
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
            })
            .catch(err => {
              isAIBusy = false;
              console.warn("[VLM Background] Error:", err.message);
            });
        }
      }
    } catch (e) {
      console.warn("[WebSocket] Frame decode error:", e.message);
    }
  });

  ws.on('close', () => {
    dashboardClients.delete(ws);
  });
}

const wssHttp = new WebSocketServer({ server: httpServer, path: '/ws/camera' });
wssHttp.on('connection', handleWsConnection);

if (httpsServer) {
  const wssHttps = new WebSocketServer({ server: httpsServer, path: '/ws/camera' });
  wssHttps.on('connection', handleWsConnection);
}

httpServer.listen(PORT_HTTP, () => {
  console.log(`  Dashboard (Laptop): http://localhost:${PORT_HTTP}`);
  console.log(`  Phone (HTTP Snap):  http://10.50.195.37:${PORT_HTTP}/camera.html`);
});

if (httpsServer) {
  httpsServer.listen(PORT_HTTPS, () => {
    console.log(`  Phone (HTTPS Video): https://10.50.195.37:${PORT_HTTPS}/camera.html`);
  });
}
