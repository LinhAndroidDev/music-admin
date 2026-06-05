export interface Singer {
  id: string
  name: string
  avatarUrl: string
  description: string
}

export interface CreateSingerInput {
  name: string
  avatarUrl: string
  description: string
}

export interface UpdateSingerInput {
  name: string
  avatarUrl: string
  description: string
}
