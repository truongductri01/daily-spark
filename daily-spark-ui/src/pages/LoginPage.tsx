import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { mockApi } from '../services/mockApi';
import { BookOpen, Sparkles } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    if (state.user) {
      navigate('/dashboard');
    }
  }, [state.user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim()) {
      setError('Please enter a User ID');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await mockApi.getUser(userId.trim());
      
      if (response.success) {
        dispatch({ type: 'SET_USER', payload: response.data });
        navigate('/dashboard');
      } else {
        setError(response.message || 'User not found. Please create a profile first.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProfile = () => {
    navigate('/profile');
  };

  return (
    <div className="min-h-screen bg-spark-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
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
          Your Partner in Daily Learning
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
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
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-spark-blue-500 hover:bg-spark-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-spark-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>

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
                <Sparkles className="w-4 h-4 mr-2" />
                Create New Profile
              </button>
            </div>
          </div>

          {/* Demo Info */}
          <div className="mt-6 p-4 bg-spark-light-blue rounded-md">
            <p className="text-sm text-spark-blue-600 text-center">
              <strong>Demo Mode:</strong> Use <code className="bg-white px-1 rounded">first-user</code> to sign in
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
