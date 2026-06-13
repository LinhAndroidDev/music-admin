import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createAdvertisement,
  deleteAdvertisement,
  fetchAdvertisements,
  updateAdvertisement,
} from '../services/advertisements.service'
import type {
  CreateAdvertisementInput,
  UpdateAdvertisementInput,
} from '../types/advertisement'

export const ADVERTISEMENTS_KEY = ['advertisements'] as const

export function useAdvertisements() {
  return useQuery({
    queryKey: ADVERTISEMENTS_KEY,
    queryFn: fetchAdvertisements,
  })
}

export function useCreateAdvertisement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateAdvertisementInput) => createAdvertisement(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADVERTISEMENTS_KEY })
    },
  })
}

export function useUpdateAdvertisement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAdvertisementInput }) =>
      updateAdvertisement(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADVERTISEMENTS_KEY })
    },
  })
}

export function useDeleteAdvertisement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteAdvertisement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADVERTISEMENTS_KEY })
    },
  })
}
