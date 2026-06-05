import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, Stack, TextField } from '@mui/material'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type { Category } from '../../types/category'
import { categorySchema, type CategoryFormValues } from '../../utils/validation'

interface CategoryFormProps {
  category?: Category | null
  errorMessage?: string | null
  onSubmit: (values: CategoryFormValues) => void
}

export function CategoryForm({ category, errorMessage, onSubmit }: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '' },
  })

  useEffect(() => {
    reset({ name: category?.name ?? '' })
  }, [category, reset])

  return (
    <form id="category-form" onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2}>
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
        <TextField
          label="Tên thể loại"
          fullWidth
          {...register('name')}
          error={!!errors.name}
          helperText={errors.name?.message}
        />
      </Stack>
    </form>
  )
}
