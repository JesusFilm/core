import BorderColorOutlinedIcon from '@mui/icons-material/BorderColorOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import { Chip, IconButton, Popover, Stack, Typography } from '@mui/material'
import { GridCellParams } from '@mui/x-data-grid'
import { FC, useState } from 'react'
import { Channel } from '../../../pages/channels'
import { Table } from '../Table'

interface ChannelsTableProps {
  data: Channel[] | []
  onEdit: (channelId: string) => void
  onDelete: (channelId: string) => void
}

export const ChannelsTable: FC<ChannelsTableProps> = ({
  data,
  onEdit,
  onDelete
}) => {
  const [morePopup, setMorePopup] = useState<HTMLElement | null>(null)
  const [channelId, setChannelId] = useState<string>('')

  const columns = [
    { field: 'name', headerName: 'Channel name', flex: 1 },
    {
      field: 'platform',
      headerName: 'Platform',
      flex: 1
    },
    {
      field: 'user',
      headerName: 'User',
      flex: 1,
      renderCell: ({ row }: GridCellParams) => {
        return (
          <Chip
            clickable={!row.user}
            label={row.user ? 'Connected' : 'Connect now'}
            color={row.user ? 'success' : 'default'}
          />
        )
      }
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
            setChannelId(row.id)
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
        title="Channels Created"
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
            onClick={() => {
              onEdit(channelId)
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
              onDelete(channelId)
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
