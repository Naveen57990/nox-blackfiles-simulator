// NAGAR-BOT: Core Express Server
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { router } from './routes.js';
import { store } from './store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

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

app.listen(PORT, () => {
  console.log(`\n=============================================================`);
  console.log(`  NAGAR-BOT Civic Intelligence & Accountability System`);
  console.log(`  MY Bharat Hack for Social Cause (VBYLD 2027)`);
  console.log(`  Running live at: http://localhost:${PORT}`);
  console.log(`=============================================================\n`);
});
