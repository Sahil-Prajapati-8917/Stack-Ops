import EventEmitter from 'events';
import { spawn } from 'child_process';
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
        this.emitLog(deployment._id.toString(), 'Preparing deployment env...');

        // Start deployment process
        this.runDeploymentSequence(deployment._id.toString(), service);

        return true;
    }

    // Emit log event
    private emitLog(deploymentId: string, message: string) {
        this.emit(`log:${deploymentId}`, {
            timestamp: new Date(),
            message
        });
    }

    // Execute shell command and stream logs
    private async execCommand(
        command: string,
        args: string[],
        deploymentId: string,
        env: NodeJS.ProcessEnv = {}
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            const proc = spawn(command, args, { env: { ...process.env, ...env } });

            proc.stdout.on('data', (data) => {
                const lines = data.toString().split('\n');
                lines.forEach((line: string) => {
                    if (line.trim()) this.emitLog(deploymentId, line.trim());
                });
            });

            proc.stderr.on('data', (data) => {
                const lines = data.toString().split('\n');
                lines.forEach((line: string) => {
                    if (line.trim()) this.emitLog(deploymentId, `[ERR] ${line.trim()}`);
                });
            });

            proc.on('close', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`Command failed with code ${code}`));
                }
            });

            proc.on('error', (err) => {
                reject(err);
            });
        });
    }

    // Real Docker Deployment Step
    private async runDeploymentSequence(deploymentId: string, service: any) {
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

            // 1. BUILDING / PREPARING
            await updateStatus('BUILDING');
            await addLog('Starting deployment process...');

            // For this demo, we will use a standard image instead of building from source
            // In a real scenario, we would `git clone` and `docker build` here.
            const imageName = 'nginx:alpine';
            const containerName = `stackops-service-${service._id}`;

            await addLog(`Using image: ${imageName}`);

            // Pull image
            await addLog('Pulling latest image...');
            await this.execCommand('docker', ['pull', imageName], deploymentId);

            // 2. DEPLOYING
            await updateStatus('DEPLOYING');
            await addLog('Stopping previous container (if any)...');
            try {
                await this.execCommand('docker', ['rm', '-f', containerName], deploymentId);
            } catch (e) {
                // Ignore error if container doesn't exist
            }

            // Prepare Env Args
            const envArgs = service.env ? service.env.flatMap((e: any) => ['-e', `${e.key}=${e.value}`]) : [];

            // Run Container
            await addLog(`Starting container ${containerName}...`);
            // Running in detached mode (-d) but we won't capture runtime logs easily this way without `docker logs -f`
            // For deployment logs, we just care about startup success.
            const runArgs = [
                'run', '-d',
                '--name', containerName,
                '-p', '8080:80', // Hardcoded port mapping for demo
                ...envArgs,
                imageName
            ];

            await this.execCommand('docker', runArgs, deploymentId);

            // 3. RUNNING
            await updateStatus('RUNNING');
            await Service.findByIdAndUpdate(service._id, { status: 'running' });
            await addLog('Deployment completed successfully.');
            await addLog(`Service is running on port 8080`);

        } catch (error) {
            console.error('Deployment execution failed', error);
            await Deployment.findByIdAndUpdate(deploymentId, { status: 'FAILED' });
            this.emitLog(deploymentId, `Deployment Failed: ${(error as Error).message}`);
        }
    }
}

// Export a singleton instance
export default new ServiceManager();
