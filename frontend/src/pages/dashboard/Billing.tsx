import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, CreditCard, Download } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export default function Billing() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Billing & Plans</h1>
                <p className="text-muted-foreground">Manage payment methods and billing invoices.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Current Plan</CardTitle>
                        <CardDescription>You are currently on the Pro Plan</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold">$29<span className="text-sm font-normal text-muted-foreground">/month</span></span>
                            <Badge>Active</Badge>
                        </div>
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> 5 Projects</div>
                            <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> 20 Services</div>
                            <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Unlimited Deployments</div>
                            <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Priority Support</div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full">Upgrade Plan</Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Payment Method</CardTitle>
                        <CardDescription>Manage your card details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-4 border p-4 rounded-lg">
                            <CreditCard className="h-6 w-6" />
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">Visa ending in 4242</p>
                                <p className="text-xs text-muted-foreground">Expiry 06/2028</p>
                            </div>
                            <Button variant="outline" size="sm">Update</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Invoice History</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[1, 2, 3].map((i) => (
                                <TableRow key={i}>
                                    <TableCell className="font-medium">INV-00{i}</TableCell>
                                    <TableCell><Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Paid</Badge></TableCell>
                                    <TableCell>$29.00</TableCell>
                                    <TableCell>Feb {i}, 2026</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
