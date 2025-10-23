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
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useLoginLogs } from "@/hooks/useLoginLogs";
import { useErrorLogs } from "@/hooks/useErrorLogs";

const Reports = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { logs: loginLogs, loading: loginLoading } = useLoginLogs();
  const { logs: errorLogs, loading: errorLoading } = useErrorLogs();

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return <Badge className="bg-success/10 text-success border-success/20"><CheckCircle className="h-3 w-3 mr-1" /> Success</Badge>;
      case "failed":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" /> Critical</Badge>;
      case "error":
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20"><XCircle className="h-3 w-3 mr-1" /> Error</Badge>;
      case "warning":
        return <Badge className="bg-warning/10 text-warning border-warning/20"><AlertTriangle className="h-3 w-3 mr-1" /> Warning</Badge>;
      default:
        return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  const filteredLoginLogs = loginLogs.filter(log =>
    log.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredErrorLogs = errorLogs.filter(log =>
    log.error_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.error_message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <CheckCircle className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Total Logins</p>
                <p className="text-xl font-bold text-success">{loginLogs.length}</p>
                <p className="text-xs text-success">All time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Successful Logins</p>
                <p className="text-xl font-bold text-success">{loginLogs.filter(l => l.status === 'success').length}</p>
                <p className="text-xs text-success">Recent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">Total Errors</p>
                <p className="text-xl font-bold text-destructive">{errorLogs.length}</p>
                <p className="text-xs text-destructive">Logged</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Critical Errors</p>
                <p className="text-xl font-bold text-warning">{errorLogs.filter(e => e.severity === 'critical').length}</p>
                <p className="text-xs text-warning">Requires attention</p>
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
          <Tabs defaultValue="login" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login Logs</TabsTrigger>
              <TabsTrigger value="errors">Error Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">User Login Activity</h3>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Login Time</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loginLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      </TableCell>
                    </TableRow>
                  ) : filteredLoginLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No login logs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLoginLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.user_name || 'Unknown'}</TableCell>
                        <TableCell>{log.email}</TableCell>
                        <TableCell>{new Date(log.login_time).toLocaleString()}</TableCell>
                        <TableCell>{log.ip_address || 'N/A'}</TableCell>
                        <TableCell>{getStatusBadge(log.status)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="errors" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">System Error Logs</h3>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Error Type</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Severity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {errorLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      </TableCell>
                    </TableRow>
                  ) : filteredErrorLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No error logs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredErrorLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.error_type}</TableCell>
                        <TableCell className="max-w-md truncate">{log.error_message}</TableCell>
                        <TableCell>{log.user_email || 'Anonymous'}</TableCell>
                        <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                        <TableCell>{getSeverityBadge(log.severity)}</TableCell>
                      </TableRow>
                    ))
                  )}
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
