export interface Task {
  id: string
  userId: string
  title: string
  description?: string
  dueDate: string
  completed: boolean
  category: string
  createdAt: string
  updatedAt?: string
}