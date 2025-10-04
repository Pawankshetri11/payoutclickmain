import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  HelpCircle,
  Plus,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertTriangle,
  Mail,
  Phone,
} from "lucide-react";
import { toast } from "sonner";

export default function Support() {
  const [newTicketOpen, setNewTicketOpen] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    subject: "",
    category: "",
    priority: "",
    message: "",
  });

  const mockTickets = [
    {
      id: "TKT-001",
      subject: "Payment not received",
      category: "Payment",
      priority: "high",
      status: "open",
      created: "2024-01-15",
      lastReply: "2024-01-15",
      messages: 3,
    },
    {
      id: "TKT-002",
      subject: "Task verification issue",
      category: "Technical",
      priority: "medium",
      status: "in_progress",
      created: "2024-01-14",
      lastReply: "2024-01-14",
      messages: 2,
    },
    {
      id: "TKT-003",
      subject: "Account KYC question",
      category: "Account",
      priority: "low",
      status: "resolved",
      created: "2024-01-12",
      lastReply: "2024-01-13",
      messages: 1,
    },
  ];

  const handleSubmitTicket = async () => {
    if (!ticketForm.subject || !ticketForm.category || !ticketForm.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      // TODO: Save to support_tickets table when it exists
      const ticketData = {
        subject: ticketForm.subject,
        category: ticketForm.category,
        priority: ticketForm.priority || 'medium',
        message: ticketForm.message,
        status: 'open',
        created_at: new Date().toISOString()
      };

      console.log("Creating support ticket:", ticketData);
      
      toast.success("Support ticket created successfully! We'll respond within 24 hours.");
      setNewTicketOpen(false);
      setTicketForm({
        subject: "",
        category: "",
        priority: "",
        message: "",
      });
    } catch (error: any) {
      console.error("Error creating ticket:", error);
      toast.error("Failed to create support ticket");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-warning/10 text-warning border-warning/20">Open</Badge>;
      case "in_progress":
        return <Badge className="bg-primary/10 text-primary border-primary/20">In Progress</Badge>;
      case "resolved":
        return <Badge className="bg-success/10 text-success border-success/20">Resolved</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High</Badge>;
      case "medium":
        return <Badge className="bg-warning/10 text-warning border-warning/20">Medium</Badge>;
      case "low":
        return <Badge className="bg-success/10 text-success border-success/20">Low</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-primary" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-success" />;
      default:
        return <HelpCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="container mx-auto px-3 md:px-6 py-4 md:py-8 max-w-6xl">
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
              <HelpCircle className="h-6 w-6 md:h-8 md:w-8 text-primary" />
              Support Center
            </h1>
            <p className="text-muted-foreground mt-1 md:mt-2 text-sm md:text-base">
              Get help with your questions and issues
            </p>
          </div>
          <Dialog open={newTicketOpen} onOpenChange={setNewTicketOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary hover:opacity-90">
                <Plus className="h-4 w-4 mr-2" />
                Create Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Support Ticket</DialogTitle>
                <DialogDescription>
                  Describe your issue and we'll help you resolve it
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    placeholder="Brief description of your issue"
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm({...ticketForm, subject: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={ticketForm.category} onValueChange={(value) => setTicketForm({...ticketForm, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical Support</SelectItem>
                      <SelectItem value="payment">Payment Issues</SelectItem>
                      <SelectItem value="account">Account & KYC</SelectItem>
                      <SelectItem value="general">General Inquiry</SelectItem>
                      <SelectItem value="feedback">Feedback</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={ticketForm.priority} onValueChange={(value) => setTicketForm({...ticketForm, priority: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    placeholder="Describe your issue in detail..."
                    value={ticketForm.message}
                    onChange={(e) => setTicketForm({...ticketForm, message: e.target.value})}
                    rows={4}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setNewTicketOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmitTicket}>
                  Create Ticket
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quick Help */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardContent className="p-6 text-center">
            <Mail className="h-8 w-8 text-primary mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">Email Support</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Get help via email
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText('support@example.com');
                toast.success('Email copied to clipboard!');
              }}
            >
              support@example.com
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardContent className="p-6 text-center">
            <Phone className="h-8 w-8 text-primary mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">Phone Support</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Call us during business hours
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText('+91 98765 43210');
                toast.success('Phone number copied to clipboard!');
              }}
            >
              +91 98765 43210
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardContent className="p-6 text-center">
            <MessageSquare className="h-8 w-8 text-primary mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">Live Chat</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Chat with support agent
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                toast.info('Live chat feature coming soon!');
              }}
            >
              Start Chat
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* My Tickets */}
      <Card className="bg-gradient-card border-border/50 shadow-elegant">
        <CardHeader>
          <CardTitle>My Support Tickets</CardTitle>
          <CardDescription>View and track your support requests</CardDescription>
        </CardHeader>
        <CardContent>
          {mockTickets.length > 0 ? (
            <div className="space-y-4">
              {mockTickets.map((ticket) => (
                <div key={ticket.id} className="border border-border/50 rounded-lg p-4 hover:bg-accent/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(ticket.status)}
                      <h3 className="font-semibold text-foreground">{ticket.subject}</h3>
                      <Badge variant="outline">{ticket.id}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {getPriorityBadge(ticket.priority)}
                      {getStatusBadge(ticket.status)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span>Category: {ticket.category}</span>
                      <span>{ticket.messages} messages</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span>Created: {ticket.created}</span>
                      <span>Last reply: {ticket.lastReply}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No support tickets</h3>
              <p className="text-muted-foreground mb-4">
                You haven't created any support tickets yet
              </p>
              <Button onClick={() => setNewTicketOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Ticket
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}