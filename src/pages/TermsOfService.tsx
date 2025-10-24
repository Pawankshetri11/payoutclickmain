import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import { LandingHeader } from "@/components/layout/LandingHeader";
import { LandingFooter } from "@/components/layout/LandingFooter";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4 text-center">
          <FileText className="h-20 w-20 mx-auto mb-6 text-primary" />
          <h1 className="text-5xl font-bold mb-6">
            Terms of <span className="bg-gradient-primary bg-clip-text text-transparent">Service</span>
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
                <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing and using TaskHub, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not use our services.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">2. User Accounts</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  When you create an account with us, you must provide accurate, complete, and current information. You are responsible for:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Maintaining the confidentiality of your account credentials</li>
                  <li>All activities that occur under your account</li>
                  <li>Notifying us immediately of any unauthorized use</li>
                  <li>Ensuring you meet the minimum age requirement (18 years)</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">3. Task Completion and Payment</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  Users agree to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Complete tasks honestly and according to provided instructions</li>
                  <li>Submit original work that meets quality standards</li>
                  <li>Not engage in fraudulent or deceptive activities</li>
                  <li>Accept that payments are processed according to our payment schedule</li>
                  <li>Understand that tasks may be reviewed and rejected if they don't meet requirements</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">4. Prohibited Activities</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  You may not:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Create multiple accounts to exploit referral programs</li>
                  <li>Use automated tools or bots to complete tasks</li>
                  <li>Submit false or misleading information</li>
                  <li>Attempt to manipulate or game the system</li>
                  <li>Engage in any activity that violates laws or regulations</li>
                  <li>Harass or harm other users or staff members</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">5. Intellectual Property</h2>
                <p className="text-muted-foreground leading-relaxed">
                  All content, features, and functionality on TaskHub are owned by us and are protected by international copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">6. Termination</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to terminate or suspend your account immediately, without prior notice or liability, for any reason, including if you breach these Terms of Service. Upon termination, your right to use the service will immediately cease.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">7. Limitation of Liability</h2>
                <p className="text-muted-foreground leading-relaxed">
                  TaskHub shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service. We do not guarantee uninterrupted or error-free service.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">8. Changes to Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to modify these terms at any time. We will notify users of any changes by updating the "Last updated" date. Your continued use of the service after changes constitutes acceptance of the new terms.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">9. Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have any questions about these Terms of Service, please contact us at:
                  <br />
                  <a href="mailto:legal@taskhub.com" className="text-primary hover:underline">legal@taskhub.com</a>
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
