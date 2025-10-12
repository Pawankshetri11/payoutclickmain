import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  ListTodo,
  CheckSquare,
  TrendingUp,
  User,
  Star,
  Smartphone,
  Globe,
  Gamepad2,
  MessageSquare,
  Shield,
  CreditCard,
  LogOut,
  Gift,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/user", icon: Home },
  { title: "Available Tasks", url: "/user/tasks", icon: ListTodo },
  { title: "My Tasks", url: "/user/my-tasks", icon: CheckSquare },
  { title: "Earnings", url: "/user/earnings", icon: TrendingUp },
  { title: "Complete KYC", url: "/user/kyc", icon: Shield },
  { title: "Withdrawal Methods", url: "/user/withdrawal-methods", icon: CreditCard },
  { title: "Profile", url: "/user/profile", icon: User },
  { title: "Referrals", url: "/user/referrals", icon: Gift },
  { title: "Support", url: "/user/support", icon: HelpCircle },
];

const taskCategories = [
  { title: "Reviews", icon: Star, count: 12 },
  { title: "App Install", icon: Smartphone, count: 8 },
  { title: "Website Survey", icon: Globe, count: 15 },
  { title: "Game Tasks", icon: Gamepad2, count: 6 },
  { title: "Social Media", icon: MessageSquare, count: 10 },
];

interface UserSidebarProps {
  onNavigate?: () => void;
}

export function UserSidebar({ onNavigate }: UserSidebarProps = {}) {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const handleLogout = async () => {
    try {
      localStorage.removeItem('is_logged_in');
      await signOut();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  const handleNavClick = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary/20 text-primary font-medium border-r-2 border-primary" : "hover:bg-accent/50";

  return (
    <Sidebar className="w-full md:w-64 border-0" collapsible="icon">
      <SidebarContent className="bg-card/50 backdrop-blur min-h-full">
        {/* Logo */}
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <ListTodo className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold text-foreground">TaskHub</h2>
              <p className="text-xs text-muted-foreground">User Panel</p>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls} onClick={handleNavClick}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Task Categories */}
        <SidebarGroup>
          <SidebarGroupLabel>Task Categories</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {taskCategories.map((category) => (
                <SidebarMenuItem key={category.title}>
                  <SidebarMenuButton className="justify-between hover:bg-accent/50">
                    <div className="flex items-center gap-2">
                      <category.icon className="h-4 w-4" />
                      <span className="text-sm">{category.title}</span>
                    </div>
                    <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full">
                      {category.count}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Logout Button */}
        <div className="mt-auto p-2 border-t border-border/50">
          <Button 
            onClick={handleLogout}
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            <span className="ml-2">Logout</span>
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}