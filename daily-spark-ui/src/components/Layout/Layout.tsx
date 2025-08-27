import React from 'react';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { LogOut, User, BookOpen, Upload, Home } from 'lucide-react';
import { isDemoUser } from '../../utils/config';
import DemoBanner from '../DemoBanner';
import { LoadingSpinner } from '../LoadingSpinner';

const Layout: React.FC = () => {
  const { state, logout } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'My Curricula', href: '/curricula', icon: BookOpen },
    { name: 'Upload New', href: '/upload', icon: Upload },
  ];

  // Show loading only if we have no user data and are still initializing
  if (!state.isInitialized && !state.user) {
    return (
      <div className="min-h-screen bg-spark-gray-100 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (!state.user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen bg-spark-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-spark-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Navigation */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center">
                  <BookOpen className="h-8 w-8 text-spark-blue-500" />
                  <span className="ml-2 text-xl font-bold text-spark-gray-800">Daily Spark</span>
                </div>
              </div>
              
              {/* Navigation Links */}
              <nav className="ml-10 flex space-x-8">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors ${
                        isActive
                          ? 'text-spark-blue-600 border-b-2 border-spark-blue-600'
                          : 'text-spark-gray-500 hover:text-spark-gray-700 hover:border-b-2 hover:border-spark-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-1" />
                      {item.name}
                    </a>
                  );
                })}
              </nav>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {/* Demo Banner */}
              {isDemoUser(state.user.id) && <DemoBanner />}
              
              {/* User Info */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-spark-gray-500" />
                  <button
                    onClick={() => navigate('/profile')}
                    className="text-sm font-medium text-spark-gray-700 hover:text-spark-blue-600 hover:underline transition-colors"
                  >
                    {state.user.displayName}
                  </button>
                </div>
                
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-spark-gray-700 bg-spark-gray-100 hover:bg-spark-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-spark-blue-500 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
