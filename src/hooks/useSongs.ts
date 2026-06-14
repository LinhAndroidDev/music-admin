import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createSong,
  deleteSong,
  fetchSongsPage,
  updateSong,
} from '../services/songs.service'
import type { CreateSongInput, SongsQueryParams, UpdateSongInput } from '../types/song'

export const SONGS_KEY = ['songs'] as const

export function useSongsList(params: SongsQueryParams) {
  return useQuery({
    queryKey: [...SONGS_KEY, params],
    queryFn: () => fetchSongsPage(params),
  })
}

export function useCreateSong() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateSongInput) => createSong(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SONGS_KEY })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useUpdateSong() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateSongInput }) =>
      updateSong(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SONGS_KEY })
    },
  })
}

export function useDeleteSong() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteSong(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SONGS_KEY })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
