import React, { useState } from 'react';
import { X, Copy, Check, HelpCircle } from 'lucide-react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TutorialStep {
  id: number;
  title: string;
  content: React.ReactNode;
}

const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  const promptTemplate = `I have a problem or project I want to solve:

Problem Statement: [Your project or problem you want to solve]
Time Range: [How long do you want to take to complete this?]
Daily Commitment: [How much time do you want to spend on this each day?]

You are a Learning Partner AI. Your task is to help me create a curriculum that will guide me to complete this project or solve this problem. Structure the learning plan in a clean JSON format. Each topic should include:

- title (string)
- description (string)
- estimatedTime (number of seconds)
- question (a question or exercise to confirm my knowledge, string)
- resources (an array of any relevant resources)

Return only JSON in the following format:

{
  "courseTitle": "",
  "topics": [
      {
        "title": "",
        "description": "",
        "estimatedTime": 0,
        "question": "",
        "resources": []
      }
    ]
}`;

  const copyToClipboard = async (text: string, stepNumber: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStep(stepNumber);
      setTimeout(() => setCopiedStep(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const tutorialSteps: TutorialStep[] = [
    {
      id: 1,
      title: "Define Your Learning Goal",
      content: (
        <div className="space-y-4">
          <p className="text-spark-gray-700">
            Start by determining the problem you want to solve or question you want to answer that might take a long time. 
            Note down the estimated time to complete and your daily commitment.
          </p>
          
          <div className="bg-spark-blue-50 border border-spark-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-spark-blue-800 mb-2">Example:</h4>
            <p className="text-spark-blue-700">
              "I want to create a simple Todo List Web app with React" in 7 days with 2 hours daily
            </p>
          </div>
          
          <div className="bg-spark-gray-50 border border-spark-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-spark-gray-800 mb-2">Your Turn:</h4>
            <p className="text-spark-gray-700">
              Think about what you want to learn and write down:
            </p>
            <ul className="list-disc list-inside text-spark-gray-700 mt-2 space-y-1">
              <li>Your specific goal or problem</li>
              <li>How long you want to take</li>
              <li>How much time per day you can commit</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "Use the AI Prompt Template",
      content: (
        <div className="space-y-4">
          <p className="text-spark-gray-700">
            Use the following prompt template and adjust the content to match your learning goals from Step 1.
          </p>
          
          <div className="bg-spark-gray-50 border border-spark-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-spark-gray-800">Prompt Template</h4>
              <button
                onClick={() => copyToClipboard(promptTemplate, 2)}
                className="flex items-center px-3 py-1 text-sm bg-spark-blue-500 text-white rounded-md hover:bg-spark-blue-600 transition-colors"
              >
                {copiedStep === 2 ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <pre className="text-sm text-spark-gray-700 whitespace-pre-wrap font-mono bg-white p-3 rounded border overflow-x-auto">
              {promptTemplate}
            </pre>
          </div>
          
          <div className="bg-spark-blue-50 border border-spark-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-spark-blue-800 mb-2">How to use:</h4>
            <ol className="list-decimal list-inside text-spark-blue-700 space-y-1">
              <li>Copy the prompt template above</li>
              <li>Replace the placeholders with your specific details</li>
              <li>Send it to ChatGPT or your preferred AI assistant</li>
              <li>Wait for the JSON response</li>
            </ol>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: "Paste and Create",
      content: (
        <div className="space-y-4">
          <p className="text-spark-gray-700">
            Copy and paste the generated curriculum (as JSON) into the input box. If valid, it should show you a preview of the curriculum.
          </p>
          
          <div className="bg-spark-gray-50 border border-spark-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-spark-gray-800 mb-2">Example JSON Response:</h4>
            <pre className="text-sm text-spark-gray-700 whitespace-pre-wrap font-mono bg-white p-3 rounded border overflow-x-auto">
{`{
  "courseTitle": "React Todo App Development",
  "topics": [
    {
      "title": "React Basics",
      "description": "Learn fundamental React concepts and JSX",
      "estimatedTime": 3600,
      "question": "What is JSX and how does it differ from HTML?",
      "resources": ["https://react.dev/learn", "https://react.dev/learn/jsx"]
    }
  ]
}`}
            </pre>
          </div>
          
          <div className="bg-spark-blue-50 border border-spark-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-spark-blue-800 mb-2">Next Steps:</h4>
            <ol className="list-decimal list-inside text-spark-blue-700 space-y-1">
              <li>Paste the JSON into the left panel</li>
              <li>Review the preview on the right</li>
              <li>Make any adjustments if needed</li>
              <li>Click "Create New Curriculum" when ready</li>
            </ol>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2">💡 Pro Tip:</h4>
            <p className="text-yellow-700">
              The AI will generate a structured learning plan with topics, time estimates, and resources. 
              You can modify the JSON before creating to better fit your needs!
            </p>
          </div>
        </div>
      )
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-spark-gray-200">
          <div className="flex items-center space-x-3">
            <HelpCircle className="w-6 h-6 text-spark-blue-600" />
            <h2 className="text-xl font-semibold text-spark-gray-800">
              How to Create a Curriculum
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-spark-gray-400 hover:text-spark-gray-600 hover:bg-spark-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Navigation */}
        <div className="px-6 py-4 border-b border-spark-gray-200">
          <div className="flex justify-between items-center">
            {tutorialSteps.map((step) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${
                  currentStep === step.id
                    ? 'bg-spark-blue-500 text-white shadow-md'
                    : 'bg-spark-gray-100 text-spark-gray-600 hover:bg-spark-gray-200'
                }`}
              >
                <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-sm font-medium">
                  {step.id}
                </span>
                <span className="font-medium">{step.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {tutorialSteps.find(step => step.id === currentStep)?.content}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-spark-gray-200 bg-spark-gray-50">
          <div className="flex space-x-2">
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-4 py-2 text-spark-gray-600 hover:text-spark-gray-800 hover:bg-white border border-spark-gray-300 rounded-md transition-colors"
              >
                Previous
              </button>
            )}
          </div>
          
          <div className="flex space-x-2">
            {currentStep < tutorialSteps.length && (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-4 py-2 bg-spark-blue-500 text-white hover:bg-spark-blue-600 rounded-md transition-colors"
              >
                Next
              </button>
            )}
            {currentStep === tutorialSteps.length && (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-spark-green-500 text-white hover:bg-spark-green-600 rounded-md transition-colors"
              >
                Got it!
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialModal;
