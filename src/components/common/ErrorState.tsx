import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined'
import { Box, Button, Typography } from '@mui/material'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
  minHeight?: number | string
}

export function ErrorState({
  message = 'Đã xảy ra lỗi khi tải dữ liệu',
  onRetry,
  minHeight = 240,
}: ErrorStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight,
        gap: 2,
      }}
    >
      <ErrorOutlineIcon color="error" sx={{ fontSize: 48 }} />
      <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
        {message}
      </Typography>
      {onRetry && (
        <Button variant="outlined" onClick={onRetry}>
          Thử lại
        </Button>
      )}
    </Box>
  )
}
