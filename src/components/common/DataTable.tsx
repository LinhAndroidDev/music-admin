import SearchIcon from '@mui/icons-material/Search'
import {
  Box,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material'
import type { ReactNode } from 'react'
import { ErrorState } from './ErrorState'
import { LoadingState } from './LoadingState'

export interface DataTableColumn<T> {
  id: string
  label: string
  minWidth?: number
  align?: 'left' | 'right' | 'center'
  render?: (row: T) => ReactNode
}

interface DataTableProps<T> {
  title?: string
  columns: DataTableColumn<T>[]
  rows: T[]
  rowKey: (row: T) => string
  loading?: boolean
  error?: Error | null
  searchValue?: string
  searchPlaceholder?: string
  onSearchChange?: (value: string) => void
  onSearchSubmit?: () => void
  toolbarExtra?: ReactNode
  page: number
  rowsPerPage: number
  hasMore?: boolean
  hidePagination?: boolean
  onPageChange: (page: number) => void
  onRowsPerPageChange: (rowsPerPage: number) => void
  onRetry?: () => void
  emptyMessage?: string
  renderActions?: (row: T) => ReactNode
}

export function DataTable<T>({
  title,
  columns,
  rows,
  rowKey,
  loading,
  error,
  searchValue,
  searchPlaceholder = 'Tìm kiếm...',
  onSearchChange,
  onSearchSubmit,
  toolbarExtra,
  page,
  rowsPerPage,
  hasMore = false,
  hidePagination = false,
  onPageChange,
  onRowsPerPageChange,
  onRetry,
  emptyMessage = 'Không có dữ liệu',
  renderActions,
}: DataTableProps<T>) {
  const actionColumn = renderActions ? 1 : 0
  const colSpan = columns.length + actionColumn

  return (
    <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
      <Toolbar sx={{ gap: 2, flexWrap: 'wrap' }}>
        {title && (
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
        )}
        {onSearchChange && (
          <TextField
            size="small"
            placeholder={searchPlaceholder}
            value={searchValue ?? ''}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSearchSubmit?.()
            }}
            sx={{ minWidth: 220 }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={onSearchSubmit}>
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        )}
        {toolbarExtra}
      </Toolbar>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error.message} onRetry={onRetry} />
      ) : (
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {columns.map((col) => (
                  <TableCell
                    key={col.id}
                    align={col.align}
                    style={{ minWidth: col.minWidth }}
                  >
                    {col.label}
                  </TableCell>
                ))}
                {renderActions && (
                  <TableCell align="right" style={{ minWidth: 120 }}>
                    Thao tác
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={colSpan} align="center">
                    <Typography color="text.secondary" sx={{ py: 3 }}>
                      {emptyMessage}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow hover key={rowKey(row)}>
                    {columns.map((col) => (
                      <TableCell key={col.id} align={col.align}>
                        {col.render
                          ? col.render(row)
                          : String((row as Record<string, unknown>)[col.id] ?? '')}
                      </TableCell>
                    ))}
                    {renderActions && (
                      <TableCell align="right">
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: 0.5,
                          }}
                        >
                          {renderActions(row)}
                        </Box>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {!hidePagination && (
        <TablePagination
          component="div"
          count={hasMore ? (page + 2) * rowsPerPage : page * rowsPerPage + rows.length}
          page={page}
          onPageChange={(_, newPage) => onPageChange(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            onRowsPerPageChange(parseInt(e.target.value, 10))
            onPageChange(0)
          }}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Số dòng:"
          slotProps={{
            actions: {
              nextButton: { disabled: !hasMore },
            },
          }}
        />
      )}
    </Paper>
  )
}
