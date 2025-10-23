import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useNavigate } from "react-router-dom";
import { Phone, Mail, Facebook, Twitter, Instagram, Linkedin, IndianRupee, Menu } from "lucide-react";

export function LandingHeader() {
  const navigate = useNavigate();

  return (
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
            <Button variant="ghost" className="hover:text-primary text-sm" onClick={() => navigate('/')}>Home</Button>
            <Button variant="ghost" className="hover:text-primary text-sm" onClick={() => navigate('/about')}>About</Button>
            <Button variant="ghost" className="hover:text-primary text-sm" onClick={() => navigate('/how-it-works')}>How It Works</Button>
            <Button variant="ghost" className="hover:text-primary text-sm" onClick={() => navigate('/earnings-info')}>Earnings</Button>
            <Button variant="ghost" className="hover:text-primary text-sm" onClick={() => navigate('/contact')}>Contact</Button>
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
                <Button variant="ghost" className="justify-start hover:text-primary" onClick={() => navigate('/')}>Home</Button>
                <Button variant="ghost" className="justify-start hover:text-primary" onClick={() => navigate('/about')}>About</Button>
                <Button variant="ghost" className="justify-start hover:text-primary" onClick={() => navigate('/how-it-works')}>How It Works</Button>
                <Button variant="ghost" className="justify-start hover:text-primary" onClick={() => navigate('/earnings-info')}>Earnings</Button>
                <Button variant="ghost" className="justify-start hover:text-primary" onClick={() => navigate('/contact')}>Contact</Button>
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
  );
}
