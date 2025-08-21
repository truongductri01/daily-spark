import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { mockApi } from '../services/mockApi';
import { Upload, FileText, Eye, Save, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { CurriculumFormData, Topic } from '../types';

const CurriculumUploadPage: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const [jsonContent, setJsonContent] = useState('');
  const [parsedData, setParsedData] = useState<CurriculumFormData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Normalize arbitrary parsed JSON into a safe CurriculumFormData shape for preview
  const normalizeCurriculumForPreview = (input: any): CurriculumFormData => {
    const safeTopics = Array.isArray(input?.topics)
      ? input.topics.map((t: any) => ({
          title: typeof t?.title === 'string' ? t.title : '',
          description: typeof t?.description === 'string' ? t.description : '',
          estimatedTime: typeof t?.estimatedTime === 'string' ? t.estimatedTime : '',
          question: typeof t?.question === 'string' ? t.question : '',
          resources: Array.isArray(t?.resources) ? t.resources : [],
          status: 'NotStarted' as const,
        }))
      : [];

    return {
      courseTitle: typeof input?.courseTitle === 'string' ? input.courseTitle : '',
      description: typeof input?.description === 'string' ? input.description : '',
      topics: safeTopics,
    };
  };

  const handleJsonInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    setJsonContent(content);
    
    if (!content.trim()) {
      setParsedData(null);
      setError('');
      return;
    }

    try {
      // Quick pre-parse validation: enforce object root
      const firstNonWs = content.trim()[0];
      if (firstNonWs !== '{') {
        setError('Root JSON value must be an object (e.g., { ... })');
        setParsedData(null);
        return;
      }

      const parsed = JSON.parse(content);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        setError('Root JSON value must be an object (e.g., { ... })');
        setParsedData(null);
        return;
      }

      setParsedData(normalizeCurriculumForPreview(parsed));
      setError('');
    } catch (err) {
      setError('Invalid JSON format. Please check your syntax.');
      setParsedData(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setJsonContent(content);
        try {
          // Quick pre-parse validation: enforce object root
          const firstNonWs = content.trim()[0];
          if (firstNonWs !== '{') {
            setError('Root JSON value must be an object (e.g., { ... })');
            setParsedData(null);
            return;
          }

          const parsed = JSON.parse(content);
          if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
            setError('Root JSON value must be an object (e.g., { ... })');
            setParsedData(null);
            return;
          }

          setParsedData(normalizeCurriculumForPreview(parsed));
          setError('');
        } catch (err) {
          setError('Invalid JSON format in uploaded file. Please check the file content.');
          setParsedData(null);
        }
      };
      reader.onerror = () => {
        setError('Error reading file. Please try again.');
        setParsedData(null);
      };
      reader.readAsText(file);
    }
  };

  const validateCurriculumData = (data: any): CurriculumFormData | null => {
    // Check if data is null, undefined, or not an object
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      setError('Invalid curriculum data: must be a valid JSON object');
      return null;
    }

    // Check if data is an empty object
    if (Object.keys(data).length === 0) {
      setError('Curriculum data cannot be empty. Please provide courseTitle, description, and topics');
      return null;
    }

    // Check for required fields with better error handling
    if (!data.courseTitle || data.courseTitle === null || data.courseTitle === undefined) {
      setError('Missing required field: courseTitle');
      return null;
    }

    if (typeof data.courseTitle !== 'string' || data.courseTitle.trim() === '') {
      setError('courseTitle must be a non-empty string');
      return null;
    }

    if (!data.description || data.description === null || data.description === undefined) {
      setError('Missing required field: description');
      return null;
    }

    if (typeof data.description !== 'string' || data.description.trim() === '') {
      setError('description must be a non-empty string');
      return null;
    }

    if (!Array.isArray(data.topics)) {
      setError('Missing or invalid required field: topics must be an array');
      return null;
    }

    if (data.topics.length === 0) {
      setError('Curriculum must have at least one topic');
      return null;
    }

    // Validate each topic with better error handling
    for (let i = 0; i < data.topics.length; i++) {
      const topic = data.topics[i];
      
      // Check if topic is a valid object
      if (!topic || typeof topic !== 'object' || Array.isArray(topic)) {
        setError(`Topic ${i + 1} is invalid: must be a valid object`);
        return null;
      }

      // Check required topic fields
      if (!topic.title || topic.title === null || topic.title === undefined) {
        setError(`Topic ${i + 1} is missing required field: title`);
        return null;
      }

      if (typeof topic.title !== 'string' || topic.title.trim() === '') {
        setError(`Topic ${i + 1} title must be a non-empty string`);
        return null;
      }

      if (!topic.description || topic.description === null || topic.description === undefined) {
        setError(`Topic ${i + 1} is missing required field: description`);
        return null;
      }

      if (typeof topic.description !== 'string' || topic.description.trim() === '') {
        setError(`Topic ${i + 1} description must be a non-empty string`);
        return null;
      }

      if (!topic.estimatedTime || topic.estimatedTime === null || topic.estimatedTime === undefined) {
        setError(`Topic ${i + 1} is missing required field: estimatedTime`);
        return null;
      }

      if (typeof topic.estimatedTime !== 'string' || topic.estimatedTime.trim() === '') {
        setError(`Topic ${i + 1} estimatedTime must be a non-empty string`);
        return null;
      }

      if (!topic.question || topic.question === null || topic.question === undefined) {
        setError(`Topic ${i + 1} is missing required field: question`);
        return null;
      }

      if (typeof topic.question !== 'string' || topic.question.trim() === '') {
        setError(`Topic ${i + 1} question must be a non-empty string`);
        return null;
      }
      
      // Check if resources is an array, default to empty array if missing
      if (topic.resources !== undefined && !Array.isArray(topic.resources)) {
        setError(`Topic ${i + 1} resources must be an array`);
        return null;
      }
    }

    return {
      courseTitle: data.courseTitle.trim(),
      description: data.description.trim(),
      topics: data.topics.map((topic: any, index: number) => ({
        title: topic.title.trim(),
        description: topic.description.trim(),
        estimatedTime: topic.estimatedTime.trim(),
        question: topic.question.trim(),
        resources: topic.resources || [],
        status: 'NotStarted' as const
      }))
    };
  };

  const handleCreateCurriculum = async () => {
    if (!parsedData) {
      setError('Please provide valid curriculum data');
      return;
    }

    const validatedData = validateCurriculumData(parsedData);
    if (!validatedData) {
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await mockApi.createCurriculum(validatedData);
      if (response.success) {
        dispatch({ type: 'ADD_CURRICULUM', payload: response.data });
        setSuccess('Curriculum created successfully! Redirecting to dashboard...');
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        setError(response.message || 'Failed to create curriculum');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'InProgress':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>;
      default:
        return <div className="w-4 h-4 border-2 border-yellow-500 rounded-full"></div>;
    }
  };

  if (!state.user) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-spark-gray-600 hover:text-spark-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
          <div>
            <h1 className="text-3xl font-bold text-spark-gray-800">Create New Curriculum</h1>
            <p className="mt-2 text-spark-gray-600">
              Upload JSON data or paste content to create a new learning curriculum
            </p>
          </div>
        </div>
      </div>

      {/* Split Screen Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side - JSON Input */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm border border-spark-gray-200 p-6">
            <h3 className="text-lg font-medium text-spark-gray-800 mb-4 flex items-center">
              <Upload className="w-5 h-5 mr-2" />
              Upload JSON Data
            </h3>
            
            {/* File Upload */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-spark-gray-700 mb-2">
                Upload JSON File
              </label>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="block w-full text-sm text-spark-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-spark-blue-50 file:text-spark-blue-700 hover:file:bg-spark-blue-100"
              />
            </div>

            {/* JSON Input */}
            <div>
              <label className="block text-sm font-medium text-spark-gray-700 mb-2">
                Or Paste JSON Content
              </label>
              <textarea
                value={jsonContent}
                onChange={handleJsonInput}
                placeholder="Paste your curriculum JSON data here..."
                className="w-full h-64 px-3 py-2 border border-spark-gray-300 rounded-md placeholder-spark-gray-400 focus:outline-none focus:ring-spark-blue-500 focus:border-spark-blue-500 font-mono text-sm resize-none"
              />
            </div>

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {error}
                </div>
              </div>
            )}

            {/* Success Display */}
            {success && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center text-sm text-green-700">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {success}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Preview */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm border border-spark-gray-200 p-6">
            <h3 className="text-lg font-medium text-spark-gray-800 mb-4 flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              Curriculum Preview
            </h3>

            {!parsedData ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-spark-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-spark-gray-900">No Data to Preview</h3>
                <p className="mt-1 text-sm text-spark-gray-500">
                  Upload a JSON file or paste content to see the preview
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Curriculum Header */}
                <div className="border-b border-spark-gray-200 pb-4">
                  <h4 className="text-xl font-semibold text-spark-blue-600 mb-2">
                    {parsedData.courseTitle}
                  </h4>
                  <p className="text-spark-gray-600">{parsedData.description}</p>
                  <div className="mt-2 text-sm text-spark-gray-500">
                    {parsedData.topics.length} topics
                  </div>
                </div>

                {/* Topics List */}
                <div className="space-y-3">
                  {parsedData.topics.map((topic, index) => (
                    <div key={index} className="border border-spark-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-medium text-spark-gray-800">
                          {index + 1}. {topic.title}
                        </h5>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(topic.status)}
                          <span className="text-xs text-spark-gray-500">
                            {topic.estimatedTime}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-spark-gray-600 mb-2">
                        {topic.description}
                      </p>
                      
                      <div className="text-sm text-spark-gray-700 mb-2">
                        <strong>Question:</strong> {topic.question}
                      </div>
                      
                      {topic.resources && topic.resources.length > 0 && (
                        <div className="text-sm text-spark-gray-700">
                          <strong>Resources:</strong>
                          <ul className="mt-1 space-y-1">
                            {topic.resources.map((resource, resIndex) => (
                              <li key={resIndex} className="text-spark-blue-600 hover:underline">
                                <a href={resource} target="_blank" rel="noopener noreferrer">
                                  {resource}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Create Button */}
                <div className="pt-4 border-t border-spark-gray-200">
                  <button
                    onClick={handleCreateCurriculum}
                    disabled={isLoading || !parsedData}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-spark-blue-500 hover:bg-spark-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-spark-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating Curriculum...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Save className="w-4 h-4 mr-2" />
                        Create New Curriculum
                      </div>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurriculumUploadPage;
