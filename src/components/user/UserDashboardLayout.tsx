import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { UserSidebar } from "./UserSidebar";
import { Bell, Search, User, Wallet, Menu, ListTodo, LogOut, Star, Smartphone, Globe, Gamepad2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";

const menuItems = [
  { title: "Dashboard", url: "/user", icon: User },
  { title: "Available Tasks", url: "/user/tasks", icon: ListTodo },
  { title: "My Tasks", url: "/user/my-tasks", icon: ListTodo },
  { title: "Earnings", url: "/user/earnings", icon: Wallet },
  { title: "Complete KYC", url: "/user/kyc", icon: User },
  { title: "Withdrawal Methods", url: "/user/withdrawal-methods", icon: Wallet },
  { title: "Profile", url: "/user/profile", icon: User },
  { title: "Referrals", url: "/user/referrals", icon: User },
  { title: "Support", url: "/user/support", icon: User },
];

const taskCategories = [
  { title: "Reviews", icon: Star, count: 12 },
  { title: "App Install", icon: Smartphone, count: 8 },
  { title: "Website Survey", icon: Globe, count: 15 },
  { title: "Game Tasks", icon: Gamepad2, count: 6 },
  { title: "Social Media", icon: MessageSquare, count: 10 },
];

interface UserDashboardLayoutProps {
  children: React.ReactNode;
}

export function UserDashboardLayout({ children }: UserDashboardLayoutProps) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile, loading } = useProfile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/auth/login');
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-user">
        {/* Desktop Sidebar */}
        {!isMobile && <UserSidebar />}
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-50 h-16 border-b border-border/50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
            <div className="flex h-full items-center justify-between px-4 md:px-6">
              <div className="flex items-center gap-4">
                {isMobile ? (
                  <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon" className="hover:bg-accent/50">
                        <Menu className="h-5 w-5" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-72 max-w-[85vw] bg-background">
                      <div className="flex flex-col h-full bg-background">
                        {/* Logo */}
                        <div className="p-4 border-b border-border/50">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                              <ListTodo className="h-4 w-4 text-primary-foreground" />
                            </div>
                            <div>
                              <h2 className="text-base font-bold text-foreground">TaskHub</h2>
                              <p className="text-xs text-muted-foreground">User Panel</p>
                            </div>
                          </div>
                        </div>

                        {/* Main Navigation */}
                        <div className="flex-1 overflow-y-auto py-4">
                          <div className="px-2 mb-2">
                            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Main Menu</h3>
                            <nav className="space-y-1">
                              {menuItems.map((item) => (
                                <NavLink
                                  key={item.title}
                                  to={item.url}
                                  end
                                  onClick={() => setIsSheetOpen(false)}
                                  className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                                      isActive
                                        ? "bg-primary/20 text-primary font-medium border-r-2 border-primary"
                                        : "text-foreground hover:bg-accent/50"
                                    }`
                                  }
                                >
                                  <item.icon className="h-4 w-4 flex-shrink-0" />
                                  <span>{item.title}</span>
                                </NavLink>
                              ))}
                            </nav>
                          </div>

                          {/* Task Categories */}
                          <div className="px-2 mt-6">
                            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Task Categories</h3>
                            <div className="space-y-1">
                              {taskCategories.map((category) => (
                                <button
                                  key={category.title}
                                  className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm hover:bg-accent/50 transition-colors text-foreground"
                                >
                                  <div className="flex items-center gap-2">
                                    <category.icon className="h-4 w-4" />
                                    <span>{category.title}</span>
                                  </div>
                                  <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full">
                                    {category.count}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Logout Button */}
                        <div className="p-4 border-t border-border/50">
                          <Button 
                            onClick={() => {
                              setIsSheetOpen(false);
                              handleLogout();
                            }}
                            variant="ghost" 
                            className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-destructive/10"
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            <span>Logout</span>
                          </Button>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                ) : (
                  <SidebarTrigger className="hover:bg-accent/50" />
                )}
                
                {!isMobile && (
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      placeholder="Search tasks..." 
                      className="w-full pl-10 bg-background/50 border-border/50 focus:border-primary/50"
                    />
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2 md:gap-4">
              <div className="flex items-center gap-2 px-2 md:px-3 py-1 rounded-full bg-primary/10 border border-primary/30">
                <Wallet className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  {loading ? '...' : `₹${(profile?.balance || 0).toFixed(2)}`}
                </span>
              </div>
                
                <Button variant="ghost" size="icon" className="relative hover:bg-accent/50">
                  <Bell className="h-5 w-5" />
                  <Badge className="absolute -right-1 -top-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-primary">
                    3
                  </Badge>
                </Button>
                
                <Button variant="ghost" size="icon" className="hover:bg-accent/50">
                  <User className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}