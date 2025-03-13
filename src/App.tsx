
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Pages
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";

// Admin Pages
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminCandidateDetail from "@/pages/admin/CandidateDetail";
import Reports from "@/pages/admin/Reports";
import ElectionManagement from "@/pages/admin/ElectionManagement";

// Interviewer Pages
import InterviewerDashboard from "@/pages/interviewer/Dashboard";
import CandidateDetail from "@/pages/interviewer/CandidateDetail";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          
          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/admin/candidate/:id" 
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminCandidateDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/election"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ElectionManagement />
              </ProtectedRoute>
            }
          />

          {/* Interviewer Routes */}
          <Route
            path="/interviewer/dashboard"
            element={
              <ProtectedRoute allowedRoles={["interviewer", "admin"]}>
                <InterviewerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interviewer/candidate/:id"
            element={
              <ProtectedRoute allowedRoles={["interviewer", "admin"]}>
                <CandidateDetail />
              </ProtectedRoute>
            }
          />

          {/* Election Route */}
          <Route
            path="/election"
            element={
              <ProtectedRoute allowedRoles={["interviewer", "admin"]}>
                <ElectionManagement />
              </ProtectedRoute>
            }
          />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
