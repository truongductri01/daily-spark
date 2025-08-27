import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useToastHelpers } from '../components/Toast';
import { CardSkeleton } from '../components/LoadingSpinner';
import { BookOpen, Plus, TrendingUp, Clock, CheckCircle, RefreshCw } from 'lucide-react';
import { isDemoUser } from '../utils/config';

const DashboardPage: React.FC = () => {
  const { state, loadCurricula } = useAppContext();
  const { showError, showSuccess } = useToastHelpers();
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load curricula only if not already loaded
  useEffect(() => {
    const loadData = async () => {
      if (state.user && state.curricula.length === 0) {
        try {
          await loadCurricula(state.user.id);
        } catch (error) {
          console.error('Failed to load curricula:', error);
          showError('Loading Failed', 'Failed to load your curricula. Please try again.');
        }
      }
    };

    loadData();
  }, [state.user, state.curricula.length, loadCurricula, showError]);

  const handleRefresh = async () => {
    if (!state.user) return;
    
    setIsRefreshing(true);
    try {
      await loadCurricula(state.user.id, true); // Force refresh
      showSuccess('Refreshed', 'Dashboard data has been refreshed successfully.');
    } catch (error) {
      console.error('Failed to refresh curricula:', error);
      showError('Refresh Failed', 'Failed to refresh data. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!state.user) {
    return null;
  }

  const getStatusCounts = () => {
    const counts = { completed: 0, inProgress: 0, notStarted: 0 };
    
    state.curricula.forEach(curriculum => {
      curriculum.topics.forEach(topic => {
        switch (topic.status) {
          case 'Completed':
            counts.completed++;
            break;
          case 'InProgress':
            counts.inProgress++;
            break;
          case 'NotStarted':
            counts.notStarted++;
            break;
        }
      });
    });
    
    return counts;
  };

  const getTotalTopics = () => {
    return state.curricula.reduce((total, curriculum) => total + curriculum.topics.length, 0);
  };

  const getProgressPercentage = () => {
    const total = getTotalTopics();
    if (total === 0) return 0;
    const completed = getStatusCounts().completed;
    return Math.round((completed / total) * 100);
  };

  const statusCounts = getStatusCounts();
  const totalTopics = getTotalTopics();
  const progressPercentage = getProgressPercentage();

  // Show loading only if we have no data and are loading
  if (state.curriculaLoading.isLoading && state.curricula.length === 0) {
    return (
      <div className="space-y-8">
        <div className="bg-white rounded-lg shadow-sm border border-spark-gray-200 p-6">
          <CardSkeleton />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-spark-gray-200 p-6">
              <CardSkeleton />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-spark-gray-200 p-6">
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header with Refresh Button */}
      <div className="bg-white rounded-lg shadow-sm border border-spark-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-spark-gray-800">
              Welcome back, {state.user.displayName}! 🚀
            </h1>
            <p className="mt-2 text-spark-gray-600">
              Ready to continue your learning journey? Here's your progress overview.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center px-4 py-2 border border-spark-gray-300 text-sm font-medium rounded-md text-spark-gray-700 bg-white hover:bg-spark-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-spark-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-spark-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BookOpen className="h-8 w-8 text-spark-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-spark-gray-600">Total Curricula</p>
              <p className="text-2xl font-bold text-spark-gray-900">{state.curricula.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-spark-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-spark-gray-600">Overall Progress</p>
              <p className="text-2xl font-bold text-spark-gray-900">{progressPercentage}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-spark-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-spark-gray-600">Total Topics</p>
              <p className="text-2xl font-bold text-spark-gray-900">{totalTopics}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-spark-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-spark-gray-600">Completed</p>
              <p className="text-2xl font-bold text-spark-gray-900">{statusCounts.completed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Curricula */}
      <div className="bg-white rounded-lg shadow-sm border border-spark-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-spark-gray-800">Recent Curricula</h2>
          <button
            onClick={() => navigate('/curricula')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-spark-blue-500 hover:bg-spark-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-spark-blue-500 transition-colors"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            View All
          </button>
        </div>

        {state.curricula.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="mx-auto h-12 w-12 text-spark-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-spark-gray-900">No curricula yet</h3>
            <p className="mt-1 text-sm text-spark-gray-500">
              Get started by creating your first learning curriculum.
            </p>
            <div className="mt-6">
              {!isDemoUser(state.user.id) ? (
                <button
                  onClick={() => navigate('/upload')}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-spark-blue-500 hover:bg-spark-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-spark-blue-500 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Curriculum
                </button>
              ) : (
                <p className="text-sm text-spark-gray-500">
                  Demo mode: Create functionality is disabled
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {state.curricula.slice(0, 6).map((curriculum) => {
              const curriculumProgress = curriculum.topics.length > 0 
                ? Math.round((curriculum.topics.filter(t => t.status === 'Completed').length / curriculum.topics.length) * 100)
                : 0;
              
              return (
                <div key={curriculum.id} className="border border-spark-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-spark-gray-800 line-clamp-2">
                      {curriculum.courseTitle}
                    </h3>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm text-spark-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{curriculumProgress}%</span>
                    </div>
                    <div className="w-full bg-spark-gray-200 rounded-full h-2">
                      <div
                        className="bg-spark-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${curriculumProgress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-spark-gray-500">
                    <span>{curriculum.topics.length} topics</span>
                    <span className="capitalize">{curriculum.status}</span>
                  </div>
                  
                  <div className="mt-4">
                    <button
                      onClick={() => navigate(`/edit/${curriculum.id}`)}
                      className="w-full inline-flex items-center justify-center px-3 py-2 border border-spark-gray-300 text-sm font-medium rounded-md text-spark-gray-700 bg-white hover:bg-spark-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-spark-blue-500 transition-colors"
                    >
                      {isDemoUser(state.user!.id) ? 'View' : 'Continue'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
