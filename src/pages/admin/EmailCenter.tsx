import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Send, Users, Mail, Clock, CheckCircle, XCircle, Plus, Trash2 } from 'lucide-react';
import { useEmailSystem } from '@/hooks/useEmailSystem';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  name: string;
  status: string;
}

export default function EmailCenter() {
  const { sendManualEmail, getEmailLogs, loading } = useEmailSystem();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [recipientMode, setRecipientMode] = useState<'all' | 'active' | 'pending' | 'custom'>('all');

  useEffect(() => {
    fetchUsers();
    fetchEmailLogs();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, email, name, status');

      if (error) throw error;
      const usersWithId = (data || []).map(user => ({
        id: user.user_id,
        email: user.email,
        name: user.name,
        status: user.status
      }));
      setUsers(usersWithId);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    }
  };

  const fetchEmailLogs = async () => {
    try {
      const logs = await getEmailLogs();
      setEmailLogs(logs);
    } catch (error) {
      console.error('Error fetching email logs:', error);
    }
  };

  const getRecipientEmails = () => {
    switch (recipientMode) {
      case 'all':
        return users.map(u => u.email);
      case 'active':
        return users.filter(u => u.status === 'active').map(u => u.email);
      case 'pending':
        return users.filter(u => u.status === 'pending').map(u => u.email);
      case 'custom':
        return users.filter(u => selectedUsers.includes(u.id)).map(u => u.email);
      default:
        return [];
    }
  };

  const handleSendEmail = async () => {
    if (!emailSubject.trim() || !emailContent.trim()) {
      toast.error('Please fill in both subject and content');
      return;
    }

    const recipients = getRecipientEmails();
    if (recipients.length === 0) {
      toast.error('No recipients selected');
      return;
    }

    try {
      await sendManualEmail({
        recipients,
        subject: emailSubject,
        content: emailContent
      });
      
      setEmailSubject('');
      setEmailContent('');
      setSelectedUsers([]);
      fetchEmailLogs();
    } catch (error) {
      // Error already handled in useEmailSystem
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Sent</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Email Center</h1>
          <p className="text-muted-foreground">Send emails to users and manage email communications</p>
        </div>
      </div>

      <Tabs defaultValue="compose" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="compose" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Compose Email
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Compose Email */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    Compose Email
                  </CardTitle>
                  <CardDescription>
                    Send emails to selected users or user groups
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="recipients">Recipients</Label>
                    <Select value={recipientMode} onValueChange={(value: any) => setRecipientMode(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select recipients" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users ({users.length})</SelectItem>
                        <SelectItem value="active">Active Users ({users.filter(u => u.status === 'active').length})</SelectItem>
                        <SelectItem value="pending">Pending Users ({users.filter(u => u.status === 'pending').length})</SelectItem>
                        <SelectItem value="custom">Custom Selection</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Email subject"
                    />
                  </div>

                  <div>
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      value={emailContent}
                      onChange={(e) => setEmailContent(e.target.value)}
                      placeholder="Write your email content here..."
                      rows={8}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <p className="text-sm text-muted-foreground">
                      {getRecipientEmails().length} recipient(s) selected
                    </p>
                    <Button 
                      onClick={handleSendEmail} 
                      disabled={loading}
                      className="flex items-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      {loading ? 'Sending...' : 'Send Email'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* User Selection (when custom mode) */}
            {recipientMode === 'custom' && (
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Select Users
                    </CardTitle>
                    <CardDescription>
                      Choose specific users to send email to
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="max-h-96 overflow-y-auto">
                    <div className="space-y-2">
                      {users.map((user) => (
                        <div
                          key={user.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedUsers.includes(user.id)
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:bg-accent'
                          }`}
                          onClick={() => toggleUserSelection(user.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                            <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                              {user.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Logs
              </CardTitle>
              <CardDescription>
                View recent email sending history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emailLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.recipient}</TableCell>
                      <TableCell>{log.subject}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.type}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                      <TableCell>
                        {log.sent_at ? new Date(log.sent_at).toLocaleString() : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}