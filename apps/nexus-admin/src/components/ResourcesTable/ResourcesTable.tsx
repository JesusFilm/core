import BorderColorOutlinedIcon from '@mui/icons-material/BorderColorOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import { IconButton, Popover, Stack, Typography } from '@mui/material'
import { GridCellParams } from '@mui/x-data-grid'
import { FC, useState } from 'react'
import { Resources_resources } from '../../../__generated__/Resources'
import { Table } from '../Table'

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

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    {
      field: 'videoId',
      headerName: 'Video ID',
      flex: 1
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
    <>
      <Table
        columns={columns}
        rows={data}
        title="Resources"
        subtitle="Additional description if required"
        loading={loading}
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
    </>
  )
}
