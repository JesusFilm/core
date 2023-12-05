import BorderColorOutlinedIcon from '@mui/icons-material/BorderColorOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import { IconButton, Popover, Stack, Typography } from '@mui/material'
import { FC, useState } from 'react'
import { Table } from '../Table'

export const ResourcesTable: FC = () => {
  const [morePopup, setMorePopup] = useState<HTMLElement | null>(null)

  const columns = [
    { field: 'channelName', headerName: 'Video ID', flex: 1 },
    { field: 'category', headerName: 'Category', flex: 1 },
    {
      field: 'platform',
      headerName: 'Languages',
      flex: 1
    },
    {
      field: 'platform',
      headerName: 'Ownership',
      flex: 1
    },
    {
      field: 'platform',
      headerName: 'Filename',
      flex: 1
    },
    {
      field: 'action',
      headerName: 'Action',
      flex: 1,
      sortable: false,
      renderCell: () => (
        <IconButton onClick={(event) => setMorePopup(event.currentTarget)}>
          <MoreHorizIcon fontSize="small" />
        </IconButton>
      )
    }
  ]

  const rows = [
    {
      id: 1,
      channelName: 'Jesus Film',
      category: 'Category',
      platform: 'Youtube',
      user: true
    },
    {
      id: 2,
      channelName: 'Jesus Film',
      category: 'Category',
      platform: 'Youtube',
      user: false
    },
    {
      id: 3,
      channelName: 'Jesus Film',
      category: 'Category',
      platform: 'Youtube',
      user: false
    },
    {
      id: 4,
      channelName: 'Jesus Film',
      category: 'Category',
      platform: 'Youtube',
      user: true
    }
  ]

  return (
    <>
      <Table
        columns={columns}
        rows={rows}
        title="Resources"
        subtitle="Additional description if required"
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
          >
            <BorderColorOutlinedIcon />
            <Typography>Edit</Typography>
          </Stack>
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            sx={{ cursor: 'pointer' }}
          >
            <DeleteOutlineOutlinedIcon />
            <Typography>Delete</Typography>
          </Stack>
        </Stack>
      </Popover>
    </>
  )
}
