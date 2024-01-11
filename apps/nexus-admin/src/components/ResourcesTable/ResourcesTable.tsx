import BorderColorOutlinedIcon from '@mui/icons-material/BorderColorOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import {
  Button,
  Chip,
  IconButton,
  Paper,
  Popover,
  Stack,
  Typography
} from '@mui/material'
import { DataGrid, GridCellParams } from '@mui/x-data-grid'
import { FC, useState } from 'react'

import { Resources_resources } from '../../../__generated__/Resources'
import { ViewResourceTableModal } from '../ViewResourceTableModal/ViewResourceTableModal'

import { ResourcesTableHeader } from './ResourcesTableHeader'

interface ResourcesTableProps {
  data: Resources_resources[] | []
  onEdit: (channelId: string) => void
  onDelete: (channelId: string) => void
  loading: boolean
}

export const ResourcesTable: FC<ResourcesTableProps> = ({
  data,
  onEdit,
  onDelete,
  loading
}) => {
  const [morePopup, setMorePopup] = useState<HTMLElement | null>(null)
  const [resourceId, setResourceId] = useState<string>('')
  const [isTableViewOpen, setIsTableViewOpen] = useState<boolean>(false)
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10
  })

  const defaultColumnsVisibility = {
    status: true,
    name: true,
    title: false,
    description: false,
    keywords: true,
    upload: true,
    action: true
  }
  const [columnsVisibility, setColumnsVisibility] = useState(
    defaultColumnsVisibility
  )

  const allColumnsVisibility = () =>
    setColumnsVisibility({
      status: true,
      name: true,
      title: true,
      description: true,
      keywords: true,
      upload: true,
      action: true
    })

  const toggleColumnVisibility = (column: string, value: boolean) =>
    setColumnsVisibility((prevState) => ({
      ...prevState,
      [column]: value
    }))

  const resetColumnsVisibility = () =>
    setColumnsVisibility(defaultColumnsVisibility)

  const columns = [
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: () => <Chip label="Success" color="success" />
    },
    { field: 'name', headerName: 'Filename', flex: 1 },
    { field: 'title', headerName: 'Title', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 1 },
    {
      field: 'keywords',
      headerName: 'Keywords',
      flex: 1,
      renderCell: () => <Chip label="Youtube" variant="outlined" />
    },
    {
      field: 'upload',
      headerName: 'Upload',
      flex: 1,
      renderCell: () => (
        <Button variant="contained" color="secondary">
          Upload to Youtube
        </Button>
      )
    },
    {
      field: 'action',
      headerName: 'Action',
      flex: 1,
      sortable: false,
      renderCell: ({ row }: GridCellParams) => (
        <IconButton
          onClick={(event) => {
            setMorePopup(event.currentTarget)
            setResourceId(row.id)
          }}
        >
          <MoreHorizIcon fontSize="small" />
        </IconButton>
      )
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
          toolbar: ResourcesTableHeader
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
        columnVisibilityModel={columnsVisibility}
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
              onEdit(resourceId)
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
              onDelete(resourceId)
              setMorePopup(null)
            }}
          >
            <DeleteOutlineOutlinedIcon />
            <Typography>Delete</Typography>
          </Stack>
        </Stack>
      </Popover>
      <ViewResourceTableModal
        open={isTableViewOpen}
        closeModal={() => setIsTableViewOpen(false)}
        columnsVisibility={columnsVisibility}
        toggleColumnVisibility={toggleColumnVisibility}
        allColumnsVisibility={allColumnsVisibility}
        resetColumnsVisibility={resetColumnsVisibility}
      />
    </Paper>
  )
}
