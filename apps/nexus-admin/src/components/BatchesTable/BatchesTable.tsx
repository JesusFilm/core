import BorderColorOutlinedIcon from '@mui/icons-material/BorderColorOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { DataGrid } from '@mui/x-data-grid'
import { FC, useState } from 'react'

import { BatchesTableHeader } from './BatchesTableHeader'

interface Sample {
  id: string
  batchNumber: string
  destination: string
  createdBy: string
  status: string
  createdAt: string
}

interface BatchesTableProps {
  data: Sample[] | []
  // onEdit: (channelId: string) => void
  // onDelete: (channelId: string) => void
  loading: boolean
}

export const BatchesTable: FC<BatchesTableProps> = ({
  data,
  // onEdit,
  // onDelete,
  loading
}) => {
  const [morePopup, setMorePopup] = useState<HTMLElement | null>(null)
  // const [resourceId, setResourceId] = useState<string>('')
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
      renderCell: () => <Chip avatar={<Avatar>C</Avatar>} label="Channel 1" />,
      sortable: false
    },
    {
      field: 'createdBy',
      headerName: 'Created By',
      flex: 1
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      sortable: false
    },
    {
      field: 'createdAt',
      headerName: 'Created at',
      flex: 1,
      sortable: false
    }
    // {
    //   field: 'action',
    //   headerName: 'Action',
    //   flex: 1,
    //   sortable: false,
    //   renderCell: ({ row }: GridCellParams) => (
    //     <IconButton
    //       onClick={(event) => {
    //         setMorePopup(event.currentTarget)
    //         setResourceId(row.id)
    //       }}
    //     >
    //       <MoreHorizIcon fontSize="small" />
    //     </IconButton>
    //   )
    // }
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
      <Popover
        open={Boolean(morePopup)}
        anchorEl={morePopup}
        onClose={() => setMorePopup(null)}
      >
        <Stack sx={{ p: 4 }} spacing={4}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            sx={{ cursor: 'pointer' }}
            onClick={() => {
              // onEdit(resourceId)
              setMorePopup(null)
            }}
          >
            <BorderColorOutlinedIcon />
            <Typography>Edit</Typography>
          </Stack>
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            sx={{ cursor: 'pointer' }}
            onClick={() => {
              // onDelete(resourceId)
              setMorePopup(null)
            }}
          >
            <DeleteOutlineOutlinedIcon />
            <Typography>Delete</Typography>
          </Stack>
        </Stack>
      </Popover>
    </Paper>
  )
}
