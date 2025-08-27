import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useToastHelpers } from '../components/Toast';
import { ButtonSpinner, LoadingSpinner } from '../components/LoadingSpinner';
import { BookOpen, Sparkles } from 'lucide-react';
import { config } from '../utils/config';

const LoginPage: React.FC = () => {
  const [userId, setUserId] = useState('');
  const { state, login, clearErrors } = useAppContext();
  const { showSuccess, showError } = useToastHelpers();
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    if (state.user) {
      navigate('/dashboard');
    }
  }, [state.user, navigate]);

  // Clear errors when component mounts
  useEffect(() => {
    clearErrors();
  }, [clearErrors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim()) {
      showError('Validation Error', 'Please enter a User ID');
      return;
    }

    try {
      await login(userId.trim());
      showSuccess('Welcome back!', 'Successfully signed in');
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by the context, but we can show a toast here too
      showError('Login Failed', 'User not found. Please create a profile first.');
    }
  };

  const handleCreateProfile = () => {
    navigate('/profile');
  };

  const handleUseDemoAccount = () => {
    setUserId(config.DEMO_USER_ID);
  };

  // Show loading while checking authentication
  if (!state.isInitialized) {
    return (
      <div className="min-h-screen bg-spark-gray-100 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  return (
    <div className="login-page min-h-screen bg-spark-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo and Title */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-spark-blue-500 rounded-full flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-spark-gray-800">
          Welcome to Daily Spark
        </h2>
        <p className="mt-2 text-center text-sm text-spark-gray-600">
          Your partner in daily learning
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* User ID Input */}
            <div>
              <label htmlFor="userId" className="block text-sm font-medium text-spark-gray-700">
                User ID
              </label>
              <div className="mt-1">
                <input
                  id="userId"
                  name="userId"
                  type="text"
                  required
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-spark-gray-300 rounded-md placeholder-spark-gray-400 focus:outline-none focus:ring-spark-blue-500 focus:border-spark-blue-500 sm:text-sm"
                  placeholder="Enter your User ID"
                  disabled={state.userLoading.isLoading}
                />
              </div>
              {state.userLoading.error && (
                <p className="mt-2 text-sm text-red-600">{state.userLoading.error.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={state.userLoading.isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-spark-blue-500 hover:bg-spark-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-spark-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {state.userLoading.isLoading ? (
                  <div className="flex items-center">
                    <ButtonSpinner />
                    <span className="ml-2">Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Sign In
                  </div>
                )}
              </button>
            </div>
          </form>

          {/* Create Profile Link */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-spark-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-spark-gray-500">New to Daily Spark?</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleCreateProfile}
                className="w-full flex justify-center py-2 px-4 border border-spark-gray-300 rounded-md shadow-sm text-sm font-medium text-spark-gray-700 bg-white hover:bg-spark-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-spark-blue-500 transition-colors"
              >
                Create Profile
              </button>
            </div>
          </div>

          {/* Demo Account Info */}
          <div className="mt-6 p-4 bg-spark-light-blue rounded-md">
            <p className="text-sm text-spark-blue-600 text-center">
              <strong>Demo Mode:</strong> Use <code className="bg-white px-1 rounded">{config.DEMO_USER_ID}</code> to sign in
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
