import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileBarChart,
  Search,
  Filter,
  Download,
  Calendar,
  DollarSign,
  Activity,
  Bell,
  Eye,
  TrendingUp,
  Users,
  CreditCard,
} from "lucide-react";

const Reports = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const transactionHistory = [
    {
      id: "TXN-123456",
      type: "Deposit",
      user: "John Doe",
      amount: "₹1,250.00",
      status: "Completed",
      date: "2024-01-15 14:30",
      method: "Credit Card",
    },
    {
      id: "TXN-123455",
      type: "Withdrawal",
      user: "Jane Smith",
      amount: "₹850.00",
      status: "Pending",
      date: "2024-01-15 12:15",
      method: "Bank Transfer",
    },
    {
      id: "TXN-123454",
      type: "Payment",
      user: "Mike Johnson",
      amount: "₹500.00",
      status: "Completed",
      date: "2024-01-14 16:45",
      method: "PayPal",
    },
  ];

  const loginHistory = [
    {
      id: 1,
      user: "John Doe",
      email: "john.doe@example.com",
      ip: "192.168.1.100",
      location: "New York, US",
      device: "Chrome on Windows",
      date: "2024-01-15 14:30",
      status: "Success",
    },
    {
      id: 2,
      user: "Jane Smith",
      email: "jane.smith@example.com",
      ip: "10.0.0.25",
      location: "London, UK",
      device: "Safari on macOS",
      date: "2024-01-15 12:15",
      status: "Success",
    },
  ];

  const notificationHistory = [
    {
      id: 1,
      recipient: "All Users",
      type: "System Maintenance",
      title: "Scheduled maintenance tonight",
      status: "Sent",
      date: "2024-01-15 10:00",
      delivered: 12847,
    },
    {
      id: 2,
      recipient: "Premium Users",
      type: "Feature Update",
      title: "New dashboard features available",
      status: "Sent",
      date: "2024-01-14 14:30",
      delivered: 3247,
    },
  ];

  const getTransactionIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "deposit":
        return <TrendingUp className="h-4 w-4 text-success" />;
      case "withdrawal":
        return <DollarSign className="h-4 w-4 text-warning" />;
      case "payment":
        return <CreditCard className="h-4 w-4 text-info" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "success":
      case "sent":
        return <Badge className="bg-success/10 text-success border-success/20">{status}</Badge>;
      case "pending":
        return <Badge variant="outline" className="border-warning text-warning">{status}</Badge>;
      case "failed":
        return <Badge variant="destructive">{status}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <FileBarChart className="h-8 w-8 text-primary" />
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground">Detailed reports and system analytics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-primary/20 text-primary hover:bg-primary/10">
            <Calendar className="h-4 w-4 mr-2" />
            Date Range
          </Button>
          <Button className="bg-gradient-primary hover:opacity-90 shadow-glow">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <p className="text-xl font-bold text-success">₹2.1M</p>
                <p className="text-xs text-success">+15% this month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-info" />
              <div>
                <p className="text-sm text-muted-foreground">Active Sessions</p>
                <p className="text-xl font-bold text-info">3,247</p>
                <p className="text-xs text-info">+8% from yesterday</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Notifications Sent</p>
                <p className="text-xl font-bold text-warning">16,094</p>
                <p className="text-xs text-warning">This week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">System Uptime</p>
                <p className="text-xl font-bold text-primary">99.9%</p>
                <p className="text-xs text-success">Last 30 days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="bg-gradient-card border-border/50 shadow-elegant">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>System Reports</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 pl-10 bg-background/50 border-border/50"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="transactions" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="transactions">Transaction History</TabsTrigger>
              <TabsTrigger value="logins">Login History</TabsTrigger>
              <TabsTrigger value="notifications">Notification History</TabsTrigger>
            </TabsList>

            <TabsContent value="transactions" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Transaction History</h3>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactionHistory.map((transaction) => (
                    <TableRow key={transaction.id} className="hover:bg-accent/50">
                      <TableCell className="font-medium">{transaction.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTransactionIcon(transaction.type)}
                          {transaction.type}
                        </div>
                      </TableCell>
                      <TableCell>{transaction.user}</TableCell>
                      <TableCell className="font-bold text-primary">{transaction.amount}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{transaction.method}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell className="text-muted-foreground">{transaction.date}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="logins" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Login History</h3>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loginHistory.map((login) => (
                    <TableRow key={login.id} className="hover:bg-accent/50">
                      <TableCell>
                        <div>
                          <p className="font-medium">{login.user}</p>
                          <p className="text-sm text-muted-foreground">{login.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">{login.ip}</code>
                      </TableCell>
                      <TableCell>{login.location}</TableCell>
                      <TableCell className="text-muted-foreground">{login.device}</TableCell>
                      <TableCell className="text-muted-foreground">{login.date}</TableCell>
                      <TableCell>{getStatusBadge(login.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Notification History</h3>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Delivered</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notificationHistory.map((notification) => (
                    <TableRow key={notification.id} className="hover:bg-accent/50">
                      <TableCell>
                        <Badge variant="outline">{notification.recipient}</Badge>
                      </TableCell>
                      <TableCell>{notification.type}</TableCell>
                      <TableCell className="font-medium">{notification.title}</TableCell>
                      <TableCell className="font-bold text-primary">{notification.delivered.toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(notification.status)}</TableCell>
                      <TableCell className="text-muted-foreground">{notification.date}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;