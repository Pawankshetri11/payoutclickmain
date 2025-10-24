import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { DollarSign, TrendingUp, Wallet, Award, Clock, Users, Briefcase } from "lucide-react";
import { LandingHeader } from "@/components/layout/LandingHeader";
import { LandingFooter } from "@/components/layout/LandingFooter";

export default function EarningsInfo() {
  const earningMethods = [
    {
      icon: <Briefcase className="h-10 w-10" />,
      title: "Complete Tasks",
      description: "Earn money by completing simple tasks like reviews, surveys, and data entry.",
      earning: "$5 - $50 per task"
    },
    {
      icon: <Users className="h-10 w-10" />,
      title: "Refer Friends",
      description: "Get rewarded when your friends sign up and complete their first task.",
      earning: "$10 per referral"
    },
    {
      icon: <Award className="h-10 w-10" />,
      title: "Bonus Tasks",
      description: "Special high-paying tasks available for top performers.",
      earning: "$100+ per task"
    }
  ];

  const withdrawalMethods = [
    { name: "Bank Transfer", time: "1-2 business days", fee: "Free" },
    { name: "PayPal", time: "Instant", fee: "2%" },
    { name: "UPI", time: "Instant", fee: "Free" },
    { name: "Cryptocurrency", time: "1 hour", fee: "Network fee" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4 text-center">
          <DollarSign className="h-20 w-20 mx-auto mb-6 text-primary" />
          <h1 className="text-5xl font-bold mb-6">
            Start <span className="bg-gradient-primary bg-clip-text text-transparent">Earning</span> Today
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Multiple ways to earn money online. Flexible hours. Instant withdrawals.
          </p>
        </div>
      </section>

      {/* Earning Methods */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">How to Earn</h2>
            <p className="text-xl text-muted-foreground">Choose your preferred way to make money</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {earningMethods.map((method, index) => (
              <Card key={index} className="bg-gradient-card border-border/50 shadow-elegant hover:shadow-glow transition-all">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-primary/10 rounded-full text-primary">
                      {method.icon}
                    </div>
                  </div>
                  <CardTitle className="text-center">{method.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground mb-4">{method.description}</p>
                  <div className="text-2xl font-bold text-primary">{method.earning}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <Card className="bg-gradient-card border-border/50 text-center">
              <CardContent className="p-6">
                <TrendingUp className="h-10 w-10 mx-auto mb-3 text-primary" />
                <div className="text-3xl font-bold text-primary mb-2">$500K+</div>
                <p className="text-muted-foreground">Total Paid Out</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-card border-border/50 text-center">
              <CardContent className="p-6">
                <Users className="h-10 w-10 mx-auto mb-3 text-primary" />
                <div className="text-3xl font-bold text-primary mb-2">10K+</div>
                <p className="text-muted-foreground">Active Users</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-card border-border/50 text-center">
              <CardContent className="p-6">
                <Clock className="h-10 w-10 mx-auto mb-3 text-primary" />
                <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                <p className="text-muted-foreground">Available Tasks</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-card border-border/50 text-center">
              <CardContent className="p-6">
                <Wallet className="h-10 w-10 mx-auto mb-3 text-primary" />
                <div className="text-3xl font-bold text-primary mb-2">Instant</div>
                <p className="text-muted-foreground">Withdrawals</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Withdrawal Methods */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Withdrawal Options</h2>
            <p className="text-xl text-muted-foreground">Choose how you want to receive your earnings</p>
          </div>
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-card border-border/50 shadow-elegant">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-semibold mb-4 pb-4 border-b">
                  <div>Method</div>
                  <div>Processing Time</div>
                  <div>Fee</div>
                </div>
                {withdrawalMethods.map((method, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-b last:border-0">
                    <div className="font-medium">{method.name}</div>
                    <div className="text-muted-foreground">{method.time}</div>
                    <div className="text-success font-medium">{method.fee}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Start Earning Now</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already earning money with our platform.
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
