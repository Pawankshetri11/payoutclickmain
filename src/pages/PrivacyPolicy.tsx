import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Shield } from "lucide-react";
import { LandingHeader } from "@/components/layout/LandingHeader";
import { LandingFooter } from "@/components/layout/LandingFooter";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4 text-center">
          <Shield className="h-20 w-20 mx-auto mb-6 text-primary" />
          <h1 className="text-5xl font-bold mb-6">
            Privacy <span className="bg-gradient-primary bg-clip-text text-transparent">Policy</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Last updated: January 2025
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto bg-gradient-card border-border/50 shadow-elegant">
            <CardContent className="p-8 md:p-12 space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  We collect several types of information to provide and improve our services:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li><strong>Personal Information:</strong> Name, email address, phone number, and payment details</li>
                  <li><strong>Account Information:</strong> Username, password, and profile details</li>
                  <li><strong>Usage Data:</strong> Tasks completed, earnings, and activity logs</li>
                  <li><strong>Technical Data:</strong> IP address, browser type, device information</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">2. How We Use Your Information</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  We use the collected information for various purposes:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>To provide and maintain our service</li>
                  <li>To process payments and transactions</li>
                  <li>To notify you about changes to our service</li>
                  <li>To provide customer support</li>
                  <li>To detect and prevent fraud or abuse</li>
                  <li>To improve and optimize our platform</li>
                  <li>To send promotional communications (with your consent)</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">3. Information Sharing and Disclosure</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  We do not sell your personal information. We may share your information in the following situations:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li><strong>Service Providers:</strong> Third-party companies that help us operate our platform</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                  <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                  <li><strong>With Your Consent:</strong> When you explicitly authorize us to share information</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">4. Data Security</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. These include encryption, secure servers, and regular security audits. However, no method of transmission over the internet is 100% secure.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">5. Your Data Rights</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  You have the following rights regarding your personal data:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li><strong>Access:</strong> Request copies of your personal data</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate data</li>
                  <li><strong>Deletion:</strong> Request deletion of your data</li>
                  <li><strong>Restriction:</strong> Request restriction of processing</li>
                  <li><strong>Portability:</strong> Request transfer of your data</li>
                  <li><strong>Objection:</strong> Object to processing of your data</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">6. Cookies and Tracking</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We use cookies and similar tracking technologies to track activity on our service and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our service.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">7. Children's Privacy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Our service is not intended for anyone under the age of 18. We do not knowingly collect personal information from children under 18. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">8. Changes to This Privacy Policy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">9. Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have any questions about this Privacy Policy, please contact us at:
                  <br />
                  <a href="mailto:privacy@taskhub.com" className="text-primary hover:underline">privacy@taskhub.com</a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
