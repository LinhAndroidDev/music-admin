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
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../config/firebase'
import type { CreateSingerInput, Singer, UpdateSingerInput } from '../types/singer'

const COLLECTION = 'singers'

function mapSinger(id: string, data: Record<string, unknown>): Singer {
  return {
    id,
    name: (data.name as string) ?? '',
    avatarUrl: (data.avatarUrl as string) ?? '',
    description: (data.description as string) ?? '',
  }
}

export async function fetchSingers(): Promise<Singer[]> {
  const q = query(collection(db, COLLECTION), orderBy('name', 'asc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => mapSinger(d.id, d.data()))
}

export async function createSinger(input: CreateSingerInput): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), input)
  return ref.id
}

export async function updateSinger(
  id: string,
  input: UpdateSingerInput,
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), { ...input })
}

export async function deleteSinger(id: string): Promise<void> {
  const hasSongs = await singerHasSongs(id)
  if (hasSongs) {
    throw new Error('Không thể xóa ca sĩ đang được sử dụng bởi bài hát')
  }
  await deleteDoc(doc(db, COLLECTION, id))
}

export async function singerHasSongs(singerId: string): Promise<boolean> {
  const [arraySnap, legacySnap] = await Promise.all([
    getDocs(
      query(
        collection(db, 'songs'),
        where('singerIds', 'array-contains', singerId),
        limit(1),
      ),
    ),
    getDocs(
      query(collection(db, 'songs'), where('singerId', '==', singerId), limit(1)),
    ),
  ])
  return !arraySnap.empty || !legacySnap.empty
}

export async function getSingerById(id: string): Promise<Singer | null> {
  const snap = await getDoc(doc(db, COLLECTION, id))
  if (!snap.exists()) return null
  return mapSinger(snap.id, snap.data())
}
