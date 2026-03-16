import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider, useQuery } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import AppLayout from '@/components/layout/AppLayout';
import Map from '@/pages/Map';
import Directory from '@/pages/Directory';
import Learn from '@/pages/Learn';
import Admin from '@/pages/Admin';
import Profile from '@/pages/Profile';
import Feed from '@/pages/Feed';
import Landing from '@/pages/Landing';
import AuthGateway from '@/pages/AuthGateway';
import GeocodingTool from '@/pages/GeocodingTool';
import Messages from '@/pages/Messages';

const AdminRoute = () => {
  const { data: user, isLoading } = useQuery({ queryKey: ["me"], queryFn: () => base44.auth.me() });
  if (isLoading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-green-200 border-t-green-700 rounded-full animate-spin" /></div>;
  if (user?.role !== "admin") return <Navigate to="/Feed" replace />;
  return <Admin />;
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-green-700 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      return (
        <Routes>
          <Route path="/AuthGateway" element={<AuthGateway />} />
          <Route path="*" element={<Landing />} />
        </Routes>
      );
    }
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/Feed" replace />} />
      <Route path="/Landing" element={<Landing />} />
      <Route path="/AuthGateway" element={<AuthGateway />} />
      <Route path="/GeocodingTool" element={<GeocodingTool />} />
      <Route element={<AppLayout />}>
        <Route path="/Map" element={<Map />} />
        <Route path="/Directory" element={<Directory />} />
        <Route path="/Learn" element={<Learn />} />
        <Route path="/Admin" element={<AdminRoute />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/Feed" element={<Feed />} />
        <Route path="/Messages" element={<Messages />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;