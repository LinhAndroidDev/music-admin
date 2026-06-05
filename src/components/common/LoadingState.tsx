import { Box, CircularProgress, Typography } from '@mui/material'

interface LoadingStateProps {
  message?: string
  minHeight?: number | string
}

export function LoadingState({
  message = 'Đang tải...',
  minHeight = 240,
}: LoadingStateProps) {
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
      <CircularProgress />
      <Typography color="text.secondary">{message}</Typography>
    </Box>
  )
}
