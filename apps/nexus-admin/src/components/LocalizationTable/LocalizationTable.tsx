import Paper from '@mui/material/Paper'
import { DataGrid } from '@mui/x-data-grid'
import { FC, useState } from 'react'

interface LocalizationTableProps {
  data: []
  loading: boolean
}

export const LocalizationTable: FC<LocalizationTableProps> = ({
  data,
  loading
}) => {
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10
  })

  const columns = [
    {
      field: 'language',
      headerName: 'Language',
      flex: 1,
      sortable: false
    },
    {
      field: 'title',
      headerName: 'Title',
      flex: 1,
      sortable: false
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1,
      sortable: false
    },
    {
      field: 'keyword',
      headerName: 'Keyword',
      flex: 1,
      sortable: false
    },
    {
      field: 'caption',
      headerName: 'Caption',
      flex: 1,
      sortable: false
    }
  ]

  return (
    <Paper>
      <DataGrid
        autoHeight
        disableColumnMenu
        disableRowSelectionOnClick
        rows={data}
        columns={columns}
        loading={loading}
        pageSizeOptions={[5, 10]}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
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
