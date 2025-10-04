import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreditCard, Plus, Edit, Trash2, Landmark, Wallet, Smartphone, Globe } from "lucide-react";
import { toast } from "sonner";

export default function WithdrawalMethods() {
  const [methods, setMethods] = useState([
    {
      id: 1,
      type: "bank",
      name: "Chase Bank Account",
      details: "****1234",
      isDefault: true,
      verified: true
    },
    {
      id: 2,
      type: "paypal",
      name: "PayPal Account",
      details: "john@example.com",
      isDefault: false,
      verified: true
    },
    {
      id: 3,
      type: "crypto",
      name: "Bitcoin Wallet",
      details: "1A1z...x9B2",
      isDefault: false,
      verified: false
    }
  ]);

  const [isAddingMethod, setIsAddingMethod] = useState(false);
  const [selectedType, setSelectedType] = useState("");

  const getMethodIcon = (type: string) => {
    switch (type) {
      case "bank": return Landmark;
      case "paypal": return Wallet;
      case "crypto": return CreditCard;
      case "mobile": return Smartphone;
      default: return Globe;
    }
  };

  const handleAddMethod = () => {
    // Dummy add method
    const newMethod = {
      id: Date.now(),
      type: selectedType,
      name: `New ${selectedType} Method`,
      details: "****0000",
      isDefault: false,
      verified: false
    };
    setMethods([...methods, newMethod]);
    setIsAddingMethod(false);
    toast.success("Withdrawal method added successfully");
  };

  const handleSetDefault = (id: number) => {
    setMethods(methods.map(method => ({
      ...method,
      isDefault: method.id === id
    })));
    toast.success("Default withdrawal method updated");
  };

  const handleDelete = (id: number) => {
    setMethods(methods.filter(method => method.id !== id));
    toast.success("Withdrawal method removed");
  };

  return (
    <div className="container mx-auto px-3 md:px-6 py-4 md:py-8 max-w-4xl">
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Withdrawal Methods</h1>
            <p className="text-gray-600 mt-1 md:mt-2 text-sm md:text-base">Manage your withdrawal methods and preferences</p>
          </div>
          <Dialog open={isAddingMethod} onOpenChange={setIsAddingMethod}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Add Method
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Withdrawal Method</DialogTitle>
                <DialogDescription>
                  Choose a withdrawal method to add to your account
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="methodType">Method Type</Label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select withdrawal method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank">Bank Account</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="crypto">Cryptocurrency</SelectItem>
                      <SelectItem value="mobile">Mobile Wallet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedType === "bank" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="accountNumber">Account Number</Label>
                      <Input id="accountNumber" placeholder="Enter account number" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="routingNumber">Routing Number</Label>
                      <Input id="routingNumber" placeholder="Enter routing number" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bankName">Bank Name</Label>
                      <Input id="bankName" placeholder="Enter bank name" />
                    </div>
                  </>
                )}
                
                {selectedType === "paypal" && (
                  <div className="space-y-2">
                    <Label htmlFor="paypalEmail">PayPal Email</Label>
                    <Input id="paypalEmail" type="email" placeholder="Enter PayPal email" />
                  </div>
                )}
                
                {selectedType === "crypto" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="cryptoType">Cryptocurrency</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select cryptocurrency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bitcoin">Bitcoin (BTC)</SelectItem>
                          <SelectItem value="ethereum">Ethereum (ETH)</SelectItem>
                          <SelectItem value="usdt">Tether (USDT)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="walletAddress">Wallet Address</Label>
                      <Input id="walletAddress" placeholder="Enter wallet address" />
                    </div>
                  </>
                )}
                
                {selectedType === "mobile" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="mobileProvider">Mobile Wallet</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select mobile wallet" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="paytm">Paytm</SelectItem>
                          <SelectItem value="googlepay">Google Pay</SelectItem>
                          <SelectItem value="phonepe">PhonePe</SelectItem>
                          <SelectItem value="amazonpay">Amazon Pay</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mobileNumber">Mobile Number</Label>
                      <Input id="mobileNumber" placeholder="Enter mobile number" />
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddingMethod(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddMethod} disabled={!selectedType}>
                  Add Method
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-4">
        {methods.map((method) => {
          const IconComponent = getMethodIcon(method.type);
          return (
            <Card key={method.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <IconComponent className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{method.name}</CardTitle>
                      <CardDescription className="text-gray-600">
                        {method.details}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {method.isDefault && (
                      <Badge className="bg-green-100 text-green-800">Default</Badge>
                    )}
                    <Badge 
                      variant={method.verified ? "default" : "secondary"}
                      className={method.verified ? "bg-blue-100 text-blue-800" : ""}
                    >
                      {method.verified ? "Verified" : "Pending"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Added on March 15, 2024
                  </div>
                  <div className="flex space-x-2">
                    {!method.isDefault && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSetDefault(method.id)}
                      >
                        Set as Default
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(method.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Separator className="my-8" />

      <Card>
        <CardHeader>
          <CardTitle>Withdrawal Settings</CardTitle>
          <CardDescription>Configure your withdrawal preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minWithdrawal">Minimum Withdrawal Amount</Label>
              <Input id="minWithdrawal" value="$10.00" disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxWithdrawal">Maximum Withdrawal Amount</Label>
              <Input id="maxWithdrawal" value="$5,000.00" disabled />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="processingTime">Processing Time</Label>
            <Input id="processingTime" value="1-3 business days" disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="withdrawalFee">Withdrawal Fee</Label>
            <Input id="withdrawalFee" value="2.5% or $2.50 minimum" disabled />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}