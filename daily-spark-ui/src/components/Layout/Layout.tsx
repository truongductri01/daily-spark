import React from 'react';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { LogOut, User, BookOpen, Upload, Home } from 'lucide-react';

const Layout: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'My Curricula', href: '/curricula', icon: BookOpen },
    { name: 'Upload New', href: '/upload', icon: Upload },
  ];

  if (!state.user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen bg-spark-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-spark-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-spark-blue-600">
                Daily Spark
              </h1>
              <span className="ml-2 text-sm text-spark-gray-800">
                Your Partner in Daily Learning
              </span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <button
                    key={item.name}
                    onClick={() => navigate(item.href)}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-spark-light-blue text-spark-blue-600'
                        : 'text-spark-gray-600 hover:text-spark-blue-600 hover:bg-spark-light-blue'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </button>
                );
              })}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center text-spark-gray-600 hover:text-spark-blue-600 transition-colors"
              >
                <User className="w-4 h-4 mr-2" />
                <span className="hidden sm:block">{state.user.name}</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center text-spark-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:block">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-white border-b border-spark-gray-200">
        <div className="px-4 py-2">
          <div className="flex space-x-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.href)}
                  className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-spark-light-blue text-spark-blue-600'
                      : 'text-spark-gray-600 hover:text-spark-blue-600 hover:bg-spark-light-blue'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
