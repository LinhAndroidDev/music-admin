import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import {
  Alert,
  Avatar,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { DataTable, type DataTableColumn } from '../components/common/DataTable'
import { FormDialog } from '../components/common/FormDialog'
import { SongForm } from '../components/forms/SongForm'
import { useCategories } from '../hooks/useCategories'
import { useSingers } from '../hooks/useSingers'
import { useCreateSong, useDeleteSong, useSongsList, useUpdateSong } from '../hooks/useSongs'
import type { Song, SongSortField, SortDirection } from '../types/song'
import { formatDate, formatDuration, formatNumber } from '../utils/format'
import type { SongFormValues } from '../utils/validation'

const SORT_FIELD_LABELS: Record<SongSortField, string> = {
  createdAt: 'Ngày tạo',
  views: 'Lượt xem',
  duration: 'Thời lượng',
}

const SORT_DIRECTION_LABELS: Record<SongSortField, { asc: string; desc: string }> = {
  createdAt: { desc: 'Mới nhất trước', asc: 'Cũ nhất trước' },
  views: { desc: 'Nhiều lượt xem nhất', asc: 'Ít lượt xem nhất' },
  duration: { desc: 'Dài nhất', asc: 'Ngắn nhất' },
}

export function SongsPage() {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SongSortField>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [cursors, setCursors] = useState<(string | null)[]>([null])

  const params = {
    pageSize: rowsPerPage,
    cursorId: cursors[page] ?? null,
    search: searchQuery || undefined,
    sortBy,
    sortDirection,
  }

  const { data, isLoading, error, refetch } = useSongsList(params)
  const { data: singers = [] } = useSingers()
  const { data: categories = [] } = useCategories()
  const createMutation = useCreateSong()
  const updateMutation = useUpdateSong()
  const deleteMutation = useDeleteSong()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Song | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Song | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [snackbar, setSnackbar] = useState<string | null>(null)

  const resetPagination = () => {
    setPage(0)
    setCursors([null])
  }

  const handleSearchSubmit = () => {
    setSearchQuery(searchInput)
    resetPagination()
  }

  const handleSortByChange = (field: SongSortField) => {
    setSortBy(field)
    resetPagination()
  }

  const handleSortDirectionChange = (direction: SortDirection) => {
    setSortDirection(direction)
    resetPagination()
  }

  const isSearchActive = Boolean(searchQuery.trim())

  const columns: DataTableColumn<Song>[] = [
    {
      id: 'thumbnailUrl',
      label: 'Ảnh',
      minWidth: 70,
      render: (row) => (
        <Avatar variant="rounded" src={row.thumbnailUrl} alt={row.title} sx={{ width: 48, height: 48 }} />
      ),
    },
    { id: 'title', label: 'Tên bài hát', minWidth: 180 },
    {
      id: 'singerNames',
      label: 'Ca sĩ',
      minWidth: 120,
      render: (row) =>
        row.singerNames && row.singerNames.length > 0
          ? row.singerNames.join(', ')
          : row.singerName || '—',
    },
    { id: 'categoryName', label: 'Thể loại', minWidth: 100 },
    {
      id: 'duration',
      label: 'Thời lượng',
      minWidth: 90,
      render: (row) => formatDuration(row.duration),
    },
    {
      id: 'views',
      label: 'Lượt xem',
      minWidth: 90,
      align: 'right',
      render: (row) => formatNumber(row.views),
    },
    {
      id: 'createdAt',
      label: 'Ngày tạo',
      minWidth: 140,
      render: (row) =>
        row.createdAt?.toDate ? formatDate(row.createdAt.toDate()) : '—',
    },
  ]

  const buildSongPayload = (values: SongFormValues) => {
    const selectedSingers = values.singerIds
      .map((id) => singers.find((s) => s.id === id))
      .filter((s): s is NonNullable<typeof s> => Boolean(s))
    const singerNames = selectedSingers.map((s) => s.name)
    const category = categories.find((c) => c.id === values.categoryId)
    return {
      title: values.title,
      singerIds: values.singerIds,
      singerNames,
      singerId: values.singerIds[0] ?? '',
      singerName: singerNames[0] ?? '',
      thumbnailUrl: values.thumbnailUrl,
      audioUrl: values.audioUrl,
      lyricUrl: values.lyricUrl ?? '',
      duration: values.duration,
      categoryId: values.categoryId,
      categoryName: category?.name ?? '',
    }
  }

  const handleSubmit = async (values: SongFormValues) => {
    setFormError(null)
    const payload = buildSongPayload(values)
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, input: payload })
        setSnackbar('Cập nhật bài hát thành công')
      } else {
        await createMutation.mutateAsync(payload)
        setSnackbar('Thêm bài hát thành công')
        resetPagination()
      }
      setDialogOpen(false)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Lỗi không xác định')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteMutation.mutateAsync(deleteTarget.id)
      setSnackbar('Xóa bài hát thành công')
      setDeleteTarget(null)
    } catch (err) {
      setSnackbar(err instanceof Error ? err.message : 'Xóa thất bại')
      setDeleteTarget(null)
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <>
      <DataTable
        columns={columns}
        rows={data?.songs ?? []}
        rowKey={(row) => row.id}
        loading={isLoading}
        error={error}
        onRetry={() => refetch()}
        searchValue={searchInput}
        searchPlaceholder="Tìm theo tên bài hát..."
        onSearchChange={setSearchInput}
        onSearchSubmit={handleSearchSubmit}
        page={page}
        rowsPerPage={rowsPerPage}
        hasMore={data?.hasMore ?? false}
        onPageChange={(newPage) => {
          if (newPage > page) {
            if (!data?.hasMore) return
            if (data.lastDocId) {
              setCursors((prev) => {
                const next = [...prev]
                next[newPage] = data.lastDocId
                return next
              })
            }
          }
          setPage(newPage)
        }}
        onRowsPerPageChange={(size) => {
          setRowsPerPage(size)
          resetPagination()
        }}
        toolbarExtra={
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <FormControl size="small" sx={{ minWidth: 140 }} disabled={isSearchActive}>
              <InputLabel id="song-sort-field-label">Sắp xếp theo</InputLabel>
              <Select
                labelId="song-sort-field-label"
                label="Sắp xếp theo"
                value={sortBy}
                onChange={(e) => handleSortByChange(e.target.value as SongSortField)}
              >
                {(Object.keys(SORT_FIELD_LABELS) as SongSortField[]).map((field) => (
                  <MenuItem key={field} value={field}>
                    {SORT_FIELD_LABELS[field]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 180 }} disabled={isSearchActive}>
              <InputLabel id="song-sort-direction-label">Thứ tự</InputLabel>
              <Select
                labelId="song-sort-direction-label"
                label="Thứ tự"
                value={sortDirection}
                onChange={(e) => handleSortDirectionChange(e.target.value as SortDirection)}
              >
                <MenuItem value="desc">{SORT_DIRECTION_LABELS[sortBy].desc}</MenuItem>
                <MenuItem value="asc">{SORT_DIRECTION_LABELS[sortBy].asc}</MenuItem>
              </Select>
            </FormControl>
            {isSearchActive && (
              <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
                Khi tìm kiếm, kết quả sắp xếp theo tên
              </Typography>
            )}
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditing(null)
                setFormError(null)
                setDialogOpen(true)
              }}
            >
              Thêm bài hát
            </Button>
          </Stack>
        }
        renderActions={(row) => (
          <>
            <Tooltip title="Sửa">
              <IconButton
                size="small"
                onClick={() => {
                  setEditing(row)
                  setFormError(null)
                  setDialogOpen(true)
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Xóa">
              <IconButton size="small" color="error" onClick={() => setDeleteTarget(row)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        )}
      />

      <FormDialog
        open={dialogOpen}
        title={editing ? 'Sửa bài hát' : 'Thêm bài hát'}
        loading={isSaving}
        maxWidth="md"
        onClose={() => setDialogOpen(false)}
        onSubmit={() => {
          const form = document.getElementById('song-form') as HTMLFormElement | null
          form?.requestSubmit()
        }}
      >
        <SongForm song={editing} errorMessage={formError} onSubmit={handleSubmit} />
      </FormDialog>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa bài hát"
        message={`Bạn có chắc muốn xóa "${deleteTarget?.title}"?`}
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <Snackbar
        open={!!snackbar}
        autoHideDuration={4000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="info" onClose={() => setSnackbar(null)}>
          {snackbar}
        </Alert>
      </Snackbar>
    </>
  )
}
