import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createSinger,
  deleteSinger,
  fetchSingers,
  updateSinger,
} from '../services/singers.service'
import type { CreateSingerInput, UpdateSingerInput } from '../types/singer'

export const SINGERS_KEY = ['singers'] as const

export function useSingers() {
  return useQuery({
    queryKey: SINGERS_KEY,
    queryFn: fetchSingers,
  })
}

export function useCreateSinger() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateSingerInput) => createSinger(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SINGERS_KEY })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useUpdateSinger() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateSingerInput }) =>
      updateSinger(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SINGERS_KEY })
    },
  })
}

export function useDeleteSinger() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteSinger(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SINGERS_KEY })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['songs'] })
    },
  })
}
