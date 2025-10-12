import { useState, useEffect } from "react";
import { useUsers } from "@/hooks/useUsers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users as UsersIcon,
  Search,
  Filter,
  UserPlus,
  Mail,
  Phone,
  Shield,
  Clock,
  DollarSign,
  Ban,
  Eye,
  Edit,
  LogIn,
  Trash2
} from "lucide-react";
import { KYCDetailsModal } from "@/components/admin/KYCDetailsModal";
import { UserEditModal } from "./UserEditModal";
import { AddUserModal } from "@/components/admin/AddUserModal";
import { toast } from "sonner";
import { formatId } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const Users = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [kycModalOpen, setKycModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [deletingUser, setDeletingUser] = useState(false);
  const [adminUserIds, setAdminUserIds] = useState<Set<string>>(new Set());
  const { users, loading, updateUserStatus, updateKYCStatus, refetch } = useUsers();

  // Fetch admin user IDs
  useEffect(() => {
    const fetchAdminUsers = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('user_roles')
          .select('user_id')
          .eq('role', 'admin');
        
        if (error) {
          console.error('Error fetching admin users:', error);
          return;
        }
        
        if (data) {
          setAdminUserIds(new Set(data.map((r: any) => r.user_id)));
        }
      } catch (error) {
        console.error('Error fetching admin users:', error);
      }
    };
    fetchAdminUsers();
  }, []);

  const handleLoginAsUser = async (userId: string, userEmail: string) => {
    try {
      toast.info('Generating user session...');
      const redirectTo = `${window.location.origin}/user`;
      
      const { data, error } = await supabase.functions.invoke('impersonate-user', {
        body: { userId, email: userEmail, redirectTo }
      });
      
      if (error) {
        console.error('Function invocation error:', error);
        throw new Error(`Function error: ${error.message}`);
      }
      
      if (data?.error) {
        console.error('Function returned error:', data.error);
        throw new Error(data.error);
      }
      
      if (data?.url) {
        toast.success('Opening user session...');
        window.location.href = data.url;
      } else {
        console.error('No URL in response:', data);
        throw new Error('No impersonation URL returned');
      }
    } catch (err: any) {
      console.error('Impersonation error details:', err);
      toast.error(err.message || 'Failed to login as user. Check console for details.');
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    setDeletingUser(true);
    try {
      // First try to use the edge function
      try {
        const { data, error } = await supabase.functions.invoke('delete-user', {
          body: { userId: userToDelete.user_id }
        });

        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        
        toast.success(`User ${userToDelete.name} deleted successfully`);
        setUserToDelete(null);
        refetch();
        return;
      } catch (funcError) {
        console.warn('Edge function failed, trying database function:', funcError);
      }

      // Fallback to database function
      const { data, error } = await (supabase as any).rpc('delete_user_account', {
        target_user_id: userToDelete.user_id
      });

      if (error) throw error;
      if (data && typeof data === 'object' && 'error' in data) {
        throw new Error(data.error);
      }
      
      toast.success(`User ${userToDelete.name} deleted successfully`);
      setUserToDelete(null);
      refetch();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user: ' + (error.message || 'Unknown error'));
    } finally {
      setDeletingUser(false);
    }
  };


  // Calculate stats from real data
  const stats = {
    activeUsers: users.filter(u => u.status === 'active').length,
    bannedUsers: users.filter(u => u.status === 'suspended').length,
    kycPending: users.filter(u => u.kyc_status === 'pending').length,
    withBalance: users.filter(u => u.balance > 0).length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-success/10 text-success border-success/20">Active</Badge>;
      case "banned":
        return <Badge variant="destructive">Banned</Badge>;
      case "email_unverified":
        return <Badge variant="outline" className="border-warning text-warning">Email Unverified</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getKycBadge = (kyc: string) => {
    switch (kyc) {
      case "verified":
        return <Badge className="bg-success/10 text-success border-success/20">Verified</Badge>;
      case "pending":
        return <Badge variant="outline" className="border-warning text-warning">Pending</Badge>;
      case "unverified":
        return <Badge variant="outline">Unverified</Badge>;
      default:
        return <Badge variant="secondary">{kyc}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <UsersIcon className="h-8 w-8 text-primary" />
            User Management
          </h1>
          <p className="text-muted-foreground">Manage all users and their account statuses</p>
        </div>
        <Button 
          className="bg-gradient-primary hover:opacity-90 shadow-glow"
          onClick={() => setAddUserModalOpen(true)}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-xl font-bold text-success">{stats.activeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">Banned Users</p>
                <p className="text-xl font-bold text-destructive">{stats.bannedUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">KYC Pending</p>
                <p className="text-xl font-bold text-warning">{stats.kycPending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">With Balance</p>
                <p className="text-xl font-bold text-primary">{stats.withBalance}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="bg-gradient-card border-border/50 shadow-elegant">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Users</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
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
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All Users</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="banned">Banned</TabsTrigger>
              <TabsTrigger value="email_unverified">Email Unverified</TabsTrigger>
              <TabsTrigger value="kyc_pending">KYC Pending</TabsTrigger>
            </TabsList>

            {/* All Users Tab */}
            <TabsContent value="all" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>KYC</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="text-sm text-muted-foreground mt-2">Loading users...</p>
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <p className="text-muted-foreground">No users found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users
                      .filter(u => !searchTerm || u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((user) => (
                      <TableRow key={user.id} className="hover:bg-accent/50">
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{user.name}</p>
                            <p className="text-sm text-muted-foreground">ID: {formatId(user.id, 'USR')}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {user.phone || 'N/A'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell>{getKycBadge(user.kyc_status)}</TableCell>
                        <TableCell className="font-medium">₹{user.balance.toFixed(2)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1 flex-wrap">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setKycModalOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              KYC
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setEditModalOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleLoginAsUser(user.user_id, user.email)}
                            >
                              <LogIn className="h-4 w-4 mr-1" />
                              Login
                            </Button>
                            {!adminUserIds.has(user.user_id) && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setUserToDelete(user)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            {/* Active Users Tab */}
            <TabsContent value="active" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>KYC</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.filter(u => u.status === 'active' && (!searchTerm || u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()))).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <p className="text-muted-foreground">No active users found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.filter(u => u.status === 'active' && (!searchTerm || u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()))).map((user) => (
                      <TableRow key={user.id} className="hover:bg-accent/50">
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{user.name}</p>
                            <p className="text-sm text-muted-foreground">ID: {formatId(user.id, 'USR')}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {user.phone || 'N/A'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getKycBadge(user.kyc_status)}</TableCell>
                        <TableCell className="font-medium">₹{user.balance.toFixed(2)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 flex-wrap">
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedUser(user); setKycModalOpen(true); }}>
                              <Eye className="h-4 w-4 mr-1" />KYC
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedUser(user); setEditModalOpen(true); }}>
                              <Edit className="h-4 w-4 mr-1" />Edit
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleLoginAsUser(user.user_id, user.email)}>
                              <LogIn className="h-4 w-4 mr-1" />Login
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={async () => {
                                if (!confirm(`Are you sure you want to delete user ${user.name}?`)) return;
                                try {
                                  const { error } = await supabase.auth.admin.deleteUser(user.user_id);
                                  if (error) throw error;
                                  toast.success('User deleted successfully');
                                  refetch();
                                } catch (error: any) {
                                  console.error('Delete error:', error);
                                  toast.error('Failed to delete user');
                                }
                              }}
                            >
                              <Ban className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            {/* Banned Users Tab */}
            <TabsContent value="banned" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>KYC</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.filter(u => u.status === 'banned' && (!searchTerm || u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()))).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <p className="text-muted-foreground">No banned users found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.filter(u => u.status === 'banned' && (!searchTerm || u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()))).map((user) => (
                      <TableRow key={user.id} className="hover:bg-accent/50">
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{user.name}</p>
                            <p className="text-sm text-muted-foreground">ID: {formatId(user.id, 'USR')}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {user.phone || 'N/A'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getKycBadge(user.kyc_status)}</TableCell>
                        <TableCell className="font-medium">₹{user.balance.toFixed(2)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 flex-wrap">
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedUser(user); setKycModalOpen(true); }}>
                              <Eye className="h-4 w-4 mr-1" />KYC
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedUser(user); setEditModalOpen(true); }}>
                              <Edit className="h-4 w-4 mr-1" />Edit
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleLoginAsUser(user.user_id, user.email)}>
                              <LogIn className="h-4 w-4 mr-1" />Login
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            {/* Email Unverified Tab */}
            <TabsContent value="email_unverified" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>KYC</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.filter(u => u.status === 'email_unverified' && (!searchTerm || u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()))).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <p className="text-muted-foreground">No email unverified users found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.filter(u => u.status === 'email_unverified' && (!searchTerm || u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()))).map((user) => (
                      <TableRow key={user.id} className="hover:bg-accent/50">
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{user.name}</p>
                            <p className="text-sm text-muted-foreground">ID: {formatId(user.id, 'USR')}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {user.phone || 'N/A'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getKycBadge(user.kyc_status)}</TableCell>
                        <TableCell className="font-medium">₹{user.balance.toFixed(2)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 flex-wrap">
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedUser(user); setKycModalOpen(true); }}>
                              <Eye className="h-4 w-4 mr-1" />KYC
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedUser(user); setEditModalOpen(true); }}>
                              <Edit className="h-4 w-4 mr-1" />Edit
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleLoginAsUser(user.user_id, user.email)}>
                              <LogIn className="h-4 w-4 mr-1" />Login
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="mobile_unverified" className="space-y-4">
              <div className="text-center py-8">
                <p className="text-muted-foreground">Mobile verification tab has been removed</p>
              </div>
            </TabsContent>

            {/* KYC Pending Tab */}
            <TabsContent value="kyc_pending" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.filter(u => u.kyc_status === 'pending' && (!searchTerm || u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()))).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <p className="text-muted-foreground">No KYC pending users found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.filter(u => u.kyc_status === 'pending' && (!searchTerm || u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()))).map((user) => (
                      <TableRow key={user.id} className="hover:bg-accent/50">
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{user.name}</p>
                            <p className="text-sm text-muted-foreground">ID: {formatId(user.id, 'USR')}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {user.phone || 'N/A'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell className="font-medium">₹{user.balance.toFixed(2)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 flex-wrap">
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedUser(user); setKycModalOpen(true); }}>
                              <Eye className="h-4 w-4 mr-1" />KYC
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedUser(user); setEditModalOpen(true); }}>
                              <Edit className="h-4 w-4 mr-1" />Edit
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleLoginAsUser(user.user_id, user.email)}>
                              <LogIn className="h-4 w-4 mr-1" />Login
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            {/* With Balance Tab */}
            <TabsContent value="with_balance" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>KYC</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.filter(u => u.balance > 0 && (!searchTerm || u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()))).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <p className="text-muted-foreground">No users with balance found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.filter(u => u.balance > 0 && (!searchTerm || u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()))).map((user) => (
                      <TableRow key={user.id} className="hover:bg-accent/50">
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{user.name}</p>
                            <p className="text-sm text-muted-foreground">ID: {formatId(user.id, 'USR')}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {user.phone || 'N/A'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell>{getKycBadge(user.kyc_status)}</TableCell>
                        <TableCell className="font-medium">₹{user.balance.toFixed(2)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 flex-wrap">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={async () => {
                                try {
                                  // Check if user already has pending withdrawal
                                  const { data: existingWithdrawal } = await (supabase as any)
                                    .from('withdrawals')
                                    .select('*')
                                    .eq('user_id', user.user_id)
                                    .eq('status', 'pending')
                                    .maybeSingle();

                                  if (existingWithdrawal) {
                                    toast.error('User already has a pending withdrawal request');
                                    return;
                                  }

                                  if (user.balance < 100) {
                                    toast.error('User balance is less than ₹100 minimum');
                                    return;
                                  }

                                  // Create withdrawal request
                                  const { error } = await (supabase as any)
                                    .from('withdrawals')
                                    .insert({
                                      user_id: user.user_id,
                                      amount: user.balance,
                                      status: 'pending',
                                      payment_method: 'Bank Transfer'
                                    });

                                  if (error) throw error;
                                  toast.success('Withdrawal request created successfully');
                                  refetch();
                                } catch (error: any) {
                                  console.error('Error creating withdrawal:', error);
                                  toast.error('Failed to create withdrawal request');
                                }
                              }}
                              className="gap-1 bg-gradient-primary hover:opacity-90"
                            >
                              <DollarSign className="h-4 w-4" />
                              Instant Withdrawal
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedUser(user); setKycModalOpen(true); }}>
                              <Eye className="h-4 w-4 mr-1" />KYC
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedUser(user); setEditModalOpen(true); }}>
                              <Edit className="h-4 w-4 mr-1" />Edit
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleLoginAsUser(user.user_id, user.email)}>
                              <LogIn className="h-4 w-4 mr-1" />Login
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* KYC Details Modal */}
      {selectedUser && (
        <KYCDetailsModal
          open={kycModalOpen}
          onOpenChange={setKycModalOpen}
          user={selectedUser}
        />
      )}

      {/* User Edit Modal */}
      {selectedUser && (
        <UserEditModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          user={selectedUser}
          onUserUpdate={() => {
            setEditModalOpen(false);
            setSelectedUser(null);
            refetch();
          }}
        />
      )}

      {/* Add User Modal */}
      <AddUserModal 
        open={addUserModalOpen}
        onOpenChange={setAddUserModalOpen}
        onUserAdded={refetch}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{userToDelete?.name}</strong> ({userToDelete?.email})?
              This will permanently delete their account, profile, and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingUser}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={deletingUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingUser ? 'Deleting...' : 'Delete User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Users;