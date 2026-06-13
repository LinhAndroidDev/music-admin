import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import EditNoteIcon from '@mui/icons-material/EditNote'
import LinkIcon from '@mui/icons-material/Link'
import {
  Box,
  Button,
  CircularProgress,
  LinearProgress,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import { useRef, useState } from 'react'
import {
  getAudioDuration,
  uploadTextToCloudinary,
  uploadToCloudinary,
  type CloudinaryResourceType,
} from '../../services/cloudinary.service'

interface CloudinaryUploadProps {
  label: string
  accept?: string
  resourceType?: CloudinaryResourceType
  value?: string
  onChange: (url: string, meta?: { duration?: number }) => void
  onError?: (message: string) => void
  previewType?: 'image' | 'text' | 'audio'
  /** Bật chế độ nhập nội dung text, tự convert sang file .txt và upload Cloudinary */
  allowTextInput?: boolean
}

type InputMode = 'upload' | 'url' | 'text'

export function CloudinaryUpload({
  label,
  accept,
  resourceType = 'auto',
  value,
  onChange,
  onError,
  previewType = 'text',
  allowTextInput = false,
}: CloudinaryUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [mode, setMode] = useState<InputMode>('upload')
  const [urlInput, setUrlInput] = useState('')
  const [textInput, setTextInput] = useState('')

  const handleFile = async (file: File | null) => {
    if (!file) return
    setUploading(true)
    try {
      const result = await uploadToCloudinary(file, resourceType)
      let duration = result.duration

      if (previewType === 'audio' && !duration) {
        duration = await getAudioDuration(result.url)
      }

      onChange(result.url, { duration })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload thất bại'
      onError?.(message)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const handleApplyUrl = async () => {
    const url = urlInput.trim()
    if (!url) return

    let isValid = false
    try {
      const parsed = new URL(url)
      isValid = parsed.protocol === 'http:' || parsed.protocol === 'https:'
    } catch {
      isValid = false
    }

    if (!isValid) {
      onError?.('URL không hợp lệ')
      return
    }

    if (previewType === 'audio') {
      setUploading(true)
      try {
        const duration = await getAudioDuration(url)
        onChange(url, { duration })
      } catch {
        onChange(url)
      } finally {
        setUploading(false)
      }
      return
    }

    onChange(url)
  }

  const handleApplyText = async () => {
    const content = textInput.trim()
    if (!content) return

    setUploading(true)
    try {
      const filename = `lyric-${Date.now()}.txt`
      const result = await uploadTextToCloudinary(content, filename, resourceType)
      onChange(result.url)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload thất bại'
      onError?.(message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <Box>
      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
        {label}
      </Typography>

      <ToggleButtonGroup
        size="small"
        exclusive
        value={mode}
        onChange={(_, next: InputMode | null) => {
          if (next) setMode(next)
        }}
        sx={{ mb: 1, flexWrap: 'wrap' }}
      >
        <ToggleButton value="upload">
          <CloudUploadIcon fontSize="small" sx={{ mr: 0.5 }} />
          Tải lên
        </ToggleButton>
        <ToggleButton value="url">
          <LinkIcon fontSize="small" sx={{ mr: 0.5 }} />
          Nhập URL
        </ToggleButton>
        {allowTextInput && (
          <ToggleButton value="text">
            <EditNoteIcon fontSize="small" sx={{ mr: 0.5 }} />
            Nhập nội dung
          </ToggleButton>
        )}
      </ToggleButtonGroup>

      {mode === 'upload' && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            hidden
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
          <Button
            variant="outlined"
            startIcon={uploading ? <CircularProgress size={18} /> : <CloudUploadIcon />}
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            fullWidth
          >
            {value ? 'Thay đổi file' : 'Chọn file upload'}
          </Button>
        </>
      )}

      {mode === 'url' && (
        <Stack direction="row" spacing={1} alignItems="flex-start">
          <TextField
            fullWidth
            size="small"
            placeholder="Dán đường dẫn (https://...)"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleApplyUrl()
              }
            }}
          />
          <Button
            variant="outlined"
            onClick={handleApplyUrl}
            disabled={uploading || !urlInput.trim()}
            sx={{ whiteSpace: 'nowrap' }}
          >
            {uploading ? <CircularProgress size={18} /> : 'Áp dụng'}
          </Button>
        </Stack>
      )}

      {mode === 'text' && allowTextInput && (
        <Stack spacing={1}>
          <TextField
            fullWidth
            multiline
            minRows={6}
            placeholder="Dán hoặc nhập nội dung lyric..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />
          <Button
            variant="outlined"
            onClick={handleApplyText}
            disabled={uploading || !textInput.trim()}
            sx={{ alignSelf: 'flex-start' }}
          >
            {uploading ? <CircularProgress size={18} /> : 'Áp dụng'}
          </Button>
        </Stack>
      )}

      {uploading && <LinearProgress sx={{ mt: 1 }} />}
      {value && previewType === 'image' && (
        <Box
          component="img"
          src={value}
          alt="preview"
          sx={{ mt: 1, maxHeight: 120, borderRadius: 1 }}
        />
      )}
      {value && previewType === 'audio' && (
        <Box sx={{ mt: 1 }}>
          <audio controls src={value} style={{ width: '100%' }} />
        </Box>
      )}
      {value && previewType === 'text' && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mt: 1 }}
          noWrap
        >
          {value}
        </Typography>
      )}
    </Box>
  )
}
