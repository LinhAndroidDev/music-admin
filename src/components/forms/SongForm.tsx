import CloseIcon from '@mui/icons-material/Close'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
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
          render={({ field }) => {
            const selectedSingers = singers.filter((s) => (field.value ?? []).includes(s.id))

            return (
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={singers}
                value={selectedSingers}
                onChange={(_, newValue) => {
                  field.onChange(newValue.map((s) => s.id))
                }}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                noOptionsText="Không tìm thấy ca sĩ"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Ca sĩ"
                    placeholder={selectedSingers.length === 0 ? 'Tìm tên ca sĩ...' : ''}
                    error={!!errors.singerIds}
                    helperText={errors.singerIds?.message ?? 'Không bắt buộc'}
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => {
                    const { key, ...tagProps } = getTagProps({ index })
                    return (
                      <Chip
                        key={key}
                        {...tagProps}
                        size="small"
                        avatar={
                          <Avatar src={option.avatarUrl} alt={option.name} sx={{ width: 24, height: 24 }} />
                        }
                        label={option.name}
                      />
                    )
                  })
                }
                renderOption={(props, option, { selected }) => {
                  const { key, ...rest } = props
                  return (
                    <Box
                      component="li"
                      key={key}
                      {...rest}
                      sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}
                    >
                      <Avatar
                        src={option.avatarUrl}
                        alt={option.name}
                        sx={{ width: 32, height: 32 }}
                      />
                      <Box component="span" sx={{ flex: 1 }}>
                        {option.name}
                      </Box>
                      {selected && (
                        <IconButton
                          size="small"
                          edge="end"
                          aria-label={`Xóa ${option.name}`}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            field.onChange((field.value ?? []).filter((id) => id !== option.id))
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  )
                }}
              />
            )
          }}
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
              label="File lyric — không bắt buộc"
              accept=".lrc,.txt,text/plain"
              resourceType="raw"
              previewType="text"
              allowTextInput
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
