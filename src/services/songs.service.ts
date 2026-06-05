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
  UpdateSongInput,
} from '../types/song'

const COLLECTION = 'songs'

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

export async function fetchSongsPage(
  params: SongsQueryParams,
): Promise<SongsPageResult> {
  const { pageSize, cursorId, search } = params
  const constraints: QueryConstraint[] = []

  if (search?.trim()) {
    const term = search.trim()
    constraints.push(where('title', '>=', term))
    constraints.push(where('title', '<=', term + '\uf8ff'))
    constraints.push(orderBy('title'))
  } else {
    constraints.push(orderBy('createdAt', 'desc'))
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

export async function fetchSongsPageNoSearch(
  params: Omit<SongsQueryParams, 'search'>,
): Promise<SongsPageResult> {
  const { pageSize, cursorId } = params
  const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')]

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

export async function fetchSongsPageUnified(
  params: SongsQueryParams,
): Promise<SongsPageResult> {
  if (params.search?.trim()) {
    return fetchSongsPage(params)
  }
  return fetchSongsPageNoSearch(params)
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
