import express from 'express';
import {
    createService,
    getServices,
    deployService
} from '../controllers/service.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/', createService);
router.get('/project/:projectId', getServices);
router.post('/:id/deploy', deployService);

export default router;
