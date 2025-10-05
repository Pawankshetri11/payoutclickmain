import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
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
  Download,
  Wallet
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
  const [processing, setProcessing] = useState(false);
  
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

  // Extract real KYC data - NO DUMMY DATA
  const kycData = user.kyc_data;
  const hasKycData = kycData && Object.keys(kycData).length > 0;
  
  // Helper to extract address string from potentially nested object
  const getAddressString = (addressData: any) => {
    if (!addressData) return null;
    if (typeof addressData === 'string') return addressData;
    if (addressData && typeof addressData === 'object') {
      const { address, city, state, zip, country } = addressData;
      const parts = [address, city, state, zip, country].filter(Boolean);
      return parts.join(', ');
    }
    return null;
  };
  
  // Extract personal info from KYC data
  const personalInfo = kycData?.personal || {};
  const documentsInfo = kycData?.documents || {};
  const addressInfo = kycData?.address || {};
  const bankInfo = kycData?.bank || {};
  
  const handleApprove = async () => {
    try {
      setProcessing(true);
      const { error } = await supabase
        .from('profiles')
        .update({ kyc_status: 'verified' })
        .eq('user_id', user.user_id);
      
      if (error) throw error;
      
      toast.success('KYC approved successfully');
      onOpenChange(false);
      window.location.reload();
    } catch (error: any) {
      console.error('Error approving KYC:', error);
      toast.error('Failed to approve KYC');
    } finally {
      setProcessing(false);
    }
  };
  
  const handleReject = async () => {
    try {
      setProcessing(true);
      const { error } = await supabase
        .from('profiles')
        .update({ kyc_status: 'rejected' })
        .eq('user_id', user.user_id);
      
      if (error) throw error;
      
      toast.success('KYC rejected - user can resubmit');
      onOpenChange(false);
      window.location.reload();
    } catch (error: any) {
      console.error('Error rejecting KYC:', error);
      toast.error('Failed to reject KYC');
    } finally {
      setProcessing(false);
    }
  };
  
  const handleRequestReverification = async () => {
    try {
      setProcessing(true);
      const { error } = await supabase
        .from('profiles')
        .update({ kyc_status: 'pending' })
        .eq('user_id', user.user_id);
      
      if (error) throw error;
      
      toast.success('Re-verification requested');
      onOpenChange(false);
      window.location.reload();
    } catch (error: any) {
      console.error('Error requesting re-verification:', error);
      toast.error('Failed to request re-verification');
    } finally {
      setProcessing(false);
    }
  };
  
  if (!hasKycData && user.kyc_status === 'unverified') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>No KYC Data</DialogTitle>
            <DialogDescription>
              This user has not submitted KYC documents yet.
            </DialogDescription>
          </DialogHeader>
          <div className="py-8 text-center">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">User needs to complete KYC verification first.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

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
                      <span>{user.phone || personalInfo.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Submitted:</span>
                      <span>{user.kyc_submitted_at ? new Date(user.kyc_submitted_at).toLocaleString() : 'N/A'}</span>
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
              {personalInfo && Object.keys(personalInfo).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">First Name</label>
                      <p className="text-sm font-medium">{personalInfo.firstName || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                      <p className="text-sm font-medium">{personalInfo.lastName || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                      <p className="text-sm font-medium">{personalInfo.dob || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Gender</label>
                      <p className="text-sm font-medium capitalize">{personalInfo.gender || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Phone</label>
                      <p className="text-sm font-medium">{personalInfo.phone || user.phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No personal information submitted</p>
              )}
            </CardContent>
          </Card>

          {/* Address Information */}
          {addressInfo && Object.keys(addressInfo).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Address Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Address</label>
                      <p className="text-sm font-medium">{addressInfo.address || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">City</label>
                      <p className="text-sm font-medium">{addressInfo.city || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">State</label>
                      <p className="text-sm font-medium">{addressInfo.state || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">ZIP/Postal Code</label>
                      <p className="text-sm font-medium">{addressInfo.zip || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bank Information & Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Bank & Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(user.bank_account_number || bankInfo.accountNumber) ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Account Holder</label>
                    <p className="text-sm font-medium">{user.bank_account_holder || bankInfo.accountHolder || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Account Number</label>
                    <p className="text-sm font-medium font-mono">{user.bank_account_number || bankInfo.accountNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Bank Name</label>
                    <p className="text-sm font-medium">{user.bank_name || bankInfo.bankName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Routing/IFSC Code</label>
                    <p className="text-sm font-medium font-mono">{user.bank_routing_number || bankInfo.routing || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Account Type</label>
                    <p className="text-sm font-medium capitalize">{user.bank_account_type || bankInfo.accountType || 'N/A'}</p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No bank details submitted</p>
              )}
            </CardContent>
          </Card>

          {/* Documents */}
          {documentsInfo && (documentsInfo.frontUrl || documentsInfo.backUrl || documentsInfo.selfieUrl) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Uploaded Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {documentsInfo.frontUrl && (
                    <div className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">Front ID</h4>
                        <Button variant="ghost" size="sm" onClick={() => window.open(documentsInfo.frontUrl, '_blank')}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="aspect-video bg-muted rounded overflow-hidden">
                        <img src={documentsInfo.frontUrl} alt="Front ID" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}
                  {documentsInfo.backUrl && (
                    <div className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">Back ID</h4>
                        <Button variant="ghost" size="sm" onClick={() => window.open(documentsInfo.backUrl, '_blank')}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="aspect-video bg-muted rounded overflow-hidden">
                        <img src={documentsInfo.backUrl} alt="Back ID" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}
                  {documentsInfo.selfieUrl && (
                    <div className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">Selfie</h4>
                        <Button variant="ghost" size="sm" onClick={() => window.open(documentsInfo.selfieUrl, '_blank')}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="aspect-video bg-muted rounded overflow-hidden">
                        <img src={documentsInfo.selfieUrl} alt="Selfie" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t">
            {user.kyc_status === "pending" && (
              <>
                <Button 
                  variant="outline" 
                  className="text-destructive border-destructive hover:bg-destructive/10"
                  onClick={handleReject}
                  disabled={processing}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject KYC
                </Button>
                <Button 
                  className="bg-success hover:bg-success/90 text-white"
                  onClick={handleApprove}
                  disabled={processing}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve KYC
                </Button>
              </>
            )}
            {user.kyc_status === "verified" && (
              <Button 
                variant="outline" 
                className="text-warning border-warning hover:bg-warning/10"
                onClick={handleRequestReverification}
                disabled={processing}
              >
                Request Re-verification
              </Button>
            )}
            {user.kyc_status === "rejected" && (
              <p className="text-sm text-muted-foreground">User can resubmit KYC documents</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}