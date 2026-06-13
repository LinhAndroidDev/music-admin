import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import { Alert, Avatar, Button, IconButton, Snackbar, Tooltip } from '@mui/material'
import { useState } from 'react'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { DataTable, type DataTableColumn } from '../components/common/DataTable'
import { FormDialog } from '../components/common/FormDialog'
import { AdvertisementForm } from '../components/forms/AdvertisementForm'
import {
  useAdvertisements,
  useCreateAdvertisement,
  useDeleteAdvertisement,
  useUpdateAdvertisement,
} from '../hooks/useAdvertisements'
import type { Advertisement } from '../types/advertisement'
import { formatDate } from '../utils/format'
import type { AdvertisementFormValues } from '../utils/validation'

export function AdvertisementsPage() {
  const { data: advertisements = [], isLoading, error, refetch } = useAdvertisements()
  const createMutation = useCreateAdvertisement()
  const updateMutation = useUpdateAdvertisement()
  const deleteMutation = useDeleteAdvertisement()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Advertisement | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Advertisement | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [snackbar, setSnackbar] = useState<string | null>(null)

  const columns: DataTableColumn<Advertisement>[] = [
    {
      id: 'image',
      label: 'Ảnh',
      minWidth: 80,
      render: (row) => (
        <Avatar
          variant="rounded"
          src={row.image}
          alt={row.update}
          sx={{ width: 64, height: 64 }}
        />
      ),
    },
    { id: 'update', label: 'Tiêu đề', minWidth: 160 },
    {
      id: 'detail',
      label: 'Mô tả',
      minWidth: 240,
      render: (row) => (
        <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {row.detail}
        </span>
      ),
    },
    {
      id: 'createdAt',
      label: 'Ngày tạo',
      minWidth: 140,
      render: (row) =>
        row.createdAt?.toDate ? formatDate(row.createdAt.toDate()) : '—',
    },
  ]

  const handleOpenCreate = () => {
    setEditing(null)
    setFormError(null)
    setDialogOpen(true)
  }

  const handleOpenEdit = (advertisement: Advertisement) => {
    setEditing(advertisement)
    setFormError(null)
    setDialogOpen(true)
  }

  const handleSubmit = async (values: AdvertisementFormValues) => {
    setFormError(null)
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, input: values })
        setSnackbar('Cập nhật banner thành công')
      } else {
        await createMutation.mutateAsync(values)
        setSnackbar('Thêm banner thành công')
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
      setSnackbar('Xóa banner thành công')
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
        rows={advertisements}
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
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
            Thêm banner
          </Button>
        }
        renderActions={(row) => (
          <>
            <Tooltip title="Sửa">
              <IconButton size="small" onClick={() => handleOpenEdit(row)}>
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
        title={editing ? 'Sửa banner' : 'Thêm banner'}
        loading={isSaving}
        maxWidth="md"
        onClose={() => setDialogOpen(false)}
        onSubmit={() => {
          const form = document.getElementById('advertisement-form') as HTMLFormElement | null
          form?.requestSubmit()
        }}
      >
        <AdvertisementForm
          advertisement={editing}
          errorMessage={formError}
          onSubmit={handleSubmit}
        />
      </FormDialog>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa banner"
        message={`Bạn có chắc muốn xóa banner "${deleteTarget?.update}"?`}
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
