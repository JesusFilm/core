import Paper from '@mui/material/Paper'
import { DataGrid } from '@mui/x-data-grid'
import { FC, useState } from 'react'

interface ChannelTableProps {
  data: []
  loading: boolean
}

export const ChannelTable: FC<ChannelTableProps> = ({ data, loading }) => {
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10
  })

  const columns = [
    {
      field: 'language',
      headerName: 'Channel Name',
      flex: 1,
      sortable: false
    },
    {
      field: 'title',
      headerName: 'Created By',
      flex: 1,
      sortable: false
    },
    {
      field: 'description',
      headerName: 'Created At',
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
