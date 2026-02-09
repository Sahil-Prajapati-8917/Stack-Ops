import express from 'express';
import {
    createService,
    getServices,
    deployService,
    updateService,
    deleteService
} from '../controllers/service.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/', createService);
router.get('/project/:projectId', getServices);

router.post('/:id/deploy', deployService);
router.put('/:id', updateService);
router.delete('/:id', deleteService);

export default router;
