export enum Priority {
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
}

export interface Todo {
  id: string;
  userId: string;
  title: string;
  description: string;
  priority: Priority;
  dueDate: string;
  completed: boolean;
  createdAt: string;
}
