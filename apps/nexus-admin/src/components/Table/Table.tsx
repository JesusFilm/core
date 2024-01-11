import { Paper } from '@mui/material'
import {
  DataGrid,
  GridColDef,
  GridColumnVisibilityModel
} from '@mui/x-data-grid'
import { FC } from 'react'

import { TableHeader } from './TableHeader'

interface TableProps {
  columns: GridColDef[]
  rows: any[]
  title: string
  subtitle: string
  loading: boolean
  hasTableView: boolean
  onTableView: () => void
  columnsVisibility?: GridColumnVisibilityModel
}

export const Table: FC<TableProps> = ({
  columns,
  rows,
  title,
  subtitle,
  loading,
  hasTableView = false,
  onTableView,
  columnsVisibility
}) => {
  return (
    <Paper>
      <DataGrid
        autoHeight
        disableColumnMenu
        disableRowSelectionOnClick
        rows={rows}
        columns={columns}
        loading={loading}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 5 }
          }
        }}
        pageSizeOptions={[5, 10]}
        slots={{
          toolbar: TableHeader
        }}
        slotProps={{
          toolbar: {
            title,
            subtitle,
            hasTableView,
            onTableView
          }
        }}
        sx={{
          fontFamily: 'Montserrat',
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 700
          }
        }}
        columnVisibilityModel={columnsVisibility}
      />
    </Paper>
  )
}
