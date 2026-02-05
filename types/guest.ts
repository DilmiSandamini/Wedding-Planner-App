export type GuestSide = 'Bride' | 'Groom' | 'Both'

export interface Guest {
  id: string
  userId: string
  name: string
  email?: string
  phone?: string
  relationship: string
  side: GuestSide
  invited: boolean
  confirmed: boolean
  attending: boolean
  plusOne: boolean
  tableNumber?: number
  createdAt: string
  updatedAt?: string
}