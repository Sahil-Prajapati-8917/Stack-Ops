import EventEmitter from 'events';
import Deployment from '../models/deployment.model.js';
import Service from '../models/service.model.js';

export interface IServiceManager {
    deployService(serviceId: string): Promise<boolean>;
}

class ServiceManager extends EventEmitter implements IServiceManager {
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
            status: 'PENDING',
            logs: [{ message: 'Deployment initialized' }]
        });

        // Notify listeners
        this.emitLog(deployment._id.toString(), 'Deployment initialized...');
        this.emitLog(deployment._id.toString(), 'Waiting for build slot...');

        // Simulate async deployment process
        this.runDeploymentSequence(deployment._id.toString(), serviceId);

        return true;
    }

    // Emit log event
    private emitLog(deploymentId: string, message: string) {
        this.emit(`log:${deploymentId}`, {
            timestamp: new Date(),
            message
        });
    }

    // Simulation of build/deploy steps
    private async runDeploymentSequence(deploymentId: string, serviceId: string) {
        try {
            const updateStatus = async (status: string) => {
                await Deployment.findByIdAndUpdate(deploymentId, { status });
                this.emitLog(deploymentId, `Status changed to ${status}`);
            };

            const addLog = async (message: string) => {
                this.emitLog(deploymentId, message);
                await Deployment.findByIdAndUpdate(deploymentId, {
                    $push: { logs: { message, timestamp: new Date() } }
                });
            };

            // 1. BUILDING
            setTimeout(async () => {
                await updateStatus('BUILDING');
                await addLog('Starting build process...');
                await addLog('Cloning repository...');
                await addLog('Installing dependencies (npm install)...');
            }, 2000);

            // 2. DEPLOYING
            setTimeout(async () => {
                await addLog('Build successful. Creating Docker image...');
                await updateStatus('DEPLOYING');
                await addLog('Pushing image to registry...');
                await addLog('Provisioning container instance...');
            }, 6000);

            // 3. RUNNING
            setTimeout(async () => {
                await addLog('Health check passed. Service is responding.');
                await updateStatus('RUNNING');
                await Service.findByIdAndUpdate(serviceId, { status: 'running' });
                await addLog('Deployment completed successfully.');
            }, 10000);

        } catch (error) {
            console.error('Deployment simulation failed', error);
            await Deployment.findByIdAndUpdate(deploymentId, { status: 'FAILED' });
            this.emitLog(deploymentId, 'Deployment Failed: Internal Server Error');
        }
    }
}

// Export a singleton instance
export default new ServiceManager();
