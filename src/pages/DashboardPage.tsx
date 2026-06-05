import CategoryIcon from '@mui/icons-material/Category'
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic'
import MicIcon from '@mui/icons-material/Mic'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { ErrorState } from '../components/common/ErrorState'
import { LoadingState } from '../components/common/LoadingState'
import { useDashboard } from '../hooks/useDashboard'
import { formatNumber } from '../utils/format'

const statCards = [
  { key: 'songsCount', label: 'Tổng bài hát', icon: <LibraryMusicIcon />, color: '#5B4FCF' },
  { key: 'singersCount', label: 'Tổng ca sĩ', icon: <MicIcon />, color: '#E91E63' },
  { key: 'categoriesCount', label: 'Tổng thể loại', icon: <CategoryIcon />, color: '#00897B' },
] as const

export function DashboardPage() {
  const { data, isLoading, error, refetch } = useDashboard()

  if (isLoading) return <LoadingState />
  if (error) return <ErrorState message={error.message} onRetry={() => refetch()} />
  if (!data) return null

  return (
    <Box>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {statCards.map((card) => (
          <Grid key={card.key} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    bgcolor: `${card.color}18`,
                    color: card.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {card.icon}
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {card.label}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {formatNumber(data[card.key])}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <TrendingUpIcon color="primary" />
          <Typography variant="h6">Top bài hát xem nhiều</Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width={60}>#</TableCell>
                <TableCell width={70}>Ảnh</TableCell>
                <TableCell>Tên bài hát</TableCell>
                <TableCell>Ca sĩ</TableCell>
                <TableCell align="right">Lượt xem</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.topSongs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="text.secondary" sx={{ py: 2 }}>
                      Chưa có dữ liệu bài hát
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                data.topSongs.map((song, index) => (
                  <TableRow key={song.id} hover>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Avatar
                        variant="rounded"
                        src={song.thumbnailUrl}
                        alt={song.title}
                        sx={{ width: 40, height: 40 }}
                      />
                    </TableCell>
                    <TableCell>{song.title}</TableCell>
                    <TableCell>
                      {song.singerNames && song.singerNames.length > 0
                        ? song.singerNames.join(', ')
                        : song.singerName}
                    </TableCell>
                    <TableCell align="right">{formatNumber(song.views)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  )
}
