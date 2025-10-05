import { useState } from "react";
import { useUsers } from "@/hooks/useUsers";
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
  LogIn
} from "lucide-react";
import { KYCDetailsModal } from "@/components/admin/KYCDetailsModal";
import { UserEditModal } from "./UserEditModal";
import { AddUserModal } from "@/components/admin/AddUserModal";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Users = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [kycModalOpen, setKycModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const { users, loading, updateUserStatus, updateKYCStatus, refetch } = useUsers();

  const handleLoginAsUser = async (userId: string, userEmail: string) => {
    // Show a dialog with user credentials for admin to login manually
    const message = `To login as this user:\n\nEmail: ${userEmail}\n\nOpen a new incognito window and use their email to login.`;
    
    // Copy email to clipboard
    try {
      await navigator.clipboard.writeText(userEmail);
      toast.success(`Email copied to clipboard!\n\n${message}`, {
        duration: 5000,
      });
    } catch (error) {
      toast.info(message, {
        duration: 5000,
      });
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
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="all">All Users</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="banned">Banned</TabsTrigger>
              <TabsTrigger value="email_unverified">Email Unverified</TabsTrigger>
              <TabsTrigger value="mobile_unverified">Mobile Unverified</TabsTrigger>
              <TabsTrigger value="kyc_pending">KYC Pending</TabsTrigger>
              <TabsTrigger value="with_balance">With Balance</TabsTrigger>
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
                            <p className="text-sm text-muted-foreground">ID: {user.id.substring(0, 8)}</p>
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
                            <p className="text-sm text-muted-foreground">ID: {user.id.substring(0, 8)}</p>
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
                            <p className="text-sm text-muted-foreground">ID: {user.id.substring(0, 8)}</p>
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
                            <p className="text-sm text-muted-foreground">ID: {user.id.substring(0, 8)}</p>
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

            {/* Mobile Unverified Tab */}
            <TabsContent value="mobile_unverified" className="space-y-4">
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
                  {users.filter(u => u.status === 'mobile_unverified' && (!searchTerm || u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()))).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <p className="text-muted-foreground">No mobile unverified users found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.filter(u => u.status === 'mobile_unverified' && (!searchTerm || u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()))).map((user) => (
                      <TableRow key={user.id} className="hover:bg-accent/50">
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{user.name}</p>
                            <p className="text-sm text-muted-foreground">ID: {user.id.substring(0, 8)}</p>
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
                            <p className="text-sm text-muted-foreground">ID: {user.id.substring(0, 8)}</p>
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
                            <p className="text-sm text-muted-foreground">ID: {user.id.substring(0, 8)}</p>
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
    </div>
  );
};

export default Users;