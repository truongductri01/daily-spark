export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  question: string;
  resources: string[];
  status: 'NotStarted' | 'InProgress' | 'Completed';
  order: number;
}

export interface Curriculum {
  id: string;
  courseTitle: string;
  description: string;
  topics: Topic[];
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface CurriculumFormData {
  courseTitle: string;
  description: string;
  topics: Omit<Topic, 'id' | 'order'>[];
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface LoginFormData {
  userId: string;
}

export interface ProfileFormData {
  name: string;
  email: string;
  userId: string;
}
