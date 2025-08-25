import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { mockApi } from '../services/mockApi';
import { User, Save, ArrowLeft } from 'lucide-react';
import { ProfileFormData } from '../types';

const ProfilePage: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    displayName: '',
    email: '',
    userId: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    
    if (!formData.displayName.trim() || !formData.email.trim() || !formData.userId.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isEditing) {
        // Update existing user
        const updatedUser = { ...state.user, ...formData, id: state.user!.id };
        dispatch({ type: 'SET_USER', payload: updatedUser });
        setSuccess('Profile updated successfully!');
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        // Create new user
        const response = await mockApi.createUser({
          displayName: formData.displayName,
          email: formData.email
        });
        
        if (response.success) {
          dispatch({ type: 'SET_USER', payload: response.data });
          setSuccess('Profile created successfully! Redirecting to dashboard...');
          setTimeout(() => navigate('/dashboard'), 1500);
        } else {
          setError(response.message || 'Failed to create profile');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (state.user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-spark-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center text-spark-gray-600 hover:text-spark-blue-600 transition-colors mb-4"
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
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
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
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={generateUserId}
                  disabled={isLoading}
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
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="text-sm text-green-700">{success}</div>
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-spark-blue-500 hover:bg-spark-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-spark-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isEditing ? 'Updating...' : 'Creating...'}
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
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
