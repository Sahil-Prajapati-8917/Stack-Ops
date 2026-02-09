import { Request, Response } from 'express';
import Service from '../models/service.model.js';
import Project from '../models/project.model.js';
import serviceManager from '../services/serviceManager.js';

interface AuthRequest extends Request {
    user?: any;
}

export const createService = async (req: AuthRequest, res: Response) => {
    try {
        const project = await Project.findOne({ _id: req.body.projectId, owner: req.user._id });
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const service = await Service.create({
            project: project._id,
            ...req.body
        });

        res.status(201).json(service);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};

export const getServices = async (req: AuthRequest, res: Response) => {
    try {
        const services = await Service.find({ project: req.params.projectId });
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const deployService = async (req: AuthRequest, res: Response) => {
    try {
        const service = await Service.findOne({ _id: req.params.id });
        // Verify ownership via project lookup if strict
        // For now assuming ID is enough or add check

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        service.status = 'deploying';
        await service.save();

        await serviceManager.deployService(service._id.toString());

        res.json({ message: 'Deployment started' });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const updateService = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const service = await Service.findOneAndUpdate(
            { _id: id },
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        res.json(service);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const deleteService = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const service = await Service.findOneAndDelete({ _id: id });

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        res.json({ message: 'Service deleted' });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};
