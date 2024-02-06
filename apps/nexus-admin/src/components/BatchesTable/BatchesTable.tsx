import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import { DataGrid } from '@mui/x-data-grid'
import { FC, useState } from 'react'

import { Batches_batches } from '../../../__generated__/Batches'

import { BatchesTableHeader } from './BatchesTableHeader'

interface BatchesTableProps {
  data: Batches_batches[] | []
  loading: boolean
}

export const BatchesTable: FC<BatchesTableProps> = ({ data, loading }) => {
  const [isTableViewOpen, setIsTableViewOpen] = useState<boolean>(false)
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10
  })

  const columns = [
    {
      field: 'id',
      headerName: 'Batch Number',
      flex: 1,
      sortable: false
    },
    {
      field: 'destination',
      headerName: 'Destination',
      flex: 1,
      renderCell: ({ row }) => (
        <Chip
          avatar={
            <Avatar
              src={row.channel?.youtube?.imageUrl}
              alt={row.channel?.youtube?.title}
            />
          }
          label={row.channel?.youtube?.title}
        />
      ),
      sortable: false
    },
    // {
    //   field: 'createdBy',
    //   headerName: 'Created By',
    //   flex: 1
    // },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      sortable: false
    },
    {
      field: 'averagePercent',
      headerName: 'Progress',
      flex: 1,
      sortable: false
    },
    {
      field: 'createdAt',
      headerName: 'Created at',
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
        slots={{
          toolbar: BatchesTableHeader
        }}
        slotProps={{
          toolbar: {
            onTableView: () => setIsTableViewOpen(!isTableViewOpen)
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
