import { 
  LayoutDashboard, 
  FolderTree, 
  Briefcase, 
  Users, 
  ArrowDownToLine, 
  HelpCircle, 
  FileBarChart, 
  Settings,
  TrendingUp,
  BarChart3,
  LogOut,
  Mail,
  Gift,
  FileText,
  Building2
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Categories",
    url: "/admin/categories",
    icon: FolderTree,
  },
  {
    title: "Jobs",
    url: "/admin/jobs",
    icon: Briefcase,
  },
  {
    title: "Users",
    url: "/admin/users",
    icon: Users,
  },
  {
    title: "Withdrawals",
    url: "/admin/withdrawals",
    icon: ArrowDownToLine,
  },
  {
    title: "Referral System",
    url: "/admin/referrals",
    icon: Gift,
  },
  {
    title: "Support Tickets",
    url: "/admin/tickets",
    icon: HelpCircle,
  },
  {
    title: "Reports",
    url: "/admin/reports",
    icon: FileBarChart,
  },
  {
    title: "User Analytics",
    url: "/admin/user-analytics",
    icon: TrendingUp,
  },
  {
    title: "Task Analytics",
    url: "/admin/task-analytics",
    icon: BarChart3,
  },
  {
    title: "Email Center",
    url: "/admin/email-center", 
    icon: Mail,
  },
  {
    title: "Content Editor",
    url: "/admin/content-editor",
    icon: FileText,
  },
  {
    title: "Business Profiles",
    url: "/review-profiles",
    icon: Building2,
  },
  {
    title: "Settings",
    url: "/admin/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      localStorage.removeItem("is_admin");
      await signOut();
      toast.success("Logged out successfully");
      navigate("/admin-login"); // ✅ Updated redirect path
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  const isActive = (path: string) => {
    if (path === "/admin" && location.pathname === "/admin") return true;
    if (path !== "/admin" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const isCollapsed = state === "collapsed";

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarHeader className="border-b border-border/50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
            <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-semibold text-foreground">PayoutClick</h2>
              <p className="text-sm text-muted-foreground">Admin Panel</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-xs uppercase tracking-wider text-muted-foreground font-medium">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    className={`
                      rounded-lg transition-all duration-200 hover:bg-accent/50
                      ${isActive(item.url) 
                        ? "bg-primary/10 text-primary border-l-2 border-primary shadow-glow" 
                        : "text-muted-foreground hover:text-foreground"
                      }
                    `}
                  >
                    <NavLink to={item.url} className="flex items-center gap-3 px-3 py-2">
                      <item.icon className={`h-5 w-5 ${isActive(item.url) ? "text-primary" : ""}`} />
                      {!isCollapsed && (
                        <span className="font-medium">{item.title}</span>
                      )}
                    </NavLink>
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
            {!isCollapsed && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
