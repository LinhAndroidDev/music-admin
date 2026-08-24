import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import {
  Avatar,
  Box,
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import { ErrorState } from '../components/common/ErrorState'
import { LoadingState } from '../components/common/LoadingState'
import { useSinger } from '../hooks/useSingers'
import { useSongsBySinger } from '../hooks/useSongs'
import { formatDate, formatDuration, formatNumber } from '../utils/format'

export function SingerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const {
    data: singer,
    isLoading: singerLoading,
    error: singerError,
    refetch: refetchSinger,
  } = useSinger(id)

  const {
    data: songs = [],
    isLoading: songsLoading,
    error: songsError,
    refetch: refetchSongs,
  } = useSongsBySinger(id)

  if (singerLoading) return <LoadingState />

  if (singerError) {
    return (
      <ErrorState
        message={singerError.message}
        onRetry={() => refetchSinger()}
      />
    )
  }

  if (!singer) {
    return (
      <Stack spacing={2} alignItems="flex-start">
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/singers')}>
          Quay lại
        </Button>
        <Typography color="text.secondary">Không tìm thấy ca sĩ.</Typography>
      </Stack>
    )
  }

  return (
    <Stack spacing={3}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/singers')}
        sx={{ alignSelf: 'flex-start' }}
      >
        Quay lại danh sách ca sĩ
      </Button>

      <Paper
        elevation={0}
        sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 3 }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={3}
          alignItems={{ xs: 'center', sm: 'flex-start' }}
        >
          <Avatar
            src={singer.avatarUrl}
            alt={singer.name}
            sx={{ width: 120, height: 120 }}
          />
          <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              {singer.name}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
              {singer.description || 'Chưa có mô tả'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {songsLoading ? 'Đang tải bài hát...' : `${songs.length} bài hát`}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
        <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6">Bài hát của ca sĩ</Typography>
        </Box>

        {songsLoading ? (
          <LoadingState />
        ) : songsError ? (
          <ErrorState message={songsError.message} onRetry={() => refetchSongs()} />
        ) : songs.length === 0 ? (
          <Typography color="text.secondary" sx={{ p: 3, textAlign: 'center' }}>
            Ca sĩ này chưa có bài hát nào
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Ảnh</TableCell>
                  <TableCell>Tên bài hát</TableCell>
                  <TableCell>Thể loại</TableCell>
                  <TableCell>Thời lượng</TableCell>
                  <TableCell align="right">Lượt xem</TableCell>
                  <TableCell>Ngày tạo</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {songs.map((song) => (
                  <TableRow hover key={song.id}>
                    <TableCell>
                      <Avatar
                        variant="rounded"
                        src={song.thumbnailUrl}
                        alt={song.title}
                        sx={{ width: 48, height: 48 }}
                      />
                    </TableCell>
                    <TableCell>{song.title}</TableCell>
                    <TableCell>{song.categoryName || '—'}</TableCell>
                    <TableCell>{formatDuration(song.duration)}</TableCell>
                    <TableCell align="right">{formatNumber(song.views)}</TableCell>
                    <TableCell>
                      {song.createdAt?.toDate
                        ? formatDate(song.createdAt.toDate())
                        : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Stack>
  )
}
