import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export default function Layout() {
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link
              to="/"
              className="text-2xl font-bold text-gray-900 hover:text-gray-700"
            >
              Mini Campaign Manager
            </Link>
            {isAuthenticated && (
              <div className="flex items-center gap-6">
                <span className="text-sm text-gray-600">
                  Welcome, {user?.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Navigation */}
      {isAuthenticated && (
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-8 py-3">
              <Link
                to="/campaigns"
                className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                  isActive('/campaigns')
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                Campaigns
              </Link>
              <Link
                to="/campaigns/new"
                className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                  isActive('/campaigns/new')
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                New Campaign
              </Link>
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
