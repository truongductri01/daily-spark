import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { mockApi } from '../services/mockApi';
import { BookOpen, Plus, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { Curriculum } from '../types';

const DashboardPage: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCurricula = async () => {
      if (state.user) {
        try {
          const response = await mockApi.getCurricula(state.user.id);
          if (response.success) {
            dispatch({ type: 'SET_CURRICULA', payload: response.data });
          }
        } catch (error) {
          console.error('Failed to load curricula:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadCurricula();
  }, [state.user, dispatch]);

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spark-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow-sm border border-spark-gray-200 p-6">
        <h1 className="text-3xl font-bold text-spark-gray-800">
          Welcome back, {state.user.displayName}! 🚀
        </h1>
        <p className="mt-2 text-spark-gray-600">
          Ready to continue your learning journey? Here's your progress overview.
        </p>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-spark-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-spark-blue-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-spark-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-spark-gray-600">Total Curricula</p>
              <p className="text-2xl font-bold text-spark-gray-800">{state.curricula.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-spark-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-spark-gray-600">Completed</p>
              <p className="text-2xl font-bold text-spark-gray-800">{statusCounts.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-spark-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-spark-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-spark-gray-800">{statusCounts.inProgress}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-spark-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-spark-orange rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-spark-gray-600">Progress</p>
              <p className="text-2xl font-bold text-spark-gray-800">{progressPercentage}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-spark-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-spark-gray-800">Overall Progress</h3>
          <span className="text-sm text-spark-gray-600">{progressPercentage}% Complete</span>
        </div>
        <div className="w-full bg-spark-gray-200 rounded-full h-3">
          <div
            className="bg-spark-blue-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="mt-2 text-sm text-spark-gray-600">
          {statusCounts.completed} of {totalTopics} topics completed
        </div>
      </div>

      {/* Recent Curricula */}
      <div className="bg-white rounded-lg shadow-sm border border-spark-gray-200">
        <div className="px-6 py-4 border-b border-spark-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-spark-gray-800">Your Curricula</h3>
            <button
              onClick={() => navigate('/upload')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-spark-blue-500 hover:bg-spark-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-spark-blue-500 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New
            </button>
          </div>
        </div>
        
        <div className="divide-y divide-spark-gray-200">
          {state.curricula.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-spark-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-spark-gray-900">No curricula yet</h3>
              <p className="mt-1 text-sm text-spark-gray-500">
                Get started by creating your first learning curriculum.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => navigate('/upload')}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-spark-blue-500 hover:bg-spark-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-spark-blue-500 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Curriculum
                </button>
              </div>
            </div>
          ) : (
            state.curricula.map((curriculum) => (
              <div key={curriculum.id} className="px-6 py-4 hover:bg-spark-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-spark-gray-800">{curriculum.courseTitle}</h4>
                    <p className="text-sm text-spark-gray-600 mt-1">{curriculum.topics.length} topics</p>
                    <div className="flex items-center mt-2 space-x-4 text-sm text-spark-gray-500">
                      <span>{curriculum.topics.length} topics</span>
                      <span>•</span>
                      <span>{curriculum.topics.filter(t => t.status === 'Completed').length} completed</span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/edit/${curriculum.id}`)}
                    className="ml-4 inline-flex items-center px-3 py-2 border border-spark-gray-300 text-sm font-medium rounded-md text-spark-gray-700 bg-white hover:bg-spark-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-spark-blue-500 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
