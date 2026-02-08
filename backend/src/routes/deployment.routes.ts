import express from 'express';
import {
    getDeployments,
    getDeploymentById,
    getProjectDeployments,
    streamDeploymentLogs
} from '../controllers/deployment.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// SSE endpoint (No auth middleware for simplicity in demo, or move before protect)
// Ideally pass token in query param for EventSource
router.get('/:id/logs/stream', streamDeploymentLogs);

router.use(protect);

router.get('/project/:projectId', getProjectDeployments);
router.get('/service/:serviceId', getDeployments);
router.get('/:id', getDeploymentById);

export default router;
