import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useToastHelpers } from '../components/Toast';
import { CardSkeleton } from '../components/LoadingSpinner';
import { BookOpen, Edit, Trash2, Plus, Calendar, Clock, RefreshCw } from 'lucide-react';
import { Curriculum } from '../types';
import { isDemoUser } from '../utils/config';

const CurriculumListPage: React.FC = () => {
  const { state, loadCurricula, deleteCurriculum } = useAppContext();
  const { showSuccess, showError } = useToastHelpers();
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Load curricula only if not already loaded
  useEffect(() => {
    const loadData = async () => {
      if (state.user && !state.curriculaLoaded && !state.curriculaLoading.isLoading) {
        try {
          await loadCurricula(state.user.id);
        } catch (error) {
          console.error('Failed to load curricula:', error);
          showError('Loading Failed', 'Failed to load your curricula. Please try again.');
        }
      }
    };

    loadData();
  }, [state.user, state.curriculaLoaded, state.curriculaLoading.isLoading, loadCurricula, showError]);

  const handleRefresh = async () => {
    if (!state.user) return;
    
    setIsRefreshing(true);
    try {
      await loadCurricula(state.user.id, true); // Force refresh
      showSuccess('Refreshed', 'Curriculum list has been refreshed successfully.');
    } catch (error) {
      console.error('Failed to refresh curricula:', error);
      showError('Refresh Failed', 'Failed to refresh data. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDelete = async (curriculumId: string) => {
    if (!state.user) return;
    
    try {
      await deleteCurriculum(curriculumId, state.user.id);
      setDeleteConfirm(null);
      showSuccess('Curriculum Deleted', 'Curriculum has been deleted successfully.');
    } catch (error) {
      console.error('Failed to delete curriculum:', error);
      showError('Delete Failed', 'Failed to delete curriculum. Please try again.');
    }
  };

  const getStatusCounts = (curriculum: Curriculum) => {
    const counts = { completed: 0, inProgress: 0, notStarted: 0 };
    
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
    
    return counts;
  };

  const getProgressPercentage = (curriculum: Curriculum) => {
    const total = curriculum.topics.length;
    if (total === 0) return 0;
    const completed = getStatusCounts(curriculum).completed;
    return Math.round((completed / total) * 100);
  };

  if (!state.user) {
    return null;
  }

  // Show loading only if we have no data and are loading
  if (state.curriculaLoading.isLoading && state.curricula.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <CardSkeleton />
          </div>
          <div className="w-32 h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-spark-gray-200 overflow-hidden">
              <div className="p-6">
                <CardSkeleton />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="curriculum-list-page space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-spark-gray-800">My Curricula</h1>
          <p className="mt-2 text-spark-gray-600">
            Manage and track your learning curricula
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center px-4 py-2 border border-spark-gray-300 text-sm font-medium rounded-md text-spark-gray-700 bg-white hover:bg-spark-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-spark-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          {!isDemoUser(state.user.id) && (
            <button
              onClick={() => navigate('/upload')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-spark-blue-500 hover:bg-spark-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-spark-blue-500 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New
            </button>
          )}
        </div>
      </div>

      {/* Curricula Grid */}
      {state.curricula.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-spark-gray-200 p-12 text-center">
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
          {state.curricula.map((curriculum) => {
            const statusCounts = getStatusCounts(curriculum);
            const progressPercentage = getProgressPercentage(curriculum);
            
            return (
              <div key={curriculum.id} className="bg-white rounded-lg shadow-sm border border-spark-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="p-6 border-b border-spark-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-spark-gray-800 mb-2">
                        {curriculum.courseTitle}
                      </h3>
                      <p className="text-sm text-spark-gray-600 line-clamp-2">
                        {curriculum.topics.length} topics
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-spark-gray-700">Progress</span>
                    <span className="text-sm text-spark-gray-600">{progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-spark-gray-200 rounded-full h-2">
                    <div
                      className="bg-spark-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  
                  {/* Status Summary */}
                  <div className="flex items-center justify-between mt-4 text-sm text-spark-gray-600">
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      {statusCounts.completed} completed
                    </span>
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      {statusCounts.inProgress} in progress
                    </span>
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                      {statusCounts.notStarted} not started
                    </span>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-spark-gray-50 border-t border-spark-gray-200">
                  <div className="flex items-center justify-between text-sm text-spark-gray-500 mb-3">
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {curriculum.topics.length} topics
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {curriculum.status}
                    </span>
                  </div>
                  
                  <div className="flex space-x-2">
                    {!isDemoUser(state.user!.id) ? (
                      <>
                        <button
                          onClick={() => navigate(`/edit/${curriculum.id}`)}
                          className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-spark-gray-300 text-sm font-medium rounded-md text-spark-gray-700 bg-white hover:bg-spark-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-spark-blue-500 transition-colors"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(curriculum.id)}
                          className="inline-flex items-center justify-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => navigate(`/edit/${curriculum.id}`)}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-spark-gray-300 text-sm font-medium rounded-md text-spark-gray-700 bg-white hover:bg-spark-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-spark-blue-500 transition-colors"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        View
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-spark-gray-900 mb-4">
              Delete Curriculum
            </h3>
            <p className="text-sm text-spark-gray-600 mb-6">
              Are you sure you want to delete this curriculum? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-spark-gray-300 text-sm font-medium rounded-md text-spark-gray-700 bg-white hover:bg-spark-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-spark-blue-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurriculumListPage;
