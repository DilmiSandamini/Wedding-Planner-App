export type PriorityLevel = 'high' | 'medium' | 'low'

export interface ChecklistItem {
  id: string
  userId: string
  title: string
  category: string
  completed: boolean
  priority: PriorityLevel
  createdAt: string
  updatedAt?: string
}