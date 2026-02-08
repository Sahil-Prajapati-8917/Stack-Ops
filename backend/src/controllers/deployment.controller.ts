import { Request, Response } from 'express';
import Deployment from '../models/deployment.model.js';
import serviceManager from '../services/serviceManager.js';

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

export const streamDeploymentLogs = async (req: Request, res: Response) => {
    // SSE Setup
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const { id } = req.params;

    const listener = (data: any) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    // Subscribe to service manager events
    // Assuming serviceManager emits 'log:deploymentId'
    serviceManager.on(`log:${id}`, listener);

    // Send initial connection message
    res.write(`data: ${JSON.stringify({ message: 'Connected to log stream', timestamp: new Date() })}\n\n`);

    // Cleanup on close
    req.on('close', () => {
        serviceManager.off(`log:${id}`, listener);
        res.end();
    });
};
