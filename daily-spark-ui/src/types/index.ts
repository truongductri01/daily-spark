export interface User {
  id: string;
  displayName: string;
  email: string;
  partitionKey?: string;
}

export enum TopicStatus {
  NotStarted = 'NotStarted',
  InProgress = 'InProgress',
  Completed = 'Completed'
}

export enum CurriculumStatus {
  NotStarted = 'NotStarted',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Active = 'Active'
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  estimatedTime: number; // in seconds
  question: string;
  resources: string[];
  status: TopicStatus;
}

export interface Curriculum {
  id: string;
  userId: string;
  courseTitle: string;
  status: CurriculumStatus;
  nextReminderDate: string; // ISO date string
  topics: Topic[];
  partitionKey?: string;
}

export interface CurriculumFormData {
  courseTitle: string;
  status: CurriculumStatus;
  nextReminderDate: string; // ISO date string
  topics: Omit<Topic, 'id'>[];
}

// Request types for API calls
export interface CreateUserRequest {
  id?: string;
  email: string;
  displayName: string;
}

export interface UpdateUserRequest {
  id: string;
  email?: string;
  displayName?: string;
}

export interface CreateCurriculumRequest {
  id?: string;
  userId: string;
  courseTitle: string;
  status: CurriculumStatus;
  nextReminderDate: string; // ISO date string
  topics: Topic[];
}

export interface UpdateCurriculumRequest {
  id: string;
  userId: string;
  courseTitle?: string;
  status?: CurriculumStatus;
  nextReminderDate?: string; // ISO date string
  topics?: Topic[];
}

// Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// Error handling types
export interface ApiError {
  message: string;
  statusCode: number;
  details?: any;
}

export interface LoadingState {
  isLoading: boolean;
  error: ApiError | null;
}

export interface LoginFormData {
  userId: string;
}

export interface ProfileFormData {
  displayName: string;
  email: string;
  userId: string;
}
