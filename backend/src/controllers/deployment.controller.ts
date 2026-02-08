import { Request, Response } from 'express';
import Deployment from '../models/deployment.model.js';

interface AuthRequest extends Request {
    user?: any;
}

export const getDeployments = async (req: AuthRequest, res: Response) => {
    try {
        const deployment = await Deployment.find({ service: req.params.serviceId })
            .sort({ createdAt: -1 })
            .limit(20)
            .populate('service', 'name');

        res.json(deployment);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const getProjectDeployments = async (req: AuthRequest, res: Response) => {
    try {
        const deployments = await Deployment.find({ project: req.params.projectId })
            .sort({ createdAt: -1 })
            .limit(20)
            .populate('service', 'name');

        res.json(deployments);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const getDeploymentById = async (req: AuthRequest, res: Response) => {
    try {
        const deployment = await Deployment.findById(req.params.id).populate('service', 'name');
        if (!deployment) {
            return res.status(404).json({ message: 'Deployment not found' });
        }
        res.json(deployment);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};
