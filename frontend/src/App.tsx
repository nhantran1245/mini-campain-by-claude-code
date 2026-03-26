import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from '@/components/ErrorBoundary';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Campaigns from '@/pages/Campaigns';
import CampaignNew from '@/pages/CampaignNew';
import CampaignEdit from '@/pages/CampaignEdit';
import CampaignDetail from '@/pages/CampaignDetail';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/campaigns" replace />} />
              <Route
                path="/campaigns"
                element={
                  <ProtectedRoute>
                    <Campaigns />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/campaigns/new"
                element={
                  <ProtectedRoute>
                    <CampaignNew />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/campaigns/:id/edit"
                element={
                  <ProtectedRoute>
                    <CampaignEdit />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/campaigns/:id"
                element={
                  <ProtectedRoute>
                    <CampaignDetail />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
