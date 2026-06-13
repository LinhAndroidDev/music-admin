import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../config/firebase'
import type {
  Advertisement,
  CreateAdvertisementInput,
  UpdateAdvertisementInput,
} from '../types/advertisement'

const COLLECTION = 'advertisements'

function mapAdvertisement(id: string, data: Record<string, unknown>): Advertisement {
  return {
    id,
    image: (data.image as string) ?? '',
    update: (data.update as string) ?? '',
    detail: (data.detail as string) ?? '',
    createdAt: data.createdAt as Advertisement['createdAt'],
  }
}

export async function fetchAdvertisements(): Promise<Advertisement[]> {
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => mapAdvertisement(d.id, d.data()))
}

export async function createAdvertisement(input: CreateAdvertisementInput): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...input,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateAdvertisement(
  id: string,
  input: UpdateAdvertisementInput,
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), { ...input })
}

export async function deleteAdvertisement(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id))
}
