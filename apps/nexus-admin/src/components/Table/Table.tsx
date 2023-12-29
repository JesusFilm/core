import { Paper } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { FC } from 'react'

import { TableHeader } from './TableHeader'

interface TableProps {
  columns: GridColDef[]
  rows: any[]
  title: string
  subtitle: string
  loading: boolean
}

export const Table: FC<TableProps> = ({
  columns,
  rows,
  title,
  subtitle,
  loading
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
            subtitle
          }
        }}
        sx={{
          fontFamily: 'Montserrat',
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 700
          }
        }}
      />
    </Paper>
  )
}
