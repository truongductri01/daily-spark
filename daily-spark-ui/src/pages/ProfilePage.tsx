import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useToastHelpers } from '../components/Toast';
import { ButtonSpinner } from '../components/LoadingSpinner';
import { User, Save, ArrowLeft, Users } from 'lucide-react';
import { ProfileFormData } from '../types';
import { isUserLimitReached, getRemainingSlots } from '../utils/config';

const ProfilePage: React.FC = () => {
  const { state, createUser, updateUser, clearErrors, getUserCount } = useAppContext();
  const { showSuccess, showError } = useToastHelpers();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    displayName: '',
    email: '',
    userId: ''
  });

  // Load user count when component mounts (only for new user creation)
  useEffect(() => {
    if (!isEditing) {
      getUserCount();
    }
  }, [getUserCount, isEditing]);

  useEffect(() => {
    if (state.user) {
      setFormData({
        displayName: state.user.displayName,
        email: state.user.email,
        userId: state.user.id
      });
      setIsEditing(true);
    }
  }, [state.user]);

  // Clear errors when component mounts
  useEffect(() => {
    clearErrors();
  }, [clearErrors]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateUserId = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    const newUserId = `user_${timestamp}_${random}`;
    setFormData(prev => ({ ...prev, userId: newUserId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent submission while user count is loading (for new user creation)
    if (!isEditing && (state.userCountLoading.isLoading || state.userCount === null)) {
      showError('Validation Error', 'Please wait for user count to load before creating account');
      return;
    }
    
    if (!formData.displayName.trim() || !formData.email.trim() || !formData.userId.trim()) {
      showError('Validation Error', 'Please fill in all fields');
      return;
    }

    if (!formData.email.includes('@')) {
      showError('Validation Error', 'Please enter a valid email address');
      return;
    }

    try {
      if (isEditing) {
        // Update existing user
        await updateUser({
          id: state.user!.id,
          displayName: formData.displayName,
          email: formData.email
        });
        showSuccess('Profile Updated', 'Your profile has been updated successfully!');
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        // Create new user
        await createUser({
          id: formData.userId,
          displayName: formData.displayName,
          email: formData.email
        });
        showSuccess('Profile Created', 'Your profile has been created successfully!');
        setTimeout(() => navigate('/dashboard'), 1500);
      }
    } catch (error) {
      // Error is handled by the context, but we can show a toast here too
      showError('Operation Failed', 'An error occurred. Please try again.');
    }
  };

  const handleBack = () => {
    if (state.user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  // Check if user limit is reached or if user count is still loading (only for new user creation)
  const isLimitReached = !isEditing && state.userCount !== null && isUserLimitReached(state.userCount);
  const isUserCountLoading = !isEditing && state.userCountLoading.isLoading;
  const shouldShowForm = isEditing || (!isLimitReached && !isUserCountLoading && state.userCount !== null);

  return (
    <div className="min-h-screen bg-spark-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center px-4 py-2 text-spark-gray-700 hover:text-spark-blue-600 hover:bg-spark-blue-50 border border-spark-gray-300 hover:border-spark-blue-300 rounded-lg transition-all duration-200 font-medium text-sm shadow-sm hover:shadow-md mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>

        {/* Header */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-spark-blue-500 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-spark-gray-800">
          {isEditing ? 'Edit Profile' : 'Create Profile'}
        </h2>
        <p className="mt-2 text-center text-sm text-spark-gray-600">
          {isEditing 
            ? 'Update your profile information' 
            : 'Get started with Daily Spark by creating your profile'
          }
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {/* User Count Display (only for new user creation) */}
        {!isEditing && (
          <div className="mb-6">
            {state.userCountLoading.isLoading ? (
              <div className="bg-spark-light-blue rounded-md p-4 text-center">
                <div className="flex items-center justify-center">
                  <ButtonSpinner size="sm" />
                  <span className="ml-2 text-spark-blue-600">Loading user count...</span>
                </div>
              </div>
            ) : state.userCount !== null ? (
              <div className="bg-spark-light-blue rounded-md p-4">
                <div className="flex items-center justify-center">
                  <Users className="w-5 h-5 text-spark-blue-600 mr-2" />
                  <span className="text-spark-blue-600 font-medium">
                    {state.userCount} users registered
                  </span>
                </div>
                {isUserLimitReached(state.userCount) ? (
                  <div className="mt-2 text-center">
                    <p className="text-red-600 text-sm font-medium">
                      Sign up slots are at limit
                    </p>
                    <p className="text-spark-gray-600 text-sm mt-1">
                      Please use the demo account to try out Daily Spark
                    </p>
                  </div>
                ) : (
                  <div className="mt-2 text-center">
                    <p className="text-spark-gray-600 text-sm">
                      {getRemainingSlots(state.userCount)} spots remaining
                    </p>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Show form only if not at limit, not loading, and not editing */}
          {!shouldShowForm ? (
            <div className="text-center py-8">
              {isUserCountLoading ? (
                <>
                  <div className="w-16 h-16 bg-spark-light-blue rounded-full flex items-center justify-center mx-auto mb-4">
                    <ButtonSpinner size="md" />
                  </div>
                  <h3 className="text-lg font-medium text-spark-gray-900 mb-2">
                    Loading User Count
                  </h3>
                  <p className="text-spark-gray-600 mb-6">
                    Please wait while we check the current user count...
                  </p>
                </>
              ) : isLimitReached ? (
                <>
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-medium text-spark-gray-900 mb-2">
                    Sign Up Currently Unavailable
                  </h3>
                  <p className="text-spark-gray-600 mb-6">
                    We've reached our user limit. Please try again later or use the demo account to explore Daily Spark.
                  </p>
                  <button
                    onClick={() => navigate('/login')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-spark-blue-500 hover:bg-spark-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-spark-blue-500 transition-colors"
                  >
                    Back to Login
                  </button>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-spark-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-spark-gray-600" />
                  </div>
                  <h3 className="text-lg font-medium text-spark-gray-900 mb-2">
                    Unable to Load User Count
                  </h3>
                  <p className="text-spark-gray-600 mb-6">
                    We're unable to verify the current user count. Please try again later.
                  </p>
                  <button
                    onClick={() => navigate('/login')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-spark-blue-500 hover:bg-spark-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-spark-blue-500 transition-colors"
                  >
                    Back to Login
                  </button>
                </>
              )}
            </div>
          ) : (
            <>
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-spark-gray-700">
                    Full Name
                  </label>
                  <div className="mt-1">
                    <input
                      id="name"
                      name="displayName"
                      type="text"
                      required
                      value={formData.displayName}
                      onChange={handleInputChange}
                      className="appearance-none block w-full px-3 py-2 border border-spark-gray-300 rounded-md placeholder-spark-gray-400 focus:outline-none focus:ring-spark-blue-500 focus:border-spark-blue-500 sm:text-sm"
                      placeholder="Enter your full name"
                      disabled={state.operationLoading.isLoading}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-spark-gray-700">
                    Email Address
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="appearance-none block w-full px-3 py-2 border border-spark-gray-300 rounded-md placeholder-spark-gray-400 focus:outline-none focus:ring-spark-blue-500 focus:border-spark-blue-500 sm:text-sm"
                      placeholder="Enter your email address"
                      disabled={state.operationLoading.isLoading}
                    />
                  </div>
                </div>

                {/* User ID */}
                <div>
                  <label htmlFor="userId" className="block text-sm font-medium text-spark-gray-700">
                    User ID
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      id="userId"
                      name="userId"
                      type="text"
                      required
                      value={formData.userId}
                      onChange={handleInputChange}
                      className="flex-1 appearance-none block w-full px-3 py-2 border border-r-0 border-spark-gray-300 rounded-l-md placeholder-spark-gray-400 focus:outline-none focus:ring-spark-blue-500 focus:border-spark-blue-500 sm:text-sm"
                      placeholder="Enter or generate a User ID"
                      disabled={state.operationLoading.isLoading}
                    />
                    <button
                      type="button"
                      onClick={generateUserId}
                      disabled={state.operationLoading.isLoading}
                      className="inline-flex items-center px-3 py-2 border border-l-0 border-spark-gray-300 rounded-r-md bg-spark-gray-50 text-sm font-medium text-spark-gray-700 hover:bg-spark-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-spark-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Generate
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-spark-gray-500">
                    This will be your unique identifier for signing in
                  </p>
                </div>

                {/* Error Message */}
                {state.operationLoading.error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="text-sm text-red-700">{state.operationLoading.error.message}</div>
                  </div>
                )}

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    disabled={state.operationLoading.isLoading || (!isEditing && (state.userCountLoading.isLoading || state.userCount === null))}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-spark-blue-500 hover:bg-spark-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-spark-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {state.operationLoading.isLoading ? (
                      <div className="flex items-center">
                        <ButtonSpinner size="sm" />
                        <span className="ml-2">{isEditing ? 'Updating...' : 'Creating...'}</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Save className="w-4 h-4 mr-2" />
                        {isEditing ? 'Update Profile' : 'Create Profile'}
                      </div>
                    )}
                  </button>
                </div>
              </form>

              {/* Demo Info */}
              {!isEditing && (
                <div className="mt-6 p-4 bg-spark-light-blue rounded-md">
                  <p className="text-sm text-spark-blue-600 text-center">
                    <strong>Demo Mode:</strong> After creating your profile, you can sign in with your User ID
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
