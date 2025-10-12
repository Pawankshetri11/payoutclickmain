import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "./components/admin/DashboardLayout";
import { UserDashboardLayout } from "./components/user/UserDashboardLayout";
import { useAuth } from "./contexts/AuthContext";

// Auth Pages
import Auth from "./pages/Auth";
import AdminLogin from "./pages/auth/AdminLogin";

// Admin Pages
import Dashboard from "./pages/admin/Dashboard";
import Users from "./pages/admin/Users";
import Jobs from "./pages/admin/Jobs";
import Categories from "./pages/admin/Categories";
import ReviewProfiles from "./pages/admin/ReviewProfiles";
import TaskSubmissions from "./pages/admin/TaskSubmissions";

import Withdrawals from "./pages/admin/Withdrawals";
import ReferralSystem from "./pages/admin/ReferralSystem";
import FAQManager from "./pages/admin/FAQManager";
import Reports from "./pages/admin/Reports";
import Analytics from "./pages/admin/Analytics";
import Settings from "./pages/admin/Settings";
import PaymentGateways from "./pages/admin/PaymentGateways";
import EmailCenter from "./pages/admin/EmailCenter";
import ContentEditor from "./pages/admin/ContentEditor";

// User Pages
import UserDashboard from "./pages/user/UserDashboard";
import Tasks from "./pages/user/Tasks";
import MyTasks from "./pages/user/MyTasks";
import Earnings from "./pages/user/Earnings";
import Profile from "./pages/user/Profile";
import CompleteKYC from "./pages/user/CompleteKYC";
import WithdrawalMethods from "./pages/user/WithdrawalMethods";
import WithdrawalRequest from "./pages/user/WithdrawalRequest";
import Referrals from "./pages/user/Referrals";
import Support from "./pages/user/Support";
import JobView from "./pages/user/JobView";
import TaskDetail from "./pages/user/TaskDetail";
import ReviewTask from "./pages/user/ReviewTask";
import JobCodeManager from "./pages/admin/JobCodeManager";

import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";
import HowItWorks from "./pages/HowItWorks";
import EarningsInfo from "./pages/EarningsInfo";
import Contact from "./pages/Contact";
import About from "./pages/About";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Sitemap from "./pages/Sitemap";

const queryClient = new QueryClient();

function ProtectedRoute({ children, requireAuth = true }: { children: React.ReactNode, requireAuth?: boolean }) {
  const { user, loading } = useAuth();
  const isDemoLoggedIn = typeof window !== 'undefined' && localStorage.getItem('is_logged_in') === 'true';
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (requireAuth && !user && !isDemoLoggedIn) {
    return <Auth />;
  }
  
  if (!requireAuth && (user || isDemoLoggedIn)) {
    // Redirect to user dashboard if already authenticated
    window.location.href = '/user';
    return null;
  }
  
  return <>{children}</>;
}


function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAdmin = typeof window !== 'undefined' && localStorage.getItem('is_admin') === 'true';
  if (!isAdmin) {
    window.location.href = '/admin-login';
    return null;
  }
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/earnings-info" element={<EarningsInfo />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/sitemap" element={<Sitemap />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          
          {/* Admin Routes */}
          <Route path="/admin/*" element={
            <AdminProtectedRoute>
              <DashboardLayout>
                <Routes>
                  <Route path="" element={<Dashboard />} />
                  <Route path="users" element={<Users />} />
                  <Route path="jobs" element={<Jobs />} />
                  <Route path="jobs/:jobId/codes" element={<JobCodeManager />} />
                  <Route path="task-submissions" element={<TaskSubmissions />} />
                  <Route path="categories" element={<Categories />} />
                  <Route path="review-profiles" element={<ReviewProfiles />} />
                  
                  <Route path="withdrawals" element={<Withdrawals />} />
                  <Route path="referrals" element={<ReferralSystem />} />
                  <Route path="faqs" element={<FAQManager />} />
            <Route path="reports" element={<Reports />} />
            <Route path="analytics" element={<Analytics />} />
                  <Route path="payment-gateways" element={<PaymentGateways />} />
                  <Route path="email-center" element={<EmailCenter />} />
                  <Route path="content-editor" element={<ContentEditor />} />
                  <Route path="settings" element={<Settings />} />
                </Routes>
              </DashboardLayout>
            </AdminProtectedRoute>
          } />
          
          {/* User Routes */}
          <Route path="/user/*" element={
            <ProtectedRoute>
              <UserDashboardLayout>
                 <Routes>
                  <Route path="/" element={<UserDashboard />} />
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/tasks/:taskId" element={<TaskDetail />} />
                   <Route path="/jobs/:jobId" element={<JobView />} />
                   <Route path="/jobs/:jobId/review" element={<ReviewTask />} />
                  <Route path="/my-tasks" element={<MyTasks />} />
                  <Route path="/earnings" element={<Earnings />} />
                   <Route path="/kyc" element={<CompleteKYC />} />
                   <Route path="/withdrawal-methods" element={<WithdrawalMethods />} />
                   <Route path="/profile" element={<Profile />} />
                  <Route path="/referrals" element={<Referrals />} />
                  <Route path="/support" element={<Support />} />
                </Routes>
              </UserDashboardLayout>
            </ProtectedRoute>
          } />
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
