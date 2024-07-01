import Paper from '@mui/material/Paper'
import { DataGrid } from '@mui/x-data-grid'
import { FC, useState } from 'react'

export interface Localization {
  id: string
  resourceId: string
  title: string
  description: string
  keywords: string
  language: string
}

interface LocalizationTableProps {
  data: Localization[] | []
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
      field: 'keywords',
      headerName: 'Keywords',
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
