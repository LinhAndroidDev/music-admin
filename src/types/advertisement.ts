import type { Timestamp } from 'firebase/firestore'

export interface Advertisement {
  id: string
  image: string
  update: string
  detail: string
  createdAt: Timestamp
}

export interface CreateAdvertisementInput {
  image: string
  update: string
  detail: string
}

export type UpdateAdvertisementInput = CreateAdvertisementInput
