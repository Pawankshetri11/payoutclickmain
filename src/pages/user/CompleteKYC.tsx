import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Upload, FileText, Check, AlertCircle, User, Camera, CreditCard } from "lucide-react";
import { toast } from "sonner";

export default function CompleteKYC() {
  const [currentStep, setCurrentStep] = useState(1);
  const [kycStatus, setKycStatus] = useState<"pending" | "verified" | "rejected">("pending");
  const [formData, setFormData] = useState({
    step1: { firstName: "", lastName: "", dob: "", gender: "", phone: "" },
    step2: { docType: "", frontDoc: null, backDoc: null, selfie: null },
    step3: { address: "", city: "", state: "", zip: "", country: "", proof: null },
    step4: { accountHolder: "", accountNumber: "", routing: "", bankName: "", accountType: "" }
  });

  const handleFileUpload = (type: string) => {
    // Dummy file upload
    toast.success(`${type} uploaded successfully`);
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

  const handleSubmit = () => {
    if (validateStep(4)) {
      setKycStatus("pending");
      toast.success("KYC documents submitted for verification");
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
                <Label>Document Type</Label>
                <Select>
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
                  <Label>Front Side</Label>
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
                    onClick={() => handleFileUpload("ID Front")}
                  >
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">Click to upload front side</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Back Side</Label>
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
                    onClick={() => handleFileUpload("ID Back")}
                  >
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">Click to upload back side</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Selfie with ID</Label>
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
                  onClick={() => handleFileUpload("Selfie with ID")}
                >
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">Upload a selfie holding your ID</p>
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
                <Label htmlFor="address">Full Address</Label>
                <Textarea 
                  id="address" 
                  placeholder="Enter your complete address"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" placeholder="Enter city" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input id="state" placeholder="Enter state" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP/Postal Code</Label>
                  <Input id="zip" placeholder="Enter ZIP code" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select>
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
                <Label>Address Proof Document</Label>
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
                  onClick={() => handleFileUpload("Address Proof")}
                >
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">Upload utility bill, bank statement, or lease agreement</p>
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
                <Label htmlFor="accountHolder">Account Holder Name</Label>
                <Input id="accountHolder" placeholder="Enter account holder name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input id="accountNumber" placeholder="Enter account number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="routingNumber">Routing Number / IFSC Code</Label>
                <Input id="routingNumber" placeholder="Enter routing/IFSC code" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input id="bankName" placeholder="Enter bank name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountType">Account Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="savings">Savings</SelectItem>
                    <SelectItem value="checking">Checking</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Navigation Buttons */}
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
          >
            Next
          </Button>
        ) : (
          <Button 
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700"
          >
            Submit KYC
          </Button>
        )}
      </div>
    </div>
  );
}