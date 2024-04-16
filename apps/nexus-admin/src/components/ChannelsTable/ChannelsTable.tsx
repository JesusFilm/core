import { gql, useMutation } from '@apollo/client'
import BorderColorOutlinedIcon from '@mui/icons-material/BorderColorOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { type GridCellParams } from '@mui/x-data-grid'
import { useGoogleLogin } from '@react-oauth/google'
import { type FC, useState } from 'react'

import { type Channels_channels } from '../../../__generated__/Channels'
import { type ConnectChannel } from '../../../__generated__/ConnectChannel'
import { GET_CHANNELS } from '../../../pages/channels'
import { Table } from '../Table'

const CHANNEL_CONNECT = gql`
  mutation ConnectChannel($input: ConnectYoutubeChannelInput!) {
    connectYoutubeChannel(input: $input) {
      id
      platform
      connected
    }
  }
`

interface ChannelsTableProps {
  data: Channels_channels[] | []
  onEdit: (channelId: string) => void
  onDelete: (channelId: string) => void
  loading: boolean
}

export const ChannelsTable: FC<ChannelsTableProps> = ({
  data,
  onEdit,
  onDelete,
  loading
}) => {
  const [morePopup, setMorePopup] = useState<HTMLElement | null>(null)
  const [channelId, setChannelId] = useState<string>('')
  const [channelConnect] = useMutation<ConnectChannel>(CHANNEL_CONNECT, {
    refetchQueries: [GET_CHANNELS]
  })

  const googleLogin = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: ({ code }) => {
      channelConnect({
        variables: {
          input: {
            channelId,
            authCode: code,
            redirectUri:
              process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI ??
              'http://localhost:5357'
          }
        }
      })
    },
    scope: 'https://www.googleapis.com/auth/youtube.upload'
  })

  const columns = [
    {
      field: 'image',
      headerName: 'Thumbnail',
      flex: 1,
      renderCell: ({ row }: GridCellParams) => {
        return row.youtube?.imageUrl ? (
          <Avatar src={row.youtube?.imageUrl} alt={row.name} />
        ) : null
      }
    },
    { field: 'name', headerName: 'Alias name', flex: 1 },
    {
      field: 'platform',
      headerName: 'Platform',
      flex: 1
    },
    {
      field: 'youtubeId',
      headerName: 'Youtube ID',
      flex: 2,
      renderCell: ({ row }: GridCellParams) => {
        return <>{row.youtube?.youtubeId}</>
      }
    },
    {
      field: 'youtubeName',
      headerName: 'Youtube name',
      flex: 2,
      renderCell: ({ row }: GridCellParams) => {
        return <>{row.youtube?.title}</>
      }
    },
    {
      field: 'connected',
      headerName: 'Status',
      flex: 1,
      renderCell: ({ row }: GridCellParams) => {
        return (
          <Chip
            clickable={!row.connected}
            label={row.connected ? 'Connected' : 'Connect now'}
            color={row.connected ? 'success' : 'default'}
            onClick={() => {
              setChannelId(row.id)
              googleLogin()
            }}
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
        loading={loading}
      />
      <Popover
        open={Boolean(morePopup)}
        anchorEl={morePopup}
        onClose={() => {
          setMorePopup(null)
        }}
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
