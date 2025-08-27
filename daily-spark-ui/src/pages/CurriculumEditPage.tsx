import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useToastHelpers } from '../components/Toast';
import { ButtonSpinner, LoadingSpinner } from '../components/LoadingSpinner';
import { ArrowLeft, Save, Trash2, GripVertical, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Curriculum, Topic } from '../types';
import { isDemoUser } from '../utils/config';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Topic Item Component
interface SortableTopicItemProps {
  topic: Topic;
  index: number;
  onStatusChange: (topicId: string, status: Topic['status']) => void;
  onDelete: (topicId: string) => void;
  isDemoUser: boolean;
}

const SortableTopicItem: React.FC<SortableTopicItemProps> = ({ topic, index, onStatusChange, onDelete, isDemoUser }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: topic.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'InProgress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'InProgress':
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border border-spark-gray-200 rounded-lg p-4 mb-3 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start space-x-3">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="flex-shrink-0 cursor-grab active:cursor-grabbing p-1 hover:bg-spark-gray-100 rounded"
        >
          <GripVertical className="w-5 h-5 text-spark-gray-400" />
        </div>

        {/* Topic Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-lg font-medium text-spark-gray-800">
              {index + 1}. {topic.title}
            </h4>
            <div className="flex items-center space-x-2">
              <select
                value={topic.status}
                onChange={(e) => onStatusChange(topic.id, e.target.value as Topic['status'])}
                className="text-sm border border-spark-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-spark-blue-500 focus:border-spark-blue-500"
              >
                <option value="NotStarted">Not Started</option>
                <option value="InProgress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
              {!isDemoUser && (
                <button
                  onClick={() => onDelete(topic.id)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <p className="text-sm text-spark-gray-600 mb-3">{topic.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-spark-gray-700">Estimated Time:</span>
              <span className="ml-2 text-spark-gray-600">{topic.estimatedTime}</span>
            </div>
            <div>
              <span className="font-medium text-spark-gray-700">Status:</span>
              <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(topic.status)}`}>
                {getStatusIcon(topic.status)}
                <span className="ml-1">{topic.status}</span>
              </span>
            </div>
          </div>

          <div className="mt-3">
            <span className="font-medium text-spark-gray-700 text-sm">Question:</span>
            <p className="text-sm text-spark-gray-600 mt-1">{topic.question}</p>
          </div>

          {topic.resources && topic.resources.length > 0 && (
            <div className="mt-3">
              <span className="font-medium text-spark-gray-700 text-sm">Resources:</span>
              <ul className="mt-1 space-y-1">
                {topic.resources.map((resource, resIndex) => (
                  <li key={resIndex}>
                    <a
                      href={resource}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-spark-blue-600 hover:text-spark-blue-800 hover:underline"
                    >
                      {resource}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CurriculumEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, updateCurriculum } = useAppContext();
  const { showSuccess, showError } = useToastHelpers();
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (id && state.curricula.length > 0) {
      const found = state.curricula.find(c => c.id === id);
      if (found) {
        setCurriculum(found);
        setIsLoading(false);
      } else {
        setError('Curriculum not found');
        setIsLoading(false);
      }
    }
  }, [id, state.curricula]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && curriculum) {
      const oldIndex = curriculum.topics.findIndex(t => t.id === active.id);
      const newIndex = curriculum.topics.findIndex(t => t.id === over?.id);

      const newTopics = arrayMove(curriculum.topics, oldIndex, newIndex);
      const updatedCurriculum = {
        ...curriculum,
        topics: newTopics.map((topic, index) => ({ ...topic, order: index + 1 }))
      };
      setCurriculum(updatedCurriculum);
    }
  };

  const handleStatusChange = (topicId: string, newStatus: Topic['status']) => {
    if (curriculum) {
      const updatedTopics = curriculum.topics.map(topic =>
        topic.id === topicId ? { ...topic, status: newStatus } : topic
      );
      setCurriculum({ ...curriculum, topics: updatedTopics });
    }
  };

  const handleDeleteTopic = (topicId: string) => {
    if (curriculum) {
      const updatedTopics = curriculum.topics.filter(topic => topic.id !== topicId);
      setCurriculum({ ...curriculum, topics: updatedTopics });
    }
  };

  const handleSave = async () => {
    if (!curriculum) return;

    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      if (!state.user) {
        setError('User not found. Please log in again.');
        showError('User Error', 'User not found. Please log in again.');
        return;
      }
      
      await updateCurriculum({
        ...curriculum,
        userId: state.user.id
      });
      setSuccess('Curriculum updated successfully!');
      showSuccess('Curriculum Updated', 'Curriculum has been updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('An error occurred. Please try again.');
      showError('Update Failed', 'Failed to update curriculum. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!state.user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" text="Loading curriculum..." />
      </div>
    );
  }

  if (!curriculum) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-spark-gray-900">Curriculum not found</h3>
        <p className="mt-1 text-sm text-spark-gray-500">
          The curriculum you're looking for doesn't exist.
        </p>
        <button
          onClick={() => navigate('/curricula')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-spark-blue-500 hover:bg-spark-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-spark-blue-500 transition-colors"
        >
          Back to Curricula
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <button
            onClick={() => navigate('/curricula')}
            className="flex items-center px-4 py-2 text-spark-gray-700 hover:text-spark-blue-600 hover:bg-spark-blue-50 border border-spark-gray-300 hover:border-spark-blue-300 rounded-lg transition-all duration-200 font-medium text-sm shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Curricula
          </button>
          <div>
            <h1 className="text-3xl font-bold text-spark-gray-800">Edit Curriculum</h1>
            <p className="mt-2 text-spark-gray-600">
              Reorder topics and update their status
            </p>
          </div>
        </div>
        {!isDemoUser(state.user!.id) ? (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-spark-blue-500 hover:bg-spark-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-spark-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? (
              <div className="flex items-center">
                <ButtonSpinner />
                <span className="ml-2">Saving...</span>
              </div>
            ) : (
              <div className="flex items-center">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </div>
            )}
          </button>
        ) : (
          <div className="text-sm text-spark-gray-500 px-4 py-2">
            Demo mode: Edit functionality is disabled
          </div>
        )}
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="text-sm text-green-700">{success}</div>
        </div>
      )}

      {/* Curriculum Info */}
      <div className="bg-white rounded-lg shadow-sm border border-spark-gray-200 p-6">
        <h2 className="text-2xl font-bold text-spark-blue-600 mb-2">{curriculum.courseTitle}</h2>
        <p className="text-spark-gray-600 mb-4">{curriculum.topics.length} topics</p>
        <div className="flex items-center space-x-4 text-sm text-spark-gray-500">
          <span>{curriculum.topics.length} topics</span>
          <span>•</span>
          <span>Status: {curriculum.status}</span>
        </div>
      </div>

      {/* Topics List */}
      <div className="bg-white rounded-lg shadow-sm border border-spark-gray-200 p-6">
        <h3 className="text-lg font-medium text-spark-gray-800 mb-4">Topics</h3>
        
        {curriculum.topics.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-spark-gray-500">No topics found in this curriculum.</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={curriculum.topics.map(t => t.id)}
              strategy={verticalListSortingStrategy}
            >
              {curriculum.topics.map((topic, index) => (
                <SortableTopicItem
                  key={topic.id}
                  topic={topic}
                  index={index}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDeleteTopic}
                  isDemoUser={isDemoUser(state.user!.id)}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-spark-light-blue rounded-lg p-4">
        <h4 className="font-medium text-spark-blue-800 mb-2">How to use:</h4>
        <ul className="text-sm text-spark-blue-700 space-y-1">
          <li>• Drag and drop topics to reorder them using the grip handle</li>
          <li>• Change topic status using the dropdown menu</li>
          <li>• Delete topics using the trash icon</li>
          <li>• Click "Save Changes" to persist your updates</li>
        </ul>
      </div>
    </div>
  );
};

export default CurriculumEditPage;
