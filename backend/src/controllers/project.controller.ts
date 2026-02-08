import { Request, Response } from 'express';
import Project from '../models/project.model.js';

interface AuthRequest extends Request {
    user?: any;
}

export const createProject = async (req: AuthRequest, res: Response) => {
    try {
        const project = await Project.create({
            ...req.body,
            owner: req.user._id
        });
        res.status(201).json(project);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};

export const getProjects = async (req: AuthRequest, res: Response) => {
    try {
        const projects = await Project.find({ owner: req.user._id });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const getProjectById = async (req: AuthRequest, res: Response) => {
    try {
        const project = await Project.findOne({
            _id: req.params.id,
            owner: req.user._id
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.json(project);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const updateProject = async (req: AuthRequest, res: Response) => {
    try {
        const project = await Project.findOneAndUpdate(
            { _id: req.params.id, owner: req.user._id },
            req.body,
            { new: true }
        );

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.json(project);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};

export const deleteProject = async (req: AuthRequest, res: Response) => {
    try {
        const project = await Project.findOneAndDelete({
            _id: req.params.id,
            owner: req.user._id
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.json({ message: 'Project removed' });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};
