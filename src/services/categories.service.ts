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
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../types/category'

const COLLECTION = 'categories'

function mapCategory(id: string, data: Record<string, unknown>): Category {
  return {
    id,
    name: (data.name as string) ?? '',
  }
}

export async function fetchCategories(): Promise<Category[]> {
  const q = query(collection(db, COLLECTION), orderBy('name', 'asc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => mapCategory(d.id, d.data()))
}

export async function createCategory(input: CreateCategoryInput): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), input)
  return ref.id
}

export async function updateCategory(
  id: string,
  input: UpdateCategoryInput,
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), { ...input })
}

export async function deleteCategory(id: string): Promise<void> {
  const hasSongs = await categoryHasSongs(id)
  if (hasSongs) {
    throw new Error('Không thể xóa thể loại đang được sử dụng bởi bài hát')
  }
  await deleteDoc(doc(db, COLLECTION, id))
}

export async function categoryHasSongs(categoryId: string): Promise<boolean> {
  const q = query(
    collection(db, 'songs'),
    where('categoryId', '==', categoryId),
    limit(1),
  )
  const snapshot = await getDocs(q)
  return !snapshot.empty
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const snap = await getDoc(doc(db, COLLECTION, id))
  if (!snap.exists()) return null
  return mapCategory(snap.id, snap.data())
}
