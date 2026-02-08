import Deployment from '../models/deployment.model.js';
import Service from '../models/service.model.js';

export interface IServiceManager {
    deployService(serviceId: string): Promise<boolean>;
}

class ServiceManager implements IServiceManager {
    async deployService(serviceId: string): Promise<boolean> {
        console.log(`[ServiceManager] Deploying service: ${serviceId}`);

        const service = await Service.findById(serviceId);
        if (!service) {
            throw new Error('Service not found');
        }

        // Create deployment record
        const deployment = await Deployment.create({
            project: service.project,
            service: serviceId,
            status: 'pending',
            logs: [{ message: 'Deployment request received' }]
        });

        // Simulate async deployment process
        this.simulateBuild(deployment._id.toString(), serviceId);

        return true;
    }

    // Simulation of build/deploy steps
    private async simulateBuild(deploymentId: string, serviceId: string) {
        try {
            const deployment = await Deployment.findById(deploymentId);
            if (!deployment) return;

            // Building
            setTimeout(async () => {
                deployment.status = 'building';
                deployment.logs.push({ message: 'Starting build process...', timestamp: new Date() });
                deployment.logs.push({ message: 'Pulling latest code...', timestamp: new Date() });
                await deployment.save();
            }, 1000);

            // Deploying
            setTimeout(async () => {
                deployment.status = 'deploying';
                deployment.logs.push({ message: 'Build successful. Deploying to cluster...', timestamp: new Date() });
                await deployment.save();
            }, 3000);

            // Success
            setTimeout(async () => {
                deployment.status = 'success';
                deployment.logs.push({ message: 'Service is healthy and running.', timestamp: new Date() });
                await deployment.save();

                // Update service status
                await Service.findByIdAndUpdate(serviceId, { status: 'running' });
            }, 5000);

        } catch (error) {
            console.error('Deployment simulation failed', error);
        }
    }
}

export default new ServiceManager();
