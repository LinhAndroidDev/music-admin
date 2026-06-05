import { collection, getCountFromServer, getDocs, limit, orderBy, query } from 'firebase/firestore'
import { db } from '../config/firebase'
import type { Song } from '../types/song'

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

export interface DashboardStats {
  songsCount: number
  singersCount: number
  categoriesCount: number
  topSongs: Song[]
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const [songsSnap, singersSnap, categoriesSnap, topSnap] = await Promise.all([
    getCountFromServer(collection(db, 'songs')),
    getCountFromServer(collection(db, 'singers')),
    getCountFromServer(collection(db, 'categories')),
    getDocs(
      query(collection(db, 'songs'), orderBy('views', 'desc'), limit(10)),
    ),
  ])

  return {
    songsCount: songsSnap.data().count,
    singersCount: singersSnap.data().count,
    categoriesCount: categoriesSnap.data().count,
    topSongs: topSnap.docs.map((d) => mapSong(d.id, d.data())),
  }
}
