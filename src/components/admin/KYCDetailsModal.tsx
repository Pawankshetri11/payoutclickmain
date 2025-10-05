import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
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

  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

  useEffect(() => {
    if (user?.user_id) {
      fetchPaymentMethods();
    }
  }, [user?.user_id]);

  const fetchPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_methods' as any)
        .select('*')
        .eq('user_id', user.user_id)
        .order('is_default', { ascending: false });

      if (error) throw error;
      setPaymentMethods(data || []);
    } catch (error: any) {
      console.error('Error fetching payment methods:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>KYC Details - {user.name}</DialogTitle>
        </DialogHeader>

        {!hasKycData ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No KYC data submitted yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* User Info */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">User Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Name:</span>
                  <p className="font-medium">{user.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  {getKycStatusBadge(user.kyc_status)}
                </div>
                <div>
                  <span className="text-muted-foreground">Submitted:</span>
                  <p className="font-medium">
                    {user.kyc_submitted_at ? new Date(user.kyc_submitted_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Personal Details */}
            {kycData?.personal && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Personal Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">First Name:</span>
                    <p className="font-medium">{kycData.personal.firstName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Name:</span>
                    <p className="font-medium">{kycData.personal.lastName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date of Birth:</span>
                    <p className="font-medium">{kycData.personal.dob}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Gender:</span>
                    <p className="font-medium capitalize">{kycData.personal.gender}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span>
                    <p className="font-medium">{kycData.personal.phone}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Address */}
            {kycData?.address && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Address</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Address:</span>
                    <p className="font-medium">{kycData.address.address}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">City:</span>
                    <p className="font-medium">{kycData.address.city}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">State:</span>
                    <p className="font-medium">{kycData.address.state}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">ZIP:</span>
                    <p className="font-medium">{kycData.address.zip}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Country:</span>
                    <p className="font-medium uppercase">{kycData.address.country}</p>
                  </div>
                </div>
                {kycData.address.proofUrl && (
                  <div className="mt-2">
                    <span className="text-muted-foreground text-sm">Address Proof:</span>
                    <div className="mt-2">
                      <img 
                        src={kycData.address.proofUrl} 
                        alt="Address Proof" 
                        className="max-w-xs rounded border cursor-pointer hover:opacity-80"
                        onClick={() => window.open(kycData.address.proofUrl, '_blank')}
                      />
                      <Button
                        variant="link"
                        size="sm"
                        className="mt-2"
                        onClick={() => window.open(kycData.address.proofUrl, '_blank')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Documents */}
            {kycData?.documents && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Uploaded Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {kycData.documents.frontUrl && (
                    <div>
                      <span className="text-muted-foreground text-sm">Front Document</span>
                      <div className="mt-2">
                        <img 
                          src={kycData.documents.frontUrl} 
                          alt="Front Document" 
                          className="w-full rounded border cursor-pointer hover:opacity-80"
                          onClick={() => window.open(kycData.documents.frontUrl, '_blank')}
                        />
                        <Button
                          variant="link"
                          size="sm"
                          className="mt-2"
                          onClick={() => window.open(kycData.documents.frontUrl, '_blank')}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  )}
                  {kycData.documents.backUrl && (
                    <div>
                      <span className="text-muted-foreground text-sm">Back Document</span>
                      <div className="mt-2">
                        <img 
                          src={kycData.documents.backUrl} 
                          alt="Back Document" 
                          className="w-full rounded border cursor-pointer hover:opacity-80"
                          onClick={() => window.open(kycData.documents.backUrl, '_blank')}
                        />
                        <Button
                          variant="link"
                          size="sm"
                          className="mt-2"
                          onClick={() => window.open(kycData.documents.backUrl, '_blank')}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  )}
                  {kycData.documents.selfieUrl && (
                    <div>
                      <span className="text-muted-foreground text-sm">Selfie</span>
                      <div className="mt-2">
                        <img 
                          src={kycData.documents.selfieUrl} 
                          alt="Selfie" 
                          className="w-full rounded border cursor-pointer hover:opacity-80"
                          onClick={() => window.open(kycData.documents.selfieUrl, '_blank')}
                        />
                        <Button
                          variant="link"
                          size="sm"
                          className="mt-2"
                          onClick={() => window.open(kycData.documents.selfieUrl, '_blank')}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payment Methods */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Withdrawal Methods</h3>
              {paymentMethods.length > 0 ? (
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <Card key={method.id} className={method.is_default ? 'border-primary' : ''}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant={method.is_default ? 'default' : 'secondary'}>
                            {method.is_default && '⭐ '}
                            {method.method_type.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {method.method_type === 'bank' && (
                            <>
                              <div>
                                <span className="text-muted-foreground">Bank:</span>
                                <p className="font-medium">{method.bank_name}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Account Holder:</span>
                                <p className="font-medium">{method.account_holder}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Account Number:</span>
                                <p className="font-medium">{method.account_number}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Routing:</span>
                                <p className="font-medium">{method.routing_number}</p>
                              </div>
                            </>
                          )}
                          {method.method_type === 'upi' && (
                            <div>
                              <span className="text-muted-foreground">UPI ID:</span>
                              <p className="font-medium">{method.upi_id}</p>
                            </div>
                          )}
                          {method.method_type === 'paypal' && (
                            <div>
                              <span className="text-muted-foreground">PayPal Email:</span>
                              <p className="font-medium">{method.paypal_email}</p>
                            </div>
                          )}
                          {method.method_type === 'crypto' && (
                            <>
                              <div>
                                <span className="text-muted-foreground">Wallet Address:</span>
                                <p className="font-medium break-all">{method.crypto_wallet_address}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Network:</span>
                                <p className="font-medium">{method.crypto_network}</p>
                              </div>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No payment methods added yet</p>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 flex-wrap">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button 
            variant="outline" 
            onClick={handleRequestReverification} 
            disabled={processing}
          >
            Request Re-verification
          </Button>
          <Button 
            variant="destructive"
            onClick={handleReject}
            disabled={processing}
          >
            Reject
          </Button>
          <Button
            onClick={handleApprove}
            disabled={processing}
            className="bg-success hover:bg-success/90"
          >
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}