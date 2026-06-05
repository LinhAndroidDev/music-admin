import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import { Alert, Button, IconButton, Snackbar, Tooltip } from '@mui/material'
import { useState } from 'react'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { DataTable, type DataTableColumn } from '../components/common/DataTable'
import { FormDialog } from '../components/common/FormDialog'
import { CategoryForm } from '../components/forms/CategoryForm'
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from '../hooks/useCategories'
import type { Category } from '../types/category'
import type { CategoryFormValues } from '../utils/validation'

export function CategoriesPage() {
  const { data: categories = [], isLoading, error, refetch } = useCategories()
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const deleteMutation = useDeleteCategory()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [snackbar, setSnackbar] = useState<string | null>(null)

  const columns: DataTableColumn<Category>[] = [
    { id: 'name', label: 'Tên thể loại', minWidth: 200 },
  ]

  const handleOpenCreate = () => {
    setEditing(null)
    setFormError(null)
    setDialogOpen(true)
  }

  const handleOpenEdit = (category: Category) => {
    setEditing(category)
    setFormError(null)
    setDialogOpen(true)
  }

  const handleSubmit = async (values: CategoryFormValues) => {
    setFormError(null)
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, input: values })
        setSnackbar('Cập nhật thể loại thành công')
      } else {
        await createMutation.mutateAsync(values)
        setSnackbar('Thêm thể loại thành công')
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
      setSnackbar('Xóa thể loại thành công')
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
        rows={categories}
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
            Thêm thể loại
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
        title={editing ? 'Sửa thể loại' : 'Thêm thể loại'}
        loading={isSaving}
        onClose={() => setDialogOpen(false)}
        onSubmit={() => {
          const form = document.getElementById('category-form') as HTMLFormElement | null
          form?.requestSubmit()
        }}
      >
        <CategoryForm
          category={editing}
          errorMessage={formError}
          onSubmit={handleSubmit}
        />
      </FormDialog>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa thể loại"
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
