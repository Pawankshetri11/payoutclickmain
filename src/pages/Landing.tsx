import { useState } from "react";
import { 
  Search, Star, Users, CheckCircle, TrendingUp, Smartphone, Globe, 
  Gamepad2, MessageSquare, Play, Shield, Zap, Clock, Award, 
  IndianRupee, Target, Download, ArrowRight, MapPin, Mail, 
  Phone, Facebook, Twitter, Instagram, Linkedin, ChevronUp, Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-illustration.jpg";
import howItWorksImage from "@/assets/how-it-works.jpg";
import earningsImage from "@/assets/earnings-illustration.jpg";

const Landing = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const stats = [
    { label: "Active Users", value: "50,000", suffix: "+", icon: Users, color: "text-blue-600" },
    { label: "Jobs Completed", value: "2.5", suffix: "M+", icon: CheckCircle, color: "text-green-600" },
    { label: "Total Earnings", value: "₹15", suffix: "Cr+", icon: IndianRupee, color: "text-purple-600" },
    { label: "Daily Payouts", value: "1,200", suffix: "+", icon: TrendingUp, color: "text-orange-600" },
  ];

  const features = [
    {
      icon: Shield,
      title: "100% Secure Platform",
      description: "Your data and earnings are protected with bank-level security measures."
    },
    {
      icon: Zap,
      title: "Instant Payments",
      description: "Get paid immediately after task completion. No waiting periods."
    },
    {
      icon: Clock,
      title: "24/7 Availability", 
      description: "Work anytime, anywhere. Tasks are available round the clock."
    },
    {
      icon: Target,
      title: "Easy Tasks",
      description: "Simple surveys, reviews, and app installs that anyone can complete."
    }
  ];

  const jobCategories = [
    { title: "Website Surveys", icon: Globe, count: 1250, color: "bg-blue-500", earning: "₹10-50" },
    { title: "App Reviews", icon: Star, count: 890, color: "bg-yellow-500", earning: "₹15-40" },
    { title: "Game Testing", icon: Gamepad2, count: 650, color: "bg-green-500", earning: "₹20-80" },
    { title: "App Downloads", icon: Download, count: 1100, color: "bg-purple-500", earning: "₹5-25" },
    { title: "Social Media", icon: MessageSquare, count: 780, color: "bg-pink-500", earning: "₹8-35" },
    { title: "Product Reviews", icon: Star, count: 560, color: "bg-orange-500", earning: "₹12-45" }
  ];

  const howItWorks = [
    {
      step: 1,
      title: "Sign Up for Free",
      description: "Create your account in just 2 minutes with basic information."
    },
    {
      step: 2,
      title: "Choose Your Tasks",
      description: "Browse available tasks and select ones that match your interest."
    },
    {
      step: 3,
      title: "Complete & Earn",
      description: "Finish tasks and get instant payments directly to your account."
    }
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      location: "Mumbai, Maharashtra",
      avatar: "PS",
      rating: 5,
      review: "PayoutClick has been amazing! I earn ₹15,000+ monthly just in my free time. The tasks are simple and payments are instant.",
      earnings: "₹45,600",
      completed: 342
    },
    {
      name: "Rahul Kumar", 
      location: "Delhi, NCR",
      avatar: "RK",
      rating: 5,
      review: "Perfect platform for students like me. I can work between classes and earn enough for my expenses. Highly recommended!",
      earnings: "₹38,900",
      completed: 289
    },
    {
      name: "Sneha Patel",
      location: "Pune, Maharashtra", 
      avatar: "SP",
      rating: 5,
      review: "The variety of tasks keeps things interesting. Customer support is excellent and payments are always on time.",
      earnings: "₹62,300",
      completed: 456
    }
  ];

  const faqs = [
    {
      question: "How much can I earn with PayoutClick?",
      answer: "Earnings vary based on task completion. Users typically earn ₹5,000-₹25,000 per month working part-time."
    },
    {
      question: "When do I get paid?",
      answer: "Payments are processed instantly after task approval. Minimum withdrawal is ₹100."
    },
    {
      question: "Are there any fees?",
      answer: "PayoutClick is completely free to join and use. No hidden charges or membership fees."
    },
    {
      question: "What types of tasks are available?",
      answer: "We offer surveys, app reviews, website testing, social media tasks, and product reviews."
    }
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border/50">
        <div className="container mx-auto px-4">
          {/* Top Bar */}
          <div className="hidden md:flex justify-between items-center py-2 text-sm text-muted-foreground border-b border-border/30">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+91 810 497 4122</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>support@payoutclick.com</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span>Follow us:</span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50">
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-400 hover:bg-blue-50">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-pink-600 hover:bg-pink-50">
                  <Instagram className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-700 hover:bg-blue-50">
                  <Linkedin className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Main Header */}
          <div className="flex items-center justify-between py-3 md:py-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <IndianRupee className="h-5 w-5 md:h-7 md:w-7 text-white" />
              </div>
              <div>
                <h1 className="text-lg md:text-2xl font-bold text-foreground">PayoutClick</h1>
                <p className="text-xs text-muted-foreground hidden md:block">Earn Money Online</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-4 lg:gap-6">
              <Button variant="ghost" className="hover:text-primary text-sm">Home</Button>
              <Button variant="ghost" className="hover:text-primary text-sm">How It Works</Button>
              <Button variant="ghost" className="hover:text-primary text-sm">Earnings</Button>
              <Button variant="ghost" className="hover:text-primary text-sm">Contact</Button>
              <Button onClick={() => navigate('/auth')} variant="outline" size="sm">
                Login
              </Button>
              <Button onClick={() => navigate('/auth')} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" size="sm">
                Get Started
              </Button>
            </nav>

            <Sheet>
              <SheetTrigger asChild>
                <Button className="md:hidden" variant="outline" size="sm">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <nav className="flex flex-col gap-4 mt-8">
                  <Button variant="ghost" className="justify-start hover:text-primary">Home</Button>
                  <Button variant="ghost" className="justify-start hover:text-primary">How It Works</Button>
                  <Button variant="ghost" className="justify-start hover:text-primary">Earnings</Button>
                  <Button variant="ghost" className="justify-start hover:text-primary">Contact</Button>
                  <Button onClick={() => navigate('/auth')} variant="outline" className="mt-4">
                    Login
                  </Button>
                  <Button onClick={() => navigate('/auth')} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Get Started
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-10 md:py-20 px-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-16 items-center">
            <div className="space-y-6 md:space-y-8">
              <div className="space-y-4 md:space-y-6">
                <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 md:px-4 md:py-2 text-xs md:text-sm">
                  🚀 #1 Earning Platform in India
                </Badge>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-foreground leading-tight">
                  Turn Your Free Time Into{" "}
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Real Money
                  </span>
                </h1>
                <p className="text-base md:text-xl text-muted-foreground max-w-lg leading-relaxed">
                  Join 50,000+ Indians earning ₹5,000-₹25,000 monthly by completing simple 
                  online tasks. No skills required, start earning today!
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-base md:text-lg px-6 py-5 md:px-8 md:py-6"
                  onClick={() => navigate('/auth')}
                >
                  Start Earning Now
                  <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-base md:text-lg px-6 py-5 md:px-8 md:py-6 border-2"
                >
                  <Play className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                  Watch Demo
                </Button>
              </div>

              <div className="flex items-center gap-4 md:gap-8 pt-2 md:pt-4">
                <div className="text-center">
                  <div className="text-lg md:text-2xl font-bold text-foreground">₹15 Cr+</div>
                  <div className="text-xs md:text-sm text-muted-foreground">Total Paid</div>
                </div>
                <div className="text-center">
                  <div className="text-lg md:text-2xl font-bold text-foreground">50K+</div>
                  <div className="text-xs md:text-sm text-muted-foreground">Happy Users</div>
                </div>
                <div className="text-center">
                  <div className="text-lg md:text-2xl font-bold text-foreground">24/7</div>
                  <div className="text-xs md:text-sm text-muted-foreground">Support</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10">
                <img 
                  src={heroImage} 
                  alt="People earning money online with PayoutClick"
                  className="w-full h-auto rounded-2xl shadow-2xl"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-3xl rounded-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Trusted by Thousands Across India
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Real numbers from real users who are earning consistently on PayoutClick
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center p-8 hover:shadow-lg transition-all hover:-translate-y-1 border-0 shadow-md">
                <CardContent className="p-0">
                  <div className={`inline-flex p-4 rounded-full bg-gray-50 mb-4`}>
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                  <div className="text-4xl font-bold text-foreground mb-2">
                    {stat.value}
                    <span className="text-xl">{stat.suffix}</span>
                  </div>
                  <p className="text-muted-foreground font-medium">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Why Choose PayoutClick?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We've built the most trusted and user-friendly platform for online earning in India
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-all hover:-translate-y-1 border-0 shadow-md">
                <CardContent className="p-0">
                  <div className="inline-flex p-4 rounded-full bg-blue-50 mb-6">
                    <feature.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Job Categories */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Available Task Categories
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose from hundreds of tasks across different categories and start earning immediately
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobCategories.map((category, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer border-0 shadow-md">
                <CardContent className="p-0">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-xl ${category.color} text-white`}>
                      <category.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{category.title}</h3>
                      <p className="text-sm text-muted-foreground">{category.count} tasks available</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Earning Range:</span>
                    <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                      {category.earning}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-6">
                How PayoutClick Works
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Getting started is simple. Follow these 3 easy steps and start earning within minutes.
              </p>

              <div className="space-y-8">
                {howItWorks.map((step, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-center font-bold text-lg">
                      {step.step}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-2">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button 
                size="lg" 
                className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={() => navigate('/auth')}
              >
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <div className="relative">
              <img 
                src={howItWorksImage} 
                alt="How PayoutClick works - step by step process"
                className="w-full h-auto rounded-2xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Real stories from real users who are earning consistently with PayoutClick
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-all hover:-translate-y-1 border-0 shadow-md">
                <CardContent className="p-0">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-center font-bold text-lg">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {testimonial.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  <p className="text-muted-foreground mb-4 italic">"{testimonial.review}"</p>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{testimonial.earnings}</div>
                      <div className="text-xs text-muted-foreground">Total Earned</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{testimonial.completed}</div>
                      <div className="text-xs text-muted-foreground">Tasks Done</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-5xl font-bold mb-6">
              Ready to Start Earning?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join 50,000+ Indians who are already earning money in their free time. 
              Sign up today and get your first task within minutes!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                variant="secondary"
                className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6 min-w-[200px]"
                onClick={() => navigate('/auth')}
              >
                Join Now - It's Free!
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <div className="text-center sm:text-left">
                <div className="text-sm opacity-75">✅ No registration fees</div>
                <div className="text-sm opacity-75">✅ Instant payments</div>
              </div>
            </div>
          </div>

          <div className="mt-16 relative">
            <img 
              src={earningsImage} 
              alt="Start earning money with PayoutClick today"
              className="w-full max-w-md mx-auto rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Got questions? We've got answers. Here are the most common questions about PayoutClick.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16 px-4 border-t border-gray-700">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                  <IndianRupee className="h-7 w-7" />
                </div>
                <div>
                  <span className="font-bold text-2xl">PayoutClick</span>
                  <p className="text-xs text-gray-400">Earn Money Online</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                India's most trusted platform for earning money online through simple tasks. Join 50,000+ active users today!
              </p>
              <div className="flex gap-3 pt-2">
                <Button variant="ghost" size="sm" className="h-10 w-10 p-0 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full">
                  <Facebook className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" className="h-10 w-10 p-0 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full">
                  <Twitter className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" className="h-10 w-10 p-0 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full">
                  <Instagram className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" className="h-10 w-10 p-0 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full">
                  <Linkedin className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4 text-white">Company</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                    <span className="w-0 group-hover:w-2 h-px bg-blue-500 transition-all" />
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                    <span className="w-0 group-hover:w-2 h-px bg-blue-500 transition-all" />
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                    <span className="w-0 group-hover:w-2 h-px bg-blue-500 transition-all" />
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                    <span className="w-0 group-hover:w-2 h-px bg-blue-500 transition-all" />
                    Blog
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4 text-white">Support</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                    <span className="w-0 group-hover:w-2 h-px bg-purple-500 transition-all" />
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                    <span className="w-0 group-hover:w-2 h-px bg-purple-500 transition-all" />
                    FAQs
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                    <span className="w-0 group-hover:w-2 h-px bg-purple-500 transition-all" />
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                    <span className="w-0 group-hover:w-2 h-px bg-purple-500 transition-all" />
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4 text-white">Contact</h3>
              <ul className="space-y-4 text-sm text-gray-400">
                <li className="flex items-start gap-3 group">
                  <Mail className="h-5 w-5 mt-0.5 text-blue-500 group-hover:text-blue-400 transition-colors" />
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Email</p>
                    <a href="mailto:support@payoutclick.com" className="text-gray-300 hover:text-white transition-colors">
                      support@payoutclick.com
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3 group">
                  <Phone className="h-5 w-5 mt-0.5 text-purple-500 group-hover:text-purple-400 transition-colors" />
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Phone</p>
                    <a href="tel:+918104974122" className="text-gray-300 hover:text-white transition-colors">
                      +91 810 497 4122
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 mt-0.5 text-pink-500" />
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Location</p>
                    <p className="text-gray-300">Mumbai, India</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm">
                © 2024 PayoutClick. All rights reserved. Made with ❤️ in India
              </p>
              <div className="flex items-center gap-6 text-sm">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Terms
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Privacy
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Cookies
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Sitemap
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      <Button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg z-40"
        size="sm"
      >
        <ChevronUp className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default Landing;