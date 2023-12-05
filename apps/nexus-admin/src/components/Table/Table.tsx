import { Paper } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { FC } from 'react'
import { TableHeader } from './TableHeader'

interface TableProps {
  columns: GridColDef[]
  rows: any[]
  title: string
  subtitle: string
}

export const Table: FC<TableProps> = ({ columns, rows, title, subtitle }) => {
  return (
    <Paper>
      <DataGrid
        disableColumnMenu
        disableRowSelectionOnClick
        rows={rows}
        columns={columns}
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
            title: title,
            subtitle: subtitle
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
