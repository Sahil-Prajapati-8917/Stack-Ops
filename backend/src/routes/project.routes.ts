import express from 'express';
import {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject
} from '../controllers/project.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect); // All project routes are protected

router.route('/')
    .get(getProjects)
    .post(createProject);

router.route('/:id')
    .get(getProjectById)
    .put(updateProject)
    .delete(deleteProject);

export default router;
