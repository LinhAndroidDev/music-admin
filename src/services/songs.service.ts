import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  updateDoc,
  where,
  type QueryConstraint,
} from 'firebase/firestore'
import { db } from '../config/firebase'
import type {
  CreateSongInput,
  Song,
  SongsPageResult,
  SongsQueryParams,
  SortDirection,
  SongSortField,
  UpdateSongInput,
} from '../types/song'

const COLLECTION = 'songs'

const DEFAULT_SORT: SongSortField = 'createdAt'
const DEFAULT_DIRECTION: SortDirection = 'desc'

function mapSong(id: string, data: Record<string, unknown>): Song {
  const singerId = (data.singerId as string) ?? ''
  const singerName = (data.singerName as string) ?? ''
  const singerIds =
    (data.singerIds as string[] | undefined) ?? (singerId ? [singerId] : [])
  const singerNames =
    (data.singerNames as string[] | undefined) ?? (singerName ? [singerName] : [])
  return {
    id,
    title: (data.title as string) ?? '',
    singerIds,
    singerNames,
    singerId: singerId || singerIds[0] || '',
    singerName: singerName || singerNames[0] || '',
    thumbnailUrl: (data.thumbnailUrl as string) ?? '',
    audioUrl: (data.audioUrl as string) ?? '',
    lyricUrl: (data.lyricUrl as string) ?? '',
    duration: (data.duration as number) ?? 0,
    categoryId: (data.categoryId as string) ?? '',
    categoryName: (data.categoryName as string) ?? '',
    views: (data.views as number) ?? 0,
    createdAt: data.createdAt as Song['createdAt'],
  }
}

async function getCursorDoc(cursorId: string) {
  const snap = await getDoc(doc(db, COLLECTION, cursorId))
  return snap.exists() ? snap : null
}

function toFirestoreDirection(direction: SortDirection): 'asc' | 'desc' {
  return direction === 'asc' ? 'asc' : 'desc'
}

function sortSongsClient(
  songs: Song[],
  sortBy: SongSortField,
  sortDirection: SortDirection,
): Song[] {
  const dir = sortDirection === 'asc' ? 1 : -1
  return [...songs].sort((a, b) => {
    if (sortBy === 'createdAt') {
      const aTime = a.createdAt?.toMillis?.() ?? 0
      const bTime = b.createdAt?.toMillis?.() ?? 0
      return (aTime - bTime) * dir
    }
    if (sortBy === 'views') {
      return (a.views - b.views) * dir
    }
    return (a.duration - b.duration) * dir
  })
}

/**
 * Lọc theo category chỉ dùng equality (không cần composite index).
 * Sort / search / phân trang xử lý phía client.
 */
async function fetchSongsByCategoryPage(
  params: SongsQueryParams,
): Promise<SongsPageResult> {
  const {
    pageSize,
    categoryId,
    search,
    page = 0,
    sortBy = DEFAULT_SORT,
    sortDirection = DEFAULT_DIRECTION,
  } = params

  const snapshot = await getDocs(
    query(collection(db, COLLECTION), where('categoryId', '==', categoryId)),
  )

  let songs = snapshot.docs.map((d) => mapSong(d.id, d.data()))

  const term = search?.trim().toLowerCase()
  if (term) {
    songs = songs.filter((s) => s.title.toLowerCase().includes(term))
  }

  songs = sortSongsClient(songs, sortBy, sortDirection)

  const start = page * pageSize
  const pageSongs = songs.slice(start, start + pageSize)

  return {
    songs: pageSongs,
    lastDocId: null,
    hasMore: start + pageSize < songs.length,
  }
}

export async function fetchSongsPage(params: SongsQueryParams): Promise<SongsPageResult> {
  const {
    pageSize,
    cursorId,
    search,
    categoryId,
    sortBy = DEFAULT_SORT,
    sortDirection = DEFAULT_DIRECTION,
  } = params

  // Lọc category: equality-only trên Firestore → tránh composite index
  if (categoryId) {
    return fetchSongsByCategoryPage(params)
  }

  const constraints: QueryConstraint[] = []

  if (search?.trim()) {
    const term = search.trim()
    constraints.push(where('title', '>=', term))
    constraints.push(where('title', '<=', term + '\uf8ff'))
    constraints.push(orderBy('title'))
  } else {
    constraints.push(orderBy(sortBy, toFirestoreDirection(sortDirection)))
  }

  if (cursorId) {
    const cursor = await getCursorDoc(cursorId)
    if (cursor) {
      constraints.push(startAfter(cursor))
    }
  }

  constraints.push(limit(pageSize + 1))

  const q = query(collection(db, COLLECTION), ...constraints)
  const snapshot = await getDocs(q)
  const docs = snapshot.docs
  const hasMore = docs.length > pageSize
  const pageDocs = hasMore ? docs.slice(0, pageSize) : docs

  return {
    songs: pageDocs.map((d) => mapSong(d.id, d.data())),
    lastDocId: pageDocs.length > 0 ? pageDocs[pageDocs.length - 1].id : null,
    hasMore,
  }
}

export async function createSong(input: CreateSongInput): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...input,
    views: 0,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateSong(id: string, input: UpdateSongInput): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), { ...input })
}

export async function deleteSong(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id))
}

export async function fetchTopSongs(limitCount = 10): Promise<Song[]> {
  const q = query(
    collection(db, COLLECTION),
    orderBy('views', 'desc'),
    limit(limitCount),
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => mapSong(d.id, d.data()))
}

/** Bài hát của một ca sĩ (singerIds array-contains + singerId legacy). */
export async function fetchSongsBySinger(singerId: string): Promise<Song[]> {
  const [arraySnap, legacySnap] = await Promise.all([
    getDocs(
      query(collection(db, COLLECTION), where('singerIds', 'array-contains', singerId)),
    ),
    getDocs(query(collection(db, COLLECTION), where('singerId', '==', singerId))),
  ])

  const byId = new Map<string, Song>()
  for (const d of [...arraySnap.docs, ...legacySnap.docs]) {
    if (!byId.has(d.id)) {
      byId.set(d.id, mapSong(d.id, d.data()))
    }
  }

  return Array.from(byId.values()).sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() ?? 0
    const bTime = b.createdAt?.toMillis?.() ?? 0
    return bTime - aTime
  })
}
