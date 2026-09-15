import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import type { ReactNode } from 'react'

interface FormDialogProps {
  open: boolean
  title: string
  children: ReactNode
  loading?: boolean
  submitLabel?: string
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg'
  onClose: () => void
  onSubmit: () => void
}

export function FormDialog({
  open,
  title,
  children,
  loading = false,
  submitLabel = 'Lưu',
  maxWidth = 'sm',
  onClose,
  onSubmit,
}: FormDialogProps) {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      fullScreen={fullScreen}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers sx={{ overflowY: 'auto' }}>
        {children}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Hủy
        </Button>
        <Button variant="contained" onClick={onSubmit} disabled={loading}>
          {submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
