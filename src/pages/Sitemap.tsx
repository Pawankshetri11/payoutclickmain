import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Map, Home, Info, Briefcase, DollarSign, Mail, FileText, Shield } from "lucide-react";
import { LandingHeader } from "@/components/layout/LandingHeader";
import { LandingFooter } from "@/components/layout/LandingFooter";

export default function Sitemap() {
  const sections = [
    {
      title: "Main Pages",
      icon: <Home className="h-5 w-5" />,
      links: [
        { name: "Home", path: "/" },
        { name: "How It Works", path: "/how-it-works" },
        { name: "Earnings Info", path: "/earnings-info" },
        { name: "About Us", path: "/about" },
        { name: "Contact", path: "/contact" }
      ]
    },
    {
      title: "User Area",
      icon: <Briefcase className="h-5 w-5" />,
      links: [
        { name: "Login", path: "/auth" },
        { name: "Sign Up", path: "/auth" },
        { name: "Dashboard", path: "/user" },
        { name: "Tasks", path: "/user/tasks" },
        { name: "My Tasks", path: "/user/my-tasks" },
        { name: "Earnings", path: "/user/earnings" },
        { name: "Profile", path: "/user/profile" },
        { name: "Referrals", path: "/user/referrals" },
        { name: "Support", path: "/user/support" }
      ]
    },
    {
      title: "Admin Area",
      icon: <Shield className="h-5 w-5" />,
      links: [
        { name: "Admin Login", path: "/admin-login" },
        { name: "Admin Dashboard", path: "/admin" },
        { name: "Manage Users", path: "/admin/users" },
        { name: "Manage Jobs", path: "/admin/jobs" },
        { name: "Review Profiles", path: "/admin/review-profiles" },
        { name: "Withdrawals", path: "/admin/withdrawals" },
        { name: "Settings", path: "/admin/settings" }
      ]
    },
    {
      title: "Legal",
      icon: <FileText className="h-5 w-5" />,
      links: [
        { name: "Terms of Service", path: "/terms-of-service" },
        { name: "Privacy Policy", path: "/privacy-policy" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4 text-center">
          <Map className="h-20 w-20 mx-auto mb-6 text-primary" />
          <h1 className="text-5xl font-bold mb-6">
            Site <span className="bg-gradient-primary bg-clip-text text-transparent">Map</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Navigate through all pages and features of TaskHub
          </p>
        </div>
      </section>

      {/* Sitemap Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {sections.map((section, index) => (
              <Card key={index} className="bg-gradient-card border-border/50 shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {section.icon}
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {section.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <Link
                          to={link.path}
                          className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                        >
                          <span className="text-primary">→</span>
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join TaskHub today and start earning money by completing simple tasks.
          </p>
          <Link to="/auth">
            <Button size="lg" className="bg-gradient-primary text-lg px-8 py-6">
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
