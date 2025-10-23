import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { CheckCircle, UserPlus, Briefcase, DollarSign, TrendingUp } from "lucide-react";
import { LandingHeader } from "@/components/layout/LandingHeader";
import { LandingFooter } from "@/components/layout/LandingFooter";
import { Button } from "@/components/ui/button";

export default function HowItWorks() {
  const steps = [
    {
      icon: <UserPlus className="h-10 w-10 text-primary" />,
      title: "Sign Up",
      description: "Create your free account in seconds. No credit card required."
    },
    {
      icon: <Briefcase className="h-10 w-10 text-primary" />,
      title: "Browse Tasks",
      description: "Explore available tasks and jobs that match your skills and interests."
    },
    {
      icon: <CheckCircle className="h-10 w-10 text-primary" />,
      title: "Complete Tasks",
      description: "Follow simple instructions to complete tasks and submit your work."
    },
    {
      icon: <DollarSign className="h-10 w-10 text-primary" />,
      title: "Get Paid",
      description: "Earn money for every completed task and withdraw your earnings."
    }
  ];

  const features = [
    "Simple and easy-to-complete tasks",
    "Flexible working hours",
    "No experience required",
    "Instant task approval",
    "Multiple withdrawal methods",
    "24/7 support available"
  ];

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            How It <span className="bg-gradient-primary bg-clip-text text-transparent">Works</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start earning money in 4 simple steps. Join thousands of users who are already making money online.
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <Card key={index} className="bg-gradient-card border-border/50 shadow-elegant hover:shadow-glow transition-all">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-primary/10 rounded-full">
                      {step.icon}
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-primary mb-2">{index + 1}</div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Why Choose Us?</h2>
              <p className="text-xl text-muted-foreground">
                Everything you need to start earning money online
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-card rounded-lg shadow-sm">
                  <TrendingUp className="h-6 w-6 text-primary flex-shrink-0" />
                  <span className="text-lg">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join our platform today and start earning money by completing simple tasks.
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
