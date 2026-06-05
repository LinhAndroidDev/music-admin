import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, Stack, TextField } from '@mui/material'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import type { Singer } from '../../types/singer'
import { singerSchema, type SingerFormValues } from '../../utils/validation'
import { CloudinaryUpload } from '../common/CloudinaryUpload'

interface SingerFormProps {
  singer?: Singer | null
  errorMessage?: string | null
  onSubmit: (values: SingerFormValues) => void
}

export function SingerForm({ singer, errorMessage, onSubmit }: SingerFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<SingerFormValues>({
    resolver: zodResolver(singerSchema),
    defaultValues: { name: '', avatarUrl: '', description: '' },
  })

  useEffect(() => {
    reset({
      name: singer?.name ?? '',
      avatarUrl: singer?.avatarUrl ?? '',
      description: singer?.description ?? '',
    })
  }, [singer, reset])

  return (
    <form id="singer-form" onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2}>
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
        <TextField
          label="Tên ca sĩ"
          fullWidth
          {...register('name')}
          error={!!errors.name}
          helperText={errors.name?.message}
        />
        <Controller
          name="avatarUrl"
          control={control}
          render={({ field }) => (
            <CloudinaryUpload
              label="Ảnh đại diện"
              accept="image/*"
              resourceType="image"
              previewType="image"
              value={field.value}
              onChange={(url) => {
                field.onChange(url)
                setValue('avatarUrl', url, { shouldValidate: true })
              }}
              onError={() => setValue('avatarUrl', '', { shouldValidate: true })}
            />
          )}
        />
        {errors.avatarUrl && (
          <Alert severity="warning">{errors.avatarUrl.message}</Alert>
        )}
        <TextField
          label="Mô tả"
          fullWidth
          multiline
          rows={3}
          {...register('description')}
          error={!!errors.description}
          helperText={errors.description?.message}
        />
      </Stack>
    </form>
  )
}
