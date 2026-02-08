import express from 'express';
import {
    getDeployments,
    getDeploymentById,
    getProjectDeployments
} from '../controllers/deployment.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/project/:projectId', getProjectDeployments);
router.get('/service/:serviceId', getDeployments);
router.get('/:id', getDeploymentById);

export default router;
