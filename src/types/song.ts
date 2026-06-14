import type { Timestamp } from 'firebase/firestore'

export interface Song {
  id: string
  title: string
  singerIds: string[]
  singerNames: string[]
  /** @deprecated Ca sĩ đầu tiên, giữ lại để tương thích ngược */
  singerId: string
  /** @deprecated Tên ca sĩ đầu tiên, giữ lại để tương thích ngược */
  singerName: string
  thumbnailUrl: string
  audioUrl: string
  lyricUrl: string
  duration: number
  categoryId: string
  categoryName: string
  views: number
  createdAt: Timestamp
}

export interface CreateSongInput {
  title: string
  singerIds: string[]
  singerNames: string[]
  singerId: string
  singerName: string
  thumbnailUrl: string
  audioUrl: string
  lyricUrl: string
  duration: number
  categoryId: string
  categoryName: string
}

export type UpdateSongInput = CreateSongInput

export type SongSortField = 'createdAt' | 'views' | 'duration'
export type SortDirection = 'asc' | 'desc'

export interface SongsQueryParams {
  pageSize: number
  cursorId?: string | null
  search?: string
  sortBy?: SongSortField
  sortDirection?: SortDirection
}

export interface SongsPageResult {
  songs: Song[]
  lastDocId: string | null
  hasMore: boolean
}
