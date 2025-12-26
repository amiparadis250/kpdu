import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { VotingProvider } from "./contexts/VotingContext";
import { ThemeProvider } from "next-themes";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
// MemberDashboard removed
import Ballot from "./pages/member/Ballot";
import MemberNotifications from "./pages/member/Notifications";
import MemberSettings from "./pages/member/Settings";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPositions from "./pages/admin/Positions";
import AdminCandidates from "./pages/admin/Candidates";
import AdminResults from "./pages/admin/Results";
import AdminBranches from "./pages/admin/Branches";
import AuditTrail from "./pages/admin/AuditTrail";
import Settings from "./pages/admin/Settings";
import AdminUsers from "./pages/admin/Users";
import AdminNotifications from "./pages/admin/Notifications";
import SuperuseradminDashboard from "./pages/superuseradmin/SuperuseradminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: "member" | "admin" | "superuseradmin";
}) {
  // Disabled authentication for testing - allow access to all routes
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      {/* Public Routes with default theme */}
      <Route
        element={
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            storageKey="theme-public"
          >
            <Outlet />
          </ThemeProvider>
        }
      >
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Member Routes with Member Theme */}
      <Route
        element={
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            storageKey="theme-member"
          >
            <Outlet />
          </ThemeProvider>
        }
      >
        <Route
          path="/member"
          element={
            <ProtectedRoute role="member">
              <Navigate to="/member/ballot" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/member/ballot"
          element={
            <ProtectedRoute role="member">
              <Ballot />
            </ProtectedRoute>
          }
        />
        <Route
          path="/member/notifications"
          element={
            <ProtectedRoute role="member">
              <MemberNotifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/member/settings"
          element={
            <ProtectedRoute role="member">
              <MemberSettings />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Admin Routes with Admin Theme */}
      <Route
        element={
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            storageKey="theme-admin"
          >
            <Outlet />
          </ThemeProvider>
        }
      >
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/positions"
          element={
            <ProtectedRoute role="admin">
              <AdminPositions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/candidates"
          element={
            <ProtectedRoute role="admin">
              <AdminCandidates />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/results"
          element={
            <ProtectedRoute role="admin">
              <AdminResults />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/branches"
          element={
            <ProtectedRoute role="admin">
              <AdminBranches />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/audit"
          element={
            <ProtectedRoute role="admin">
              <AuditTrail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute role="admin">
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/notifications"
          element={
            <ProtectedRoute role="admin">
              <AdminNotifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute role="admin">
              <Settings />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Superuseradmin Routes with Special Theme */}
      <Route
        element={
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            storageKey="theme-superuseradmin"
          >
            <Outlet />
          </ThemeProvider>
        }
      >
        <Route
          path="/superuseradmin"
          element={
            <ProtectedRoute role="superuseradmin">
              <SuperuseradminDashboard />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ToastContainer position="top-right" theme="colored" />
      <AuthProvider>
        <VotingProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </VotingProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
