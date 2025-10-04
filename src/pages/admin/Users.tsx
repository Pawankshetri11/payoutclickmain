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
  Edit
} from "lucide-react";
import { KYCDetailsModal } from "@/components/admin/KYCDetailsModal";
import { UserEditModal } from "./UserEditModal";

const Users = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [kycModalOpen, setKycModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const mockUsers = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+91 98765 43210",
      status: "active",
      balance: "₹1,234.56",
      joined: "2024-01-15",
      kyc: "verified",
      totalEarnings: "₹5,420.80",
      tasksCompleted: 47,
      averageRating: 4.8
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@example.com",
      phone: "+91 87654 32109",
      status: "active",
      balance: "₹892.30",
      joined: "2024-01-14",
      kyc: "pending",
      totalEarnings: "₹2,156.90",
      tasksCompleted: 23,
      averageRating: 4.5
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike.johnson@example.com",
      phone: "+91 76543 21098",
      status: "banned",
      balance: "₹567.89",
      joined: "2023-12-20",
      kyc: "verified",
      totalEarnings: "₹1,890.45",
      tasksCompleted: 15,
      averageRating: 3.2
    },
    {
      id: 4,
      name: "Priya Sharma",
      email: "priya.sharma@example.com",
      phone: "+91 65432 10987",
      status: "active",
      balance: "₹2,150.75",
      joined: "2024-01-10",
      kyc: "verified",
      totalEarnings: "₹8,945.60",
      tasksCompleted: 89,
      averageRating: 4.9
    },
    {
      id: 5,
      name: "Rahul Kumar",
      email: "rahul.kumar@example.com",
      phone: "+91 54321 09876",
      status: "active",
      balance: "₹0.00",
      joined: "2024-01-12",
      kyc: "pending",
      totalEarnings: "₹750.25",
      tasksCompleted: 8,
      averageRating: 4.2
    },
  ];

  const [users, setUsers] = useState(mockUsers);

  const handleUserUpdate = (updatedUser: any) => {
    setUsers(users.map(user => user.id === updatedUser.id ? updatedUser : user));
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
        <Button className="bg-gradient-primary hover:opacity-90 shadow-glow">
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
                <p className="text-xl font-bold text-success">8,547</p>
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
                <p className="text-xl font-bold text-destructive">147</p>
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
                <p className="text-xl font-bold text-warning">423</p>
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
                <p className="text-xl font-bold text-primary">2,847</p>
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
                  {users.map((user) => (
                    <TableRow key={user.id} className="hover:bg-accent/50">
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{user.name}</p>
                          <p className="text-sm text-muted-foreground">ID: {user.id}</p>
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
                            {user.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>{getKycBadge(user.kyc)}</TableCell>
                      <TableCell className="font-medium">{user.balance}</TableCell>
                      <TableCell className="text-muted-foreground">{user.joined}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
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
          onUserUpdate={handleUserUpdate}
        />
      )}
    </div>
  );
};

export default Users;