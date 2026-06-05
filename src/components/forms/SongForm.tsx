import { zodResolver } from '@hookform/resolvers/zod'
import {
  Alert,
  Box,
  Chip,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  TextField,
} from '@mui/material'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useCategories } from '../../hooks/useCategories'
import { useSingers } from '../../hooks/useSingers'
import type { Song } from '../../types/song'
import { songSchema, type SongFormValues } from '../../utils/validation'
import { CloudinaryUpload } from '../common/CloudinaryUpload'

interface SongFormProps {
  song?: Song | null
  errorMessage?: string | null
  onSubmit: (values: SongFormValues) => void
}

export function SongForm({ song, errorMessage, onSubmit }: SongFormProps) {
  const { data: singers = [] } = useSingers()
  const { data: categories = [] } = useCategories()

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<SongFormValues>({
    resolver: zodResolver(songSchema),
    defaultValues: {
      title: '',
      singerIds: [],
      categoryId: '',
      thumbnailUrl: '',
      audioUrl: '',
      lyricUrl: '',
      duration: 0,
    },
  })

  useEffect(() => {
    const initialSingerIds =
      song?.singerIds && song.singerIds.length > 0
        ? song.singerIds
        : song?.singerId
          ? [song.singerId]
          : []
    reset({
      title: song?.title ?? '',
      singerIds: initialSingerIds,
      categoryId: song?.categoryId ?? '',
      thumbnailUrl: song?.thumbnailUrl ?? '',
      audioUrl: song?.audioUrl ?? '',
      lyricUrl: song?.lyricUrl ?? '',
      duration: song?.duration ?? 0,
    })
  }, [song, reset])

  return (
    <form id="song-form" onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2}>
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        <TextField
          label="Tên bài hát"
          fullWidth
          {...register('title')}
          error={!!errors.title}
          helperText={errors.title?.message}
        />

        <Controller
          name="singerIds"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth error={!!errors.singerIds}>
              <InputLabel>Ca sĩ</InputLabel>
              <Select
                {...field}
                multiple
                value={field.value ?? []}
                input={<OutlinedInput label="Ca sĩ" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as string[]).map((id) => {
                      const singer = singers.find((s) => s.id === id)
                      return <Chip key={id} size="small" label={singer?.name ?? id} />
                    })}
                  </Box>
                )}
              >
                {singers.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.singerIds && (
                <FormHelperText>{errors.singerIds.message}</FormHelperText>
              )}
            </FormControl>
          )}
        />

        <Controller
          name="categoryId"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth error={!!errors.categoryId}>
              <InputLabel>Thể loại</InputLabel>
              <Select {...field} label="Thể loại">
                {categories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />

        <Controller
          name="thumbnailUrl"
          control={control}
          render={({ field }) => (
            <CloudinaryUpload
              label="Ảnh bìa"
              accept="image/*"
              resourceType="image"
              previewType="image"
              value={field.value}
              onChange={(url) => setValue('thumbnailUrl', url, { shouldValidate: true })}
            />
          )}
        />

        <Controller
          name="audioUrl"
          control={control}
          render={({ field }) => (
            <CloudinaryUpload
              label="File MP3"
              accept="audio/*"
              resourceType="video"
              previewType="audio"
              value={field.value}
              onChange={(url, meta) => {
                setValue('audioUrl', url, { shouldValidate: true })
                if (meta?.duration) {
                  setValue('duration', Math.round(meta.duration), { shouldValidate: true })
                }
              }}
            />
          )}
        />

        <Controller
          name="lyricUrl"
          control={control}
          render={({ field }) => (
            <CloudinaryUpload
              label="File lyric (.lrc)"
              accept=".lrc,text/plain"
              resourceType="raw"
              previewType="text"
              value={field.value}
              onChange={(url) => setValue('lyricUrl', url, { shouldValidate: true })}
            />
          )}
        />


        {(errors.thumbnailUrl || errors.audioUrl || errors.lyricUrl || errors.duration) && (
          <Alert severity="warning">
            {errors.thumbnailUrl?.message ||
              errors.audioUrl?.message ||
              errors.lyricUrl?.message ||
              errors.duration?.message}
          </Alert>
        )}
      </Stack>
    </form>
  )
}
