import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import { Chip, IconButton } from '@mui/material'
import { GridCellParams } from '@mui/x-data-grid'
import { FC } from 'react'
import { Table } from '../Table'

export const ChannelsTable: FC = () => {
  const columns = [
    { field: 'channelName', headerName: 'Channel name', flex: 1 },
    { field: 'category', headerName: 'Category', flex: 1 },
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
      renderCell: () => (
        <IconButton>
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

  return <Table columns={columns} rows={rows} />
}
