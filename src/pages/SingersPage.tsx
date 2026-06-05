import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import { Alert, Avatar, Button, IconButton, Snackbar, Tooltip } from '@mui/material'
import { useState } from 'react'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { DataTable, type DataTableColumn } from '../components/common/DataTable'
import { FormDialog } from '../components/common/FormDialog'
import { SingerForm } from '../components/forms/SingerForm'
import {
  useCreateSinger,
  useDeleteSinger,
  useSingers,
  useUpdateSinger,
} from '../hooks/useSingers'
import type { Singer } from '../types/singer'
import type { SingerFormValues } from '../utils/validation'

export function SingersPage() {
  const { data: singers = [], isLoading, error, refetch } = useSingers()
  const createMutation = useCreateSinger()
  const updateMutation = useUpdateSinger()
  const deleteMutation = useDeleteSinger()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Singer | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Singer | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [snackbar, setSnackbar] = useState<string | null>(null)

  const columns: DataTableColumn<Singer>[] = [
    {
      id: 'avatarUrl',
      label: 'Ảnh',
      minWidth: 80,
      render: (row) => (
        <Avatar src={row.avatarUrl} alt={row.name} sx={{ width: 40, height: 40 }} />
      ),
    },
    { id: 'name', label: 'Tên ca sĩ', minWidth: 160 },
    {
      id: 'description',
      label: 'Mô tả',
      minWidth: 240,
      render: (row) =>
        row.description.length > 80
          ? `${row.description.slice(0, 80)}...`
          : row.description || '—',
    },
  ]

  const handleSubmit = async (values: SingerFormValues) => {
    setFormError(null)
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, input: values })
        setSnackbar('Cập nhật ca sĩ thành công')
      } else {
        await createMutation.mutateAsync(values)
        setSnackbar('Thêm ca sĩ thành công')
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
      setSnackbar('Xóa ca sĩ thành công')
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
        rows={singers}
        rowKey={(row) => row.id}
        loading={isLoading}
        error={error}
        onRetry={() => refetch()}
        hidePagination
        page={0}
        rowsPerPage={10}
        hasMore={false}
        onPageChange={() => {}}
        onRowsPerPageChange={() => {}}
        toolbarExtra={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => {
            setEditing(null)
            setFormError(null)
            setDialogOpen(true)
          }}>
            Thêm ca sĩ
          </Button>
        }
        renderActions={(row) => (
          <>
            <Tooltip title="Sửa">
              <IconButton size="small" onClick={() => {
                setEditing(row)
                setFormError(null)
                setDialogOpen(true)
              }}>
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
        title={editing ? 'Sửa ca sĩ' : 'Thêm ca sĩ'}
        loading={isSaving}
        maxWidth="sm"
        onClose={() => setDialogOpen(false)}
        onSubmit={() => {
          const form = document.getElementById('singer-form') as HTMLFormElement | null
          form?.requestSubmit()
        }}
      >
        <SingerForm singer={editing} errorMessage={formError} onSubmit={handleSubmit} />
      </FormDialog>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa ca sĩ"
        message={`Bạn có chắc muốn xóa "${deleteTarget?.name}"?`}
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
