import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
    ArrowLeft,
    Plus,
    Play,
    Square,
    Terminal,
    RefreshCw,
    Settings
} from 'lucide-react';
import axios from '@/lib/axios';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter
} from '@/components/ui/card';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Service {
    _id: string;
    name: string;
    type: string;
    status: string;
    replicas: number;
}

export default function ProjectDetail() {
    const { id } = useParams();
    const [openServiceModal, setOpenServiceModal] = useState(false);
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset } = useForm();

    // Fetch Project
    const { data: project, isLoading: loadingProject } = useQuery({
        queryKey: ['project', id],
        queryFn: async () => {
            const res = await axios.get(`/projects/${id}`);
            return res.data;
        },
        enabled: !!id,
    });

    // Fetch Services
    const { data: services, isLoading: loadingServices } = useQuery({
        queryKey: ['services', id],
        queryFn: async () => {
            const res = await axios.get(`/services/project/${id}`);
            return res.data as Service[];
        },
        enabled: !!id,
    });

    // Create Service Mutation
    const createServiceMutation = useMutation({
        mutationFn: async (data: any) => {
            return await axios.post('/services', { ...data, projectId: id });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services', id] });
            toast.success('Service created');
            setOpenServiceModal(false);
            reset();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create service');
        }
    });

    // Deploy Service Mutation
    const deployMutation = useMutation({
        mutationFn: async (serviceId: string) => {
            return await axios.post(`/services/${serviceId}/deploy`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services', id] });
            toast.success('Deployment triggered');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Deployment failed');
        }
    });

    const onSubmitService = (data: any) => {
        createServiceMutation.mutate(data);
    };

    if (loadingProject) return <div className="p-8">Loading project...</div>;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link to="/projects">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-2xl font-semibold flex-1">{project?.name}</h1>
                <Badge variant={project?.status === 'active' ? 'default' : 'secondary'}>
                    {project?.status}
                </Badge>
            </div>

            <Tabs defaultValue="services" className="w-full">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="services">Services</TabsTrigger>
                    <TabsTrigger value="deployments">Deployments</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Project Overview</CardTitle>
                            <CardDescription>Details about your project environment.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground">Repository</Label>
                                    <p className="font-medium">{project?.repoUrl}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Project ID</Label>
                                    <p className="font-mono text-sm">{project?._id}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="services" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Services</h3>
                        <Dialog open={openServiceModal} onOpenChange={setOpenServiceModal}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" /> Add Service
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Service</DialogTitle>
                                    <DialogDescription>
                                        Configure a new service (web, worker, or cron).
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleSubmit(onSubmitService)}>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Service Name</Label>
                                            <Input id="name" placeholder="web-1" {...register('name', { required: true })} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="type">Type</Label>
                                            <select
                                                id="type"
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                                {...register('type')}
                                            >
                                                <option value="web">Web Service</option>
                                                <option value="worker">Worker</option>
                                                <option value="cron">Cron Job</option>
                                            </select>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" disabled={createServiceMutation.isPending}>
                                            {createServiceMutation.isPending ? 'Creating...' : 'Create Service'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {loadingServices ? (
                            <p>Loading services...</p>
                        ) : services?.length === 0 ? (
                            <div className="col-span-full text-center p-8 border rounded-lg border-dashed text-muted-foreground">
                                No services running. Add one to get started.
                            </div>
                        ) : (
                            services?.map((service) => (
                                <Card key={service._id}>
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-base font-medium flex items-center gap-2">
                                                {service.type === 'web' ? <RefreshCw className="h-4 w-4" /> : <Terminal className="h-4 w-4" />}
                                                {service.name}
                                            </CardTitle>
                                            <Badge variant={service.status === 'running' ? 'default' : service.status === 'failed' ? 'destructive' : 'secondary'}>
                                                {service.status}
                                            </Badge>
                                        </div>
                                        <CardDescription className="text-xs">
                                            {service.type} • {service.replicas} replica(s)
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pb-2">
                                        {/* Monitoring metrics could go here */}
                                        <div className="text-xs text-muted-foreground">
                                            CPU: 0% / RAM: 0MB
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-end gap-2 pt-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => deployMutation.mutate(service._id)}
                                            disabled={deployMutation.isPending || service.status === 'deploying'}
                                        >
                                            <Play className="h-4 w-4 mr-1" /> Deploy
                                        </Button>
                                        <Button variant="ghost" size="sm">
                                            <Settings className="h-4 w-4" />
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="deployments">
                    <div className="text-muted-foreground text-center py-8">
                        Deployment history will appear here.
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
