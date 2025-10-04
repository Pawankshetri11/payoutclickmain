import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Save, Eye, Plus, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";

export default function ContentEditor() {
  const [selectedPage, setSelectedPage] = useState("footer");
  const [isPublished, setIsPublished] = useState(true);

  // Mock page content data
  const [pages, setPages] = useState<{
    footer: {
      title: string;
      sections: {
        companyName: string;
        tagline: string;
        description: string;
        email: string;
        phone: string;
        address: string;
        socialLinks: {
          facebook: string;
          twitter: string;
          instagram: string;
          linkedin: string;
        };
      };
    };
    terms: { title: string; content: string; lastModified: string };
    privacy: { title: string; content: string; lastModified: string };
    refund: { title: string; content: string; lastModified: string };
    about: { title: string; content: string; lastModified: string };
  }>({
    footer: {
      title: "Footer Content",
      sections: {
        companyName: "TaskHub",
        tagline: "Your trusted partner for earning online",
        description: "Complete micro-tasks and earn money from anywhere. Join thousands of users already earning with TaskHub.",
        email: "support@taskhub.com",
        phone: "+91 98765 43210",
        address: "123 Business Park, Mumbai, India",
        socialLinks: {
          facebook: "https://facebook.com/taskhub",
          twitter: "https://twitter.com/taskhub",
          instagram: "https://instagram.com/taskhub",
          linkedin: "https://linkedin.com/company/taskhub"
        }
      }
    },
    terms: {
      title: "Terms & Conditions",
      content: `Last Updated: January 2025

1. ACCEPTANCE OF TERMS
By accessing and using TaskHub, you accept and agree to be bound by these Terms and Conditions.

2. USER ELIGIBILITY
- You must be at least 18 years old
- You must provide accurate information
- One account per person

3. TASK COMPLETION
- Complete tasks honestly and accurately
- Submit genuine proof of completion
- Follow task requirements carefully

4. PAYMENTS & WITHDRAWALS
- Minimum withdrawal: ₹100
- Processing time: 1-5 business days
- 10% platform fee applies
- Account must be verified

5. PROHIBITED ACTIVITIES
- Creating multiple accounts
- Submitting false information
- Sharing account credentials
- Automated task completion

6. ACCOUNT TERMINATION
We reserve the right to terminate accounts that violate these terms.

7. CHANGES TO TERMS
We may update these terms at any time. Continued use constitutes acceptance.`,
      lastModified: "2025-01-01"
    },
    privacy: {
      title: "Privacy Policy",
      content: `Last Updated: January 2025

1. INFORMATION WE COLLECT
- Personal information (name, email, phone)
- Payment information
- Task completion data
- Device and usage information

2. HOW WE USE YOUR INFORMATION
- To process payments
- To verify your identity
- To improve our services
- To communicate with you

3. DATA SECURITY
We implement industry-standard security measures to protect your data.

4. DATA SHARING
We do not sell your personal information. We may share data with:
- Payment processors
- Service providers
- Law enforcement (when required)

5. YOUR RIGHTS
- Access your data
- Request data deletion
- Opt-out of marketing
- Update your information

6. COOKIES
We use cookies to enhance your experience and analyze usage.

7. CONTACT US
For privacy concerns, email: privacy@taskhub.com`,
      lastModified: "2025-01-01"
    },
    refund: {
      title: "Refund Policy",
      content: `Last Updated: January 2025

1. WITHDRAWAL REFUNDS
- Withdrawals are final once processed
- Failed withdrawals will be credited back to your account
- Processing time: 24-48 hours for refunds

2. TASK REJECTIONS
- Rejected tasks are not eligible for payment
- You may resubmit corrected work
- Appeal decisions within 7 days

3. ACCOUNT BALANCE
- Unused balance remains in your account
- No refunds for account balance
- Transfer to withdrawal methods only

4. TECHNICAL ISSUES
- System errors will be investigated
- Legitimate issues will be compensated
- Report issues within 24 hours

5. DISPUTE RESOLUTION
Contact support@taskhub.com for disputes.

6. NO CASH REFUNDS
All transactions are digital and non-refundable to cash.`,
      lastModified: "2025-01-01"
    },
    about: {
      title: "About Us",
      content: `Welcome to TaskHub!

OUR MISSION
TaskHub is a revolutionary platform connecting individuals with micro-tasks and earning opportunities. We believe in empowering people to earn money flexibly and conveniently.

OUR STORY
Founded in 2024, TaskHub has grown to serve thousands of users across India. We've processed over ₹10 million in payments and helped countless individuals supplement their income.

WHAT WE DO
We partner with businesses and organizations that need tasks completed:
- Data entry and verification
- App testing and reviews
- Survey completion
- Social media engagement
- Content moderation

WHY CHOOSE US
✓ Verified Tasks: All tasks are verified and legitimate
✓ Quick Payments: Fast and secure payment processing
✓ 24/7 Support: Round-the-clock customer support
✓ User-Friendly: Simple and intuitive platform
✓ Fair Pricing: Competitive rates for all tasks

OUR VALUES
- Transparency
- Integrity
- User satisfaction
- Innovation
- Trust

JOIN US TODAY
Start your earning journey with TaskHub and be part of our growing community!`,
      lastModified: "2025-01-01"
    }
  });

  const handleSaveContent = () => {
    // In real implementation, save to database
    toast.success("Content saved successfully!");
  };

  const handlePublishToggle = () => {
    setIsPublished(!isPublished);
    toast.success(isPublished ? "Page unpublished" : "Page published");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            Content Editor
          </h1>
          <p className="text-muted-foreground">Manage frontend pages and content</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.open("/", "_blank")}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSaveContent} className="bg-gradient-primary hover:opacity-90">
            <Save className="h-4 w-4 mr-2" />
            Save All Changes
          </Button>
        </div>
      </div>

      {/* Page Selector */}
      <Card className="bg-gradient-card border-border/50 shadow-elegant">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Select Page to Edit</CardTitle>
              <CardDescription>Choose which page you want to modify</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="published">Published</Label>
              <Switch
                id="published"
                checked={isPublished}
                onCheckedChange={handlePublishToggle}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Select value={selectedPage} onValueChange={setSelectedPage}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="footer">Footer Content</SelectItem>
              <SelectItem value="terms">Terms & Conditions</SelectItem>
              <SelectItem value="privacy">Privacy Policy</SelectItem>
              <SelectItem value="refund">Refund Policy</SelectItem>
              <SelectItem value="about">About Us</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Content Editor */}
      <Card className="bg-gradient-card border-border/50 shadow-elegant">
        <CardContent className="pt-6">
          <Tabs value={selectedPage} onValueChange={setSelectedPage}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="footer">Footer</TabsTrigger>
              <TabsTrigger value="terms">Terms</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
              <TabsTrigger value="refund">Refund</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
            </TabsList>

            <TabsContent value="footer" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Company Information</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input
                      id="company-name"
                      value={pages.footer.sections.companyName}
                      onChange={(e) => setPages({
                        ...pages,
                        footer: {
                          ...pages.footer,
                          sections: { ...pages.footer.sections, companyName: e.target.value }
                        }
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tagline">Tagline</Label>
                    <Input
                      id="tagline"
                      value={pages.footer.sections.tagline}
                      onChange={(e) => setPages({
                        ...pages,
                        footer: {
                          ...pages.footer,
                          sections: { ...pages.footer.sections, tagline: e.target.value }
                        }
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      rows={4}
                      value={pages.footer.sections.description}
                      onChange={(e) => setPages({
                        ...pages,
                        footer: {
                          ...pages.footer,
                          sections: { ...pages.footer.sections, description: e.target.value }
                        }
                      })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Contact Information</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={pages.footer.sections.email}
                      onChange={(e) => setPages({
                        ...pages,
                        footer: {
                          ...pages.footer,
                          sections: { ...pages.footer.sections, email: e.target.value }
                        }
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={pages.footer.sections.phone}
                      onChange={(e) => setPages({
                        ...pages,
                        footer: {
                          ...pages.footer,
                          sections: { ...pages.footer.sections, phone: e.target.value }
                        }
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      rows={3}
                      value={pages.footer.sections.address}
                      onChange={(e) => setPages({
                        ...pages,
                        footer: {
                          ...pages.footer,
                          sections: { ...pages.footer.sections, address: e.target.value }
                        }
                      })}
                    />
                  </div>

                  <h3 className="text-lg font-semibold pt-4">Social Media Links</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input id="facebook" value={pages.footer.sections.socialLinks.facebook} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input id="twitter" value={pages.footer.sections.socialLinks.twitter} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input id="instagram" value={pages.footer.sections.socialLinks.instagram} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input id="linkedin" value={pages.footer.sections.socialLinks.linkedin} />
                  </div>
                </div>
              </div>
            </TabsContent>

            {["terms", "privacy", "refund", "about"].map((pageKey) => {
              const typedPageKey = pageKey as "terms" | "privacy" | "refund" | "about";
              return (
                <TabsContent key={pageKey} value={pageKey} className="space-y-6 mt-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`${pageKey}-title`}>Page Title</Label>
                      <Input
                        id={`${pageKey}-title`}
                        value={pages[typedPageKey].title}
                        onChange={(e) => setPages({
                          ...pages,
                          [pageKey]: { ...pages[typedPageKey], title: e.target.value }
                        })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`${pageKey}-content`}>Content</Label>
                      <Textarea
                        id={`${pageKey}-content`}
                        rows={20}
                        className="font-mono text-sm"
                        value={pages[typedPageKey].content}
                        onChange={(e) => setPages({
                          ...pages,
                          [pageKey]: { ...pages[typedPageKey], content: e.target.value }
                        })}
                      />
                    </div>

                    <div className="text-sm text-muted-foreground">
                      Last modified: {pages[typedPageKey].lastModified}
                    </div>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
