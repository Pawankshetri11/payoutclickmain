import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  FileText, 
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  Clock,
  Download
} from "lucide-react";

interface KYCDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: string;
    user_id: string;
    name: string;
    email: string;
    phone: string | null;
    status: string;
    kyc_status: string;
    balance: number;
    bank_account_number?: string;
    bank_name?: string;
    bank_routing_number?: string;
    bank_account_holder?: string;
    bank_account_type?: string;
    kyc_data?: any;
    kyc_submitted_at?: string;
    kyc_details?: {
      fullName: string;
      dateOfBirth: string;
      address: string;
      pincode: string;
      panNumber: string;
      aadharNumber: string;
      bankAccount: string;
      ifscCode: string;
      documents: {
        panCard: string;
        aadharFront: string;
        aadharBack: string;
        bankStatement: string;
        selfie: string;
      };
      submittedAt: string;
      bank?: {
        accountNumber?: string;
        bankName?: string;
        routing?: string;
        accountHolder?: string;
        accountType?: string;
      };
    };
  };
}

export function KYCDetailsModal({ open, onOpenChange, user }: KYCDetailsModalProps) {
  const getKycStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-success/10 text-success border-success/20 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Verified
        </Badge>;
      case "pending":
        return <Badge variant="outline" className="border-warning text-warning flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Pending Review
        </Badge>;
      case "rejected":
        return <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Rejected
        </Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // KYC details from database or mock data for demonstration
  const kycData = user.kyc_data || user.kyc_details;
  const kycDetails = kycData || {
    fullName: user.name,
    dateOfBirth: "1990-05-15",
    address: "123 Main Street, Andheri West",
    pincode: "400058",
    panNumber: "ABCDE1234F",
    aadharNumber: "1234 5678 9012",
    bankAccount: user.bank_account_number || "12345678901234",
    ifscCode: user.bank_routing_number || "HDFC0001234",
    documents: {
      panCard: kycData?.documents?.frontUrl || "/mock-documents/pan.jpg",
      aadharFront: kycData?.documents?.frontUrl || "/mock-documents/aadhar-front.jpg",
      aadharBack: kycData?.documents?.backUrl || "/mock-documents/aadhar-back.jpg",
      bankStatement: "/mock-documents/bank-statement.pdf",
      selfie: kycData?.documents?.selfieUrl || "/mock-documents/selfie.jpg"
    },
    submittedAt: user.kyc_submitted_at || "2024-01-15 10:30:00"
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            KYC Details - {user.name}
          </DialogTitle>
          <DialogDescription>
            Review and manage user's KYC verification documents
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                User Information
                {getKycStatusBadge(user.kyc_status)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} />
                  <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">ID:</span>
                      <span>{user.id}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Email:</span>
                      <span>{user.email}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Phone:</span>
                      <span>{user.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Submitted:</span>
                      <span>{kycDetails.submittedAt}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                    <p className="text-sm font-medium">{kycDetails.fullName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                    <p className="text-sm font-medium">{kycDetails.dateOfBirth}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">PAN Number</label>
                    <p className="text-sm font-medium font-mono">{kycDetails.panNumber}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Address</label>
                    <p className="text-sm font-medium">{kycDetails.address}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">PIN Code</label>
                    <p className="text-sm font-medium">{kycDetails.pincode}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Aadhar Number</label>
                    <p className="text-sm font-medium font-mono">{kycDetails.aadharNumber}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bank Information */}
          <Card>
            <CardHeader>
              <CardTitle>Bank Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Account Holder</label>
                  <p className="text-sm font-medium">{user.bank_account_holder || kycData?.bank?.accountHolder || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Account Number</label>
                  <p className="text-sm font-medium font-mono">{user.bank_account_number || kycData?.bank?.accountNumber || kycDetails.bankAccount}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Bank Name</label>
                  <p className="text-sm font-medium">{user.bank_name || kycData?.bank?.bankName || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Routing/IFSC Code</label>
                  <p className="text-sm font-medium font-mono">{user.bank_routing_number || kycData?.bank?.routing || kycDetails.ifscCode}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Account Type</label>
                  <p className="text-sm font-medium">{user.bank_account_type || kycData?.bank?.accountType || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Uploaded Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(kycDetails.documents).map(([type, url]) => (
                  <div key={type} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium capitalize">
                        {type.replace(/([A-Z])/g, ' $1').trim()}
                      </h4>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="aspect-video bg-muted rounded flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">Click to preview</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t">
            {user.kyc_status === "pending" && (
              <>
                <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10">
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject KYC
                </Button>
                <Button className="bg-success hover:bg-success/90 text-white">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve KYC
                </Button>
              </>
            )}
            {user.kyc_status === "verified" && (
              <Button variant="outline" className="text-warning border-warning hover:bg-warning/10">
                Request Re-verification
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}