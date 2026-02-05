export interface Expense {
  id: string
  userId: string
  category: string
  item: string
  estimatedCost: number
  actualCost: number
  paid: boolean
  notes?: string
  createdAt: string
  updatedAt?: string
}