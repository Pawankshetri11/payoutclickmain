import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  HelpCircle,
  Search,
  Filter,
  Plus,
  Clock,
  CheckCircle,
  MessageSquare,
  AlertTriangle,
  User,
  Calendar,
  Eye,
  Reply,
} from "lucide-react";

const Tickets = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const mockTickets = [
    {
      id: "TKT-4821",
      subject: "Unable to withdraw funds",
      user: "John Doe",
      email: "john.doe@example.com",
      priority: "high",
      category: "Payment Issues",
      status: "pending",
      created: "2024-01-15 14:30",
      lastReply: "2024-01-15 16:45",
      messages: 3,
    },
    {
      id: "TKT-4820",
      subject: "Account verification problem",
      user: "Jane Smith",
      email: "jane.smith@example.com",
      priority: "medium",
      category: "Account Issues",
      status: "answered",
      created: "2024-01-15 10:20",
      lastReply: "2024-01-15 14:15",
      messages: 2,
    },
    {
      id: "TKT-4819",
      subject: "Project submission error",
      user: "Mike Johnson",
      email: "mike.johnson@example.com",
      priority: "low",
      category: "Technical Support",
      status: "closed",
      created: "2024-01-14 16:30",
      lastReply: "2024-01-14 18:00",
      messages: 5,
    },
    {
      id: "TKT-4818",
      subject: "Password reset request",
      user: "Sarah Wilson",
      email: "sarah.wilson@example.com",
      priority: "low",
      category: "Account Issues",
      status: "closed",
      created: "2024-01-14 09:15",
      lastReply: "2024-01-14 09:30",
      messages: 1,
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="border-warning text-warning">Pending</Badge>;
      case "answered":
        return <Badge className="bg-info/10 text-info border-info/20">Answered</Badge>;
      case "closed":
        return <Badge className="bg-success/10 text-success border-success/20">Closed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High</Badge>;
      case "medium":
        return <Badge variant="outline" className="border-warning text-warning">Medium</Badge>;
      case "low":
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-warning" />;
      case "answered":
        return <MessageSquare className="h-4 w-4 text-info" />;
      case "closed":
        return <CheckCircle className="h-4 w-4 text-success" />;
      default:
        return <HelpCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <HelpCircle className="h-8 w-8 text-primary" />
            Support Ticket System
          </h1>
          <p className="text-muted-foreground">Manage customer support tickets and inquiries</p>
        </div>
        <Button className="bg-gradient-primary hover:opacity-90 shadow-glow">
          <Plus className="h-4 w-4 mr-2" />
          Create Ticket
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Pending Tickets</p>
                <p className="text-xl font-bold text-warning">23</p>
                <p className="text-xs text-muted-foreground">Awaiting response</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-info" />
              <div>
                <p className="text-sm text-muted-foreground">Answered Today</p>
                <p className="text-xl font-bold text-info">47</p>
                <p className="text-xs text-muted-foreground">Avg response: 2.3h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Closed This Week</p>
                <p className="text-xl font-bold text-success">156</p>
                <p className="text-xs text-muted-foreground">95% satisfaction</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">High Priority</p>
                <p className="text-xl font-bold text-destructive">5</p>
                <p className="text-xs text-muted-foreground">Requires attention</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="bg-gradient-card border-border/50 shadow-elegant">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Support Tickets</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search tickets..."
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
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Tickets</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="answered">Answered</TabsTrigger>
              <TabsTrigger value="closed">Closed</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket ID</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTickets.map((ticket) => (
                    <TableRow key={ticket.id} className="hover:bg-accent/50">
                      <TableCell>
                        <p className="font-medium text-foreground">{ticket.id}</p>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{ticket.subject}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <MessageSquare className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{ticket.messages} messages</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{ticket.user}</p>
                            <p className="text-sm text-muted-foreground">{ticket.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getPriorityBadge(ticket.priority)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{ticket.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(ticket.status)}
                          {getStatusBadge(ticket.status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            Created: {ticket.created}
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground mt-1">
                            <Reply className="h-3 w-3" />
                            Last reply: {ticket.lastReply}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
                            <Reply className="h-4 w-4 mr-1" />
                            Reply
                          </Button>
                        </div>
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

export default Tickets;