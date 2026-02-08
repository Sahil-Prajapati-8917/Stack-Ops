import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
    ArrowLeft,
    Plus,
    Play,
    Terminal,
    RefreshCw,
    CheckCircle,
    XCircle,
    Clock,
    Loader2
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
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface Service {
    _id: string;
    name: string;
    type: string;
    status: string;
    replicas: number;
}

interface Deployment {
    _id: string;
    status: string;
    createdAt: string;
    service: Service;
    events: { state: string, timestamp: string }[];
    logs: { message: string, timestamp: string }[];
}

export default function ProjectDetail() {
    const { id } = useParams();
    const [openServiceModal, setOpenServiceModal] = useState(false);
    const [activeDeploymentId, setActiveDeploymentId] = useState<string | null>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const logEndRef = useRef<HTMLDivElement>(null);

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
    const { data: services } = useQuery({
        queryKey: ['services', id],
        queryFn: async () => {
            const res = await axios.get(`/services/project/${id}`);
            return res.data as Service[];
        },
        enabled: !!id,
        refetchInterval: 3000
    });

    // Fetch Deployments
    const { data: deployments } = useQuery({
        queryKey: ['deployments', id],
        queryFn: async () => {
            const res = await axios.get(`/deployments/project/${id}`);
            // If there's a running deployment, set it as active if none selected
            const running = res.data.find((d: any) => ['PENDING', 'BUILDING', 'DEPLOYING'].includes(d.status));
            if (running && !activeDeploymentId) setActiveDeploymentId(running._id);
            return res.data as Deployment[];
        },
        enabled: !!id,
        refetchInterval: 3000
    });

    // Active Deployment Details (for timeline)
    const activeDeployment = deployments?.find(d => d._id === activeDeploymentId);

    // SSE Log Streaming
    useEffect(() => {
        if (!activeDeploymentId) return;

        setLogs([]);
        const eventSource = new EventSource(`http://localhost:5001/deployments/${activeDeploymentId}/logs/stream`); // Hardcoded URL for demo, should be env var

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.message) {
                setLogs(prev => [...prev, `[${new Date(data.timestamp).toLocaleTimeString()}] ${data.message}`]);
            }
        };

        eventSource.onerror = (err) => {
            console.error("EventSource failed:", err);
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, [activeDeploymentId]);

    // Auto-scroll logs
    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);


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
            const res = await axios.post(`/services/${serviceId}/deploy`);
            return res.data; // Should return deployment ID ideally? No, currently message.
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services', id] });
            queryClient.invalidateQueries({ queryKey: ['deployments', id] });
            toast.success('Deployment triggered');
            // Ideally we get the new deployment ID here to switch view
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Deployment failed');
        }
    });

    const onSubmitService = (data: any) => {
        createServiceMutation.mutate(data);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'SUCCESS':
            case 'RUNNING': return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'FAILED': return <XCircle className="h-4 w-4 text-red-500" />;
            case 'DEPLOYING': return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
            case 'BUILDING': return <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />;
            case 'PENDING': return <Clock className="h-4 w-4 text-muted-foreground" />;
            default: return <Clock className="h-4 w-4 text-muted-foreground" />;
        }
    };

    const DeploymentTimeline = ({ deployment }: { deployment: Deployment }) => {
        const steps = ['PENDING', 'BUILDING', 'DEPLOYING', 'RUNNING'];
        const currentStepIndex = steps.indexOf(deployment.status) === -1 ? (deployment.status === 'SUCCESS' ? 3 : steps.indexOf(deployment.status)) : steps.indexOf(deployment.status);

        const isFailed = deployment.status === 'FAILED';

        return (
            <div className="flex items-center justify-between w-full max-w-3xl mx-auto my-6 px-4">
                {steps.map((step, index) => {
                    const isCompleted = index < currentStepIndex || deployment.status === 'SUCCESS';
                    const isCurrent = index === currentStepIndex;
                    const isError = isFailed && isCurrent;

                    return (
                        <div key={step} className="flex flex-col items-center relative w-full">
                            {/* Line */}
                            {index !== 0 && (
                                <div className={cn(
                                    "absolute top-4 left-[-50%] w-full h-1",
                                    index <= currentStepIndex ? "bg-primary" : "bg-muted"
                                )} />
                            )}

                            <div className={cn(
                                "z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all",
                                isCompleted ? "bg-primary border-primary text-primary-foreground" :
                                    isCurrent ? (isFailed ? "bg-red-100 border-red-500 text-red-500" : "bg-background border-primary text-primary") :
                                        "bg-background border-muted text-muted-foreground"
                            )}>
                                {isCompleted ? <CheckCircle className="w-5 h-5" /> :
                                    isError ? <XCircle className="w-5 h-5" /> :
                                        isCurrent ? <Loader2 className="w-5 h-5 animate-spin" /> :
                                            <div className="w-3 h-3 rounded-full bg-muted-foreground" />}
                            </div>
                            <span className={cn(
                                "mt-2 text-xs font-medium uppercase",
                                isCompleted || isCurrent ? "text-foreground" : "text-muted-foreground",
                                isError && "text-red-500"
                            )}>{step}</span>
                        </div>
                    );
                })}
            </div>
        );
    };

    if (loadingProject) return <div className="p-8">Loading project...</div>;

    return (
        <div className="flex flex-col gap-6 h-[calc(100vh-100px)]">
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

            <Tabs defaultValue="services" className="w-full h-full flex flex-col">
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
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div><Label className="text-muted-foreground">Repository</Label><p className="font-medium">{project?.repoUrl}</p></div>
                                <div><Label className="text-muted-foreground">Project ID</Label><p className="font-mono text-sm">{project?._id}</p></div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="services" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Services</h3>
                        <Dialog open={openServiceModal} onOpenChange={setOpenServiceModal}>
                            <DialogTrigger asChild>
                                <Button><Plus className="mr-2 h-4 w-4" /> Add Service</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Service</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleSubmit(onSubmitService)}>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Service Name</Label>
                                            <Input id="name" placeholder="web-1" {...register('name', { required: true })} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="type">Type</Label>
                                            <select id="type" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('type')}>
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
                        {services?.map((service) => (
                            <Card key={service._id}>
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-base font-medium flex items-center gap-2">
                                            {service.type === 'web' ? <RefreshCw className="h-4 w-4" /> : <Terminal className="h-4 w-4" />}
                                            {service.name}
                                        </CardTitle>
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(service.status?.toUpperCase())}
                                            <span className="text-sm capitalize">{service.status}</span>
                                        </div>
                                    </div>
                                    <CardDescription className="text-xs">
                                        {service.type} • {service.replicas} replica(s)
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pb-2">
                                    <div className="text-xs text-muted-foreground">CPU: 0% / RAM: 0MB</div>
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
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="deployments" className="flex flex-col gap-4 h-full">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
                        {/* Deployment List */}
                        <div className="md:col-span-1 border rounded-lg overflow-hidden flex flex-col h-[500px]">
                            <div className="bg-muted px-4 py-2 border-b font-medium">History</div>
                            <div className="flex-1 overflow-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Time</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {deployments?.map((d) => (
                                            <TableRow
                                                key={d._id}
                                                className={cn("cursor-pointer hover:bg-muted/50", activeDeploymentId === d._id && "bg-muted")}
                                                onClick={() => setActiveDeploymentId(d._id)}
                                            >
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {getStatusIcon(d.status)}
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-xs">{(d.service as any).name}</span>
                                                            <span className="text-xs capitalize text-muted-foreground">{d.status}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right text-xs">
                                                    {new Date(d.createdAt).toLocaleTimeString()}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        {/* Details & Logs */}
                        <div className="md:col-span-2 flex flex-col gap-4">
                            {activeDeployment ? (
                                <>
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg flex justify-between items-center">
                                                <span>Deployment Details</span>
                                                <Badge>{activeDeployment.status}</Badge>
                                            </CardTitle>
                                            <CardDescription>ID: {activeDeployment._id}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="pb-4">
                                            <DeploymentTimeline deployment={activeDeployment} />
                                        </CardContent>
                                    </Card>

                                    <Card className="flex-1 flex flex-col min-h-[300px] bg-black text-green-500 font-mono text-sm border-none shadow-inner">
                                        <CardHeader className="py-2 border-b border-gray-800 bg-gray-900 rounded-t-lg">
                                            <div className="flex items-center gap-2">
                                                <Terminal className="h-4 w-4" />
                                                <span>Build Logs</span>
                                                {['PENDING', 'BUILDING', 'DEPLOYING'].includes(activeDeployment.status) && (
                                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse ml-auto" />
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="flex-1 p-4 overflow-auto bg-black rounded-b-lg">
                                            <div className="flex flex-col gap-1">
                                                {activeDeployment.logs?.length ? (
                                                    // Initial static logs could come from DB, but for SSE we stream. 
                                                    // For now, let's just show logs from state if we have them, else empty
                                                    null
                                                ) : null}
                                                {logs.map((log, i) => (
                                                    <div key={i} className="break-all border-l-2 border-transparent hover:border-green-800 px-2">{log}</div>
                                                ))}
                                                <div ref={logEndRef} />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </>
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground border rounded-lg border-dashed">
                                    Select a deployment to view details
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="settings">
                    <div className="text-center py-8 text-muted-foreground">
                        Project settings (Environment variables, etc.) coming soon.
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
