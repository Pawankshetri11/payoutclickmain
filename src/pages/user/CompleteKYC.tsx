import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Upload, FileText, Check, AlertCircle, User, Camera, CreditCard, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";

export default function CompleteKYC() {
  const { user } = useAuth();
  const { profile, refetch } = useProfile();
  const [currentStep, setCurrentStep] = useState(1);
  // Derive KYC status: treat "pending" without submission as "unverified"
  const kycStatus = (!profile?.kyc_submitted_at && profile?.kyc_status === "pending")
    ? "unverified"
    : (profile?.kyc_status || "unverified");
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    step1: { firstName: "", lastName: "", dob: "", gender: "", phone: "" },
    step2: { docType: "", frontDoc: null, backDoc: null, selfie: null, frontDocUrl: "", backDocUrl: "", selfieUrl: "" },
    step3: { address: "", city: "", state: "", zip: "", country: "", proof: null, proofUrl: "" },
    step4: { accountHolder: "", accountNumber: "", routing: "", bankName: "", accountType: "" }
  });

  // Real-time subscription for KYC status updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('kyc-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          // Refetch profile when admin updates KYC status
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, refetch]);

  const frontDocRef = useRef<HTMLInputElement>(null);
  const backDocRef = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);
  const proofDocRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File, type: string, step: number) => {
    if (!user || !file) return;

    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${type}-${Date.now()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('kyc-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('kyc-documents')
        .getPublicUrl(fileName);

      toast.success(`${type} uploaded successfully`);

      // Update formData with file URL
      if (step === 2) {
        setFormData(prev => ({
          ...prev,
          step2: {
            ...prev.step2,
            [`${type}Url`]: publicUrl,
            [type]: file
          }
        }));
      } else if (step === 3) {
        setFormData(prev => ({
          ...prev,
          step3: {
            ...prev.step3,
            proofUrl: publicUrl,
            proof: file
          }
        }));
      }

      return publicUrl;
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(`Failed to upload ${type}`);
    } finally {
      setUploading(false);
    }
  };

  const validateStep = (step: number) => {
    switch(step) {
      case 1:
        const { firstName, lastName, dob, gender, phone } = formData.step1;
        if (!firstName || !lastName || !dob || !gender || !phone) {
          toast.error("Please fill all required fields in Personal Information");
          return false;
        }
        break;
      case 2:
        const { docType, frontDoc, backDoc, selfie } = formData.step2;
        if (!docType || !frontDoc || !backDoc || !selfie) {
          toast.error("Please upload all required documents");
          return false;
        }
        break;
      case 3:
        const { address, city, state, zip, country, proof } = formData.step3;
        if (!address || !city || !state || !zip || !country || !proof) {
          toast.error("Please fill all address fields and upload proof");
          return false;
        }
        break;
      case 4:
        const { accountHolder, accountNumber, routing, bankName, accountType } = formData.step4;
        if (!accountHolder || !accountNumber || !routing || !bankName || !accountType) {
          toast.error("Please fill all bank details");
          return false;
        }
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(Math.min(4, currentStep + 1));
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(4) || !user) return;

    try {
      setUploading(true);

      // Update profile with KYC data
      const { error } = await supabase
        .from('profiles')
        .update({
          name: `${formData.step1.firstName} ${formData.step1.lastName}`,
          phone: formData.step1.phone,
          kyc_status: 'pending',
          kyc_submitted_at: new Date().toISOString(),
          kyc_data: {
            personal: formData.step1,
            documents: {
              type: formData.step2.docType,
              frontUrl: formData.step2.frontDocUrl,
              backUrl: formData.step2.backDocUrl,
              selfieUrl: formData.step2.selfieUrl
            },
            address: formData.step3,
            bank: {
              ...formData.step4,
              addedAt: new Date().toISOString()
            }
          },
          bank_account_number: formData.step4.accountNumber,
          bank_name: formData.step4.bankName,
          bank_account_type: formData.step4.accountType,
          bank_routing_number: formData.step4.routing,
          bank_account_holder: formData.step4.accountHolder
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success("KYC documents submitted for verification");
      await refetch();
    } catch (error: any) {
      console.error('KYC submission error:', error);
      toast.error("Failed to submit KYC documents");
    } finally {
      setUploading(false);
    }
  };

  const steps = [
    { id: 1, title: "Personal Information", icon: User },
    { id: 2, title: "Identity Verification", icon: Camera },
    { id: 3, title: "Address Verification", icon: FileText },
    { id: 4, title: "Bank Details", icon: CreditCard }
  ];

  return (
    <div className="container mx-auto px-3 md:px-6 py-4 md:py-8 max-w-4xl">
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-gray-900">Complete KYC Verification</h1>
            <p className="text-gray-600 mt-1 md:mt-2 text-sm md:text-base">Verify your identity to unlock all features</p>
          </div>
          <Badge 
            variant={kycStatus === "verified" ? "default" : kycStatus === "rejected" ? "destructive" : "secondary"}
            className="px-4 py-2"
          >
            {kycStatus === "verified" && <Check className="mr-2 h-4 w-4" />}
            {kycStatus === "rejected" && <AlertCircle className="mr-2 h-4 w-4" />}
            {kycStatus.charAt(0).toUpperCase() + kycStatus.slice(1)}
          </Badge>
        </div>
      </div>

      {kycStatus === "pending" && profile?.kyc_submitted_at && (
        <Card className="bg-warning/10 border-warning/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-warning" />
              <div>
                <p className="font-semibold text-warning">KYC Submitted - Pending Approval</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your documents are under review. We'll notify you once verification is complete.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {kycStatus === "verified" && (
        <Card className="bg-success/10 border-success/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <div>
                <p className="font-semibold text-success">KYC Verified ✓</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your identity has been successfully verified. You can now access all features.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {kycStatus === "rejected" && (
        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="p-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <div>
                  <p className="font-semibold text-destructive">KYC Rejected</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your KYC was rejected. Please review the rejection reason and submit again with correct documents.
                  </p>
                  {(profile as any)?.kyc_rejection_reason && (
                    <div className="mt-2 p-2 bg-destructive/5 border border-destructive/20 rounded">
                      <p className="text-sm font-medium text-destructive">Rejection Reason:</p>
                      <p className="text-sm text-muted-foreground">{(profile as any).kyc_rejection_reason}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Only show form if unverified or rejected */}
      {(kycStatus === "unverified" || kycStatus === "rejected") && (
        <>
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center">
                  <div 
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      currentStep >= step.id 
                        ? "bg-blue-600 text-white" 
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    <step.icon className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-medium mt-2 text-center">{step.title}</span>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute h-0.5 bg-gray-200 w-24 mt-6" style={{ left: `${index * 25 + 12.5}%` }} />
                  )}
                </div>
              ))}
            </div>
            <Separator className="mt-8" />
          </div>

          {/* Step Content */}
          <div className="space-y-6">
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>Provide your basic personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input 
                    id="firstName" 
                    placeholder="Enter first name" 
                    value={formData.step1.firstName}
                    onChange={(e) => setFormData({...formData, step1: {...formData.step1, firstName: e.target.value}})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input 
                    id="lastName" 
                    placeholder="Enter last name"
                    value={formData.step1.lastName}
                    onChange={(e) => setFormData({...formData, step1: {...formData.step1, lastName: e.target.value}})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth *</Label>
                  <Input 
                    id="dob" 
                    type="date"
                    value={formData.step1.dob}
                    onChange={(e) => setFormData({...formData, step1: {...formData.step1, dob: e.target.value}})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select 
                    value={formData.step1.gender}
                    onValueChange={(value) => setFormData({...formData, step1: {...formData.step1, gender: value}})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input 
                  id="phone" 
                  placeholder="Enter phone number"
                  value={formData.step1.phone}
                  onChange={(e) => setFormData({...formData, step1: {...formData.step1, phone: e.target.value}})}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Camera className="mr-2 h-5 w-5" />
                Identity Verification
              </CardTitle>
              <CardDescription>Upload your government-issued ID documents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Document Type *</Label>
                <Select 
                  value={formData.step2.docType}
                  onValueChange={(value) => setFormData({...formData, step2: {...formData.step2, docType: value}})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="passport">Passport</SelectItem>
                    <SelectItem value="license">Driver's License</SelectItem>
                    <SelectItem value="id">National ID Card</SelectItem>
                    <SelectItem value="aadhar">Aadhar Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Front Side *</Label>
                  <input
                    ref={frontDocRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'frontDoc', 2);
                    }}
                  />
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
                    onClick={() => frontDocRef.current?.click()}
                  >
                    {formData.step2.frontDocUrl ? (
                      <><CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                      <p className="mt-2 text-sm text-green-600">Uploaded</p></>
                    ) : (
                      <><Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">Click to upload front side</p></>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Back Side *</Label>
                  <input
                    ref={backDocRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'backDoc', 2);
                    }}
                  />
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
                    onClick={() => backDocRef.current?.click()}
                  >
                    {formData.step2.backDocUrl ? (
                      <><CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                      <p className="mt-2 text-sm text-green-600">Uploaded</p></>
                    ) : (
                      <><Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">Click to upload back side</p></>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Selfie with ID *</Label>
                <input
                  ref={selfieRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'selfie', 2);
                  }}
                />
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
                  onClick={() => selfieRef.current?.click()}
                >
                  {formData.step2.selfieUrl ? (
                    <><CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                    <p className="mt-2 text-sm text-green-600">Uploaded</p></>
                  ) : (
                    <><Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">Upload a selfie holding your ID</p></>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Address Verification
              </CardTitle>
              <CardDescription>Provide proof of your current address</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Full Address *</Label>
                <Textarea 
                  id="address" 
                  placeholder="Enter your complete address"
                  rows={3}
                  value={formData.step3.address}
                  onChange={(e) => setFormData({...formData, step3: {...formData.step3, address: e.target.value}})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input 
                    id="city" 
                    placeholder="Enter city"
                    value={formData.step3.city}
                    onChange={(e) => setFormData({...formData, step3: {...formData.step3, city: e.target.value}})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State/Province *</Label>
                  <Input 
                    id="state" 
                    placeholder="Enter state"
                    value={formData.step3.state}
                    onChange={(e) => setFormData({...formData, step3: {...formData.step3, state: e.target.value}})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP/Postal Code *</Label>
                  <Input 
                    id="zip" 
                    placeholder="Enter ZIP code"
                    value={formData.step3.zip}
                    onChange={(e) => setFormData({...formData, step3: {...formData.step3, zip: e.target.value}})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Select
                    value={formData.step3.country}
                    onValueChange={(value) => setFormData({...formData, step3: {...formData.step3, country: value}})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="in">India</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="ca">Canada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Address Proof Document *</Label>
                <input
                  ref={proofDocRef}
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'proof', 3);
                  }}
                />
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
                  onClick={() => proofDocRef.current?.click()}
                >
                  {formData.step3.proofUrl ? (
                    <><CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                    <p className="mt-2 text-sm text-green-600">Uploaded</p></>
                  ) : (
                    <><Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">Upload utility bill, bank statement, or lease agreement</p></>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Bank Details
              </CardTitle>
              <CardDescription>Add your bank account for withdrawals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accountHolder">Account Holder Name *</Label>
                <Input 
                  id="accountHolder" 
                  placeholder="Enter account holder name"
                  value={formData.step4.accountHolder}
                  onChange={(e) => setFormData({...formData, step4: {...formData.step4, accountHolder: e.target.value}})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number *</Label>
                <Input 
                  id="accountNumber" 
                  placeholder="Enter account number"
                  value={formData.step4.accountNumber}
                  onChange={(e) => setFormData({...formData, step4: {...formData.step4, accountNumber: e.target.value}})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="routingNumber">Routing Number / IFSC Code *</Label>
                <Input 
                  id="routingNumber" 
                  placeholder="Enter routing/IFSC code"
                  value={formData.step4.routing}
                  onChange={(e) => setFormData({...formData, step4: {...formData.step4, routing: e.target.value}})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name *</Label>
                <Input 
                  id="bankName" 
                  placeholder="Enter bank name"
                  value={formData.step4.bankName}
                  onChange={(e) => setFormData({...formData, step4: {...formData.step4, bankName: e.target.value}})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountType">Account Type *</Label>
                <Select
                  value={formData.step4.accountType}
                  onValueChange={(value) => setFormData({...formData, step4: {...formData.step4, accountType: value}})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="savings">Savings</SelectItem>
                    <SelectItem value="current">Current</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Navigation Buttons - Only show when form is visible */}
      {(kycStatus === "unverified" || kycStatus === "rejected") && (
        <div className="flex justify-between mt-8">
          <Button 
            variant="outline" 
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            Previous
          </Button>
          
          {currentStep < 4 ? (
            <Button 
              onClick={handleNext}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Next'}
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              className="bg-green-600 hover:bg-green-700"
              disabled={uploading}
            >
              {uploading ? 'Submitting...' : 'Submit KYC'}
            </Button>
          )}
        </div>
      )}
        </>
      )}
    </div>
  );
}