import { User, Curriculum, CurriculumFormData, ApiResponse, TopicStatus, CurriculumStatus } from '../types';

// Mock data
const mockUser: User = {
  id: "first-user",
  displayName: "Demo User",
  email: "demo@example.com"
};

const mockCurricula: Curriculum[] = [
  {
    id: "curriculum-1",
    userId: "first-user",
    courseTitle: "System Design Basics",
    status: CurriculumStatus.InProgress,
    nextReminderDate: "2024-01-20T14:30:00Z",
    topics: [
      {
        id: "topic-1",
        title: "What is System Design?",
        description: "An overview of system design concepts and principles",
        estimatedTime: 600, // 10 minutes in seconds
        question: "Explain the difference between high-level and low-level design",
        resources: ["https://example.com/system-design-intro"],
        status: TopicStatus.Completed
      },
      {
        id: "topic-2",
        title: "High-Level vs Low-Level Design",
        description: "Understanding different levels of system design",
        estimatedTime: 900, // 15 minutes in seconds
        question: "When would you choose high-level over low-level design?",
        resources: ["https://example.com/design-levels"],
        status: TopicStatus.InProgress
      },
      {
        id: "topic-3",
        title: "Scalability Patterns",
        description: "Common patterns for building scalable systems",
        estimatedTime: 1200, // 20 minutes in seconds
        question: "What are the main scalability challenges in distributed systems?",
        resources: ["https://example.com/scalability-patterns"],
        status: TopicStatus.NotStarted
      },
      {
        id: "topic-4",
        title: "Database Design Principles",
        description: "Best practices for database design and optimization",
        estimatedTime: 1500, // 25 minutes in seconds
        question: "How do you choose between different database types?",
        resources: ["https://example.com/database-design"],
        status: TopicStatus.InProgress
      },
      {
        id: "topic-5",
        title: "System Architecture Best Practices",
        description: "Industry best practices for system architecture",
        estimatedTime: 1800, // 30 minutes in seconds
        question: "What are the key principles of good system architecture?",
        resources: ["https://example.com/architecture-best-practices"],
        status: TopicStatus.NotStarted
      }
    ]
  }
];

// Mock API service
export const mockApi = {
  // User management
  getUser: async (userId: string): Promise<ApiResponse<User>> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (userId === "first-user") {
      return {
        data: mockUser,
        success: true
      };
    }
    
    return {
      data: null as any,
      success: false,
      message: "User not found"
    };
  },

  createUser: async (userData: Omit<User, 'id'>): Promise<ApiResponse<User>> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newUser: User = {
      ...userData,
      id: "first-user"
    };
    
    return {
      data: newUser,
      success: true,
      message: "User created successfully"
    };
  },

  // Curriculum management
  getCurricula: async (userId: string): Promise<ApiResponse<Curriculum[]>> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    if (userId === "first-user") {
      return {
        data: mockCurricula,
        success: true
      };
    }
    
    return {
      data: [],
      success: true
    };
  },

  createCurriculum: async (curriculumData: CurriculumFormData): Promise<ApiResponse<Curriculum>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newCurriculum: Curriculum = {
      ...curriculumData,
      id: `curriculum-${Date.now()}`,
      topics: curriculumData.topics.map((topic, index) => ({
        ...topic,
        id: `topic-${Date.now()}-${index}`
      })),
      userId: "first-user"
    };
    
    mockCurricula.push(newCurriculum);
    
    return {
      data: newCurriculum,
      success: true,
      message: "Curriculum created successfully"
    };
  },

  updateCurriculum: async (id: string, curriculumData: Partial<Curriculum>): Promise<ApiResponse<Curriculum>> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const index = mockCurricula.findIndex(c => c.id === id);
    if (index === -1) {
      return {
        data: null as any,
        success: false,
        message: "Curriculum not found"
      };
    }
    
    const updatedCurriculum = {
      ...mockCurricula[index],
      ...curriculumData,
      updatedAt: new Date().toISOString()
    };
    
    mockCurricula[index] = updatedCurriculum;
    
    return {
      data: updatedCurriculum,
      success: true,
      message: "Curriculum updated successfully"
    };
  },

  deleteCurriculum: async (id: string): Promise<ApiResponse<{ success: boolean }>> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const index = mockCurricula.findIndex(c => c.id === id);
    if (index === -1) {
      return {
        data: { success: false },
        success: false,
        message: "Curriculum not found"
      };
    }
    
    mockCurricula.splice(index, 1);
    
    return {
      data: { success: true },
      success: true,
      message: "Curriculum deleted successfully"
    };
  }
};
