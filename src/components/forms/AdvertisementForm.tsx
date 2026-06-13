import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, Stack, TextField } from '@mui/material'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import type { Advertisement } from '../../types/advertisement'
import { advertisementSchema, type AdvertisementFormValues } from '../../utils/validation'
import { CloudinaryUpload } from '../common/CloudinaryUpload'

interface AdvertisementFormProps {
  advertisement?: Advertisement | null
  errorMessage?: string | null
  onSubmit: (values: AdvertisementFormValues) => void
}

export function AdvertisementForm({
  advertisement,
  errorMessage,
  onSubmit,
}: AdvertisementFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<AdvertisementFormValues>({
    resolver: zodResolver(advertisementSchema),
    defaultValues: { image: '', update: '', detail: '' },
  })

  useEffect(() => {
    reset({
      image: advertisement?.image ?? '',
      update: advertisement?.update ?? '',
      detail: advertisement?.detail ?? '',
    })
  }, [advertisement, reset])

  return (
    <form id="advertisement-form" onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2}>
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        <Controller
          name="image"
          control={control}
          render={({ field }) => (
            <CloudinaryUpload
              label="Ảnh banner"
              accept="image/*"
              resourceType="image"
              previewType="image"
              value={field.value}
              onChange={(url) => setValue('image', url, { shouldValidate: true })}
            />
          )}
        />
        {errors.image && <Alert severity="warning">{errors.image.message}</Alert>}

        <TextField
          label="Tiêu đề (update)"
          fullWidth
          placeholder="Hay nhất của V-POP"
          {...register('update')}
          error={!!errors.update}
          helperText={errors.update?.message}
        />

        <TextField
          label="Mô tả (detail)"
          fullWidth
          multiline
          rows={3}
          placeholder="Thiên Lý Ơi đưa Jack - J97 trở lại với Top Trending"
          {...register('detail')}
          error={!!errors.detail}
          helperText={errors.detail?.message}
        />
      </Stack>
    </form>
  )
}
