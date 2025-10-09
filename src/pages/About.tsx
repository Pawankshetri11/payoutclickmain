import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Target, Users, Award, TrendingUp } from "lucide-react";

export default function About() {
  const values = [
    {
      icon: <Target className="h-10 w-10 text-primary" />,
      title: "Our Mission",
      description: "To provide accessible earning opportunities for people worldwide through simple online tasks."
    },
    {
      icon: <Users className="h-10 w-10 text-primary" />,
      title: "Community First",
      description: "We believe in building a strong community where everyone can succeed and grow together."
    },
    {
      icon: <Award className="h-10 w-10 text-primary" />,
      title: "Quality Work",
      description: "We ensure all tasks meet high standards and provide fair compensation for completed work."
    },
    {
      icon: <TrendingUp className="h-10 w-10 text-primary" />,
      title: "Growth",
      description: "Committed to continuous improvement and creating more opportunities for our users."
    }
  ];

  const stats = [
    { number: "50K+", label: "Active Users" },
    { number: "$2M+", label: "Total Earnings" },
    { number: "1M+", label: "Tasks Completed" },
    { number: "99%", label: "Satisfaction Rate" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            TaskHub
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-gradient-primary">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            About <span className="bg-gradient-primary bg-clip-text text-transparent">TaskHub</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We're on a mission to create earning opportunities for people around the world. Our platform connects task creators with talented individuals ready to work.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-8 text-center">Our Story</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-muted-foreground mb-6">
                Founded in 2024, TaskHub started with a simple idea: make it easy for anyone to earn money online by completing simple tasks. We noticed that many people wanted flexible work opportunities but struggled to find reliable platforms.
              </p>
              <p className="text-lg text-muted-foreground mb-6">
                Today, we've grown into a thriving community of over 50,000 active users who have collectively earned over $2 million. Our platform offers thousands of tasks daily, ranging from product reviews to data entry and social media engagement.
              </p>
              <p className="text-lg text-muted-foreground">
                We're constantly innovating and adding new features to make earning money online easier, more accessible, and more rewarding for our users worldwide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Our Values</h2>
            <p className="text-xl text-muted-foreground">The principles that guide everything we do</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="bg-gradient-card border-border/50 shadow-elegant hover:shadow-glow transition-all">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-primary/10 rounded-full">
                      {value.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Join Our Community</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Be part of a growing community of earners. Start your journey with TaskHub today.
          </p>
          <Link to="/auth">
            <Button size="lg" className="bg-gradient-primary text-lg px-8 py-6">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 TaskHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
