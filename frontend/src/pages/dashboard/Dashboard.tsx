import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Activity, Server, GitCommit, HardDrive } from 'lucide-react';

export default function Dashboard() {
    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                        <Server className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground">+2 from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Services</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">24</div>
                        <p className="text-xs text-muted-foreground">+19% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Deployments Today</CardTitle>
                        <GitCommit className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">7</div>
                        <p className="text-xs text-muted-foreground">+4 since last hour</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Resource Usage</CardTitle>
                        <HardDrive className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">42%</div>
                        <p className="text-xs text-muted-foreground">System healthy</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Deployments</CardTitle>
                        <CardDescription>
                            A list of recent deployments across all projects.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Project</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Commit</TableHead>
                                    <TableHead className="text-right">Time</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-medium">api-service</TableCell>
                                    <TableCell>
                                        <Badge variant="default" className="bg-green-500 hover:bg-green-600">Success</Badge>
                                    </TableCell>
                                    <TableCell>abc1234</TableCell>
                                    <TableCell className="text-right">2m ago</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">web-client</TableCell>
                                    <TableCell>
                                        <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">Building</Badge>
                                    </TableCell>
                                    <TableCell>def5678</TableCell>
                                    <TableCell className="text-right">5m ago</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">auth-worker</TableCell>
                                    <TableCell>
                                        <Badge variant="destructive">Failed</Badge>
                                    </TableCell>
                                    <TableCell>901ghi2</TableCell>
                                    <TableCell className="text-right">1h ago</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                {/* Alerts panel could go here in the other 3 cols */}
            </div>
        </div>
    );
}
