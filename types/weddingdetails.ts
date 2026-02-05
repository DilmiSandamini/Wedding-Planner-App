export interface WeddingPlan {
  userId: string
  planName: string
  coupleName: string
  weddingDate: string
  budget: string
  guests: number
  location: string
  isSetupComplete: boolean
  updatedAt: string
  createdAt?: string
}

export interface WeddingFormInputs {
  planName: string
  coupleName: string
  weddingDate: Date
  budget: string
  guests: string
  location: string
}