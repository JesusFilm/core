import { gql, useMutation } from '@apollo/client'
import BorderColorOutlinedIcon from '@mui/icons-material/BorderColorOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { DataGrid, GridCellParams } from '@mui/x-data-grid'
import { useGoogleLogin } from '@react-oauth/google'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { FC, useState } from 'react'

import { ChannelConnect_channelConnect } from '../../../__generated__/ChannelConnect'
import { Channels_channels } from '../../../__generated__/Channels'
import { GET_CHANNELS } from '../../../pages/channels'

import { ChannelsTableHeader } from './ChannelsTableHeader'

const CHANNEL_CONNECT = gql`
  mutation ChannelConnect($input: ConnectYoutubeChannelInput!) {
    channelConnect(input: $input) {
      id
    }
  }
`

interface ChannelsTableProps {
  data: Channels_channels[] | []
  onEdit: (channel: Channels_channels) => void
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
  const [channel, setChannel] = useState<Channels_channels | null>(null)
  const [channelConnect] = useMutation<ChannelConnect_channelConnect>(
    CHANNEL_CONNECT,
    {
      refetchQueries: [GET_CHANNELS]
    }
  )
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10
  })
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation()

  const googleLogin = useGoogleLogin({
    flow: 'implicit',
    onSuccess: ({ access_token: accessToken }) => {
      void channelConnect({
        variables: {
          input: {
            channelId,
            accessToken
          }
        },
        onCompleted: () => {
          enqueueSnackbar('Channel Connected', {
            variant: 'success',
            preventDuplicate: true
          })
        }
      })
    },
    scope:
      'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtube.channel-memberships.creator https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtubepartner https://www.googleapis.com/auth/youtube.force-ssl'
  })

  const columns = [
    {
      field: 'image',
      headerName: 'Thumbnail',
      flex: 1,
      sortable: false,
      renderCell: ({ row }: GridCellParams) => {
        if (row.youtube === null) return null

        return row.youtube?.imageUrl !== '' ? (
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
      flex: 2
    },
    {
      field: 'title',
      headerName: 'Youtube name',
      flex: 2
    },
    {
      field: 'connected',
      headerName: 'Status',
      flex: 1,
      sortable: false,
      renderCell: ({ row }: GridCellParams<Channels_channels>) => {
        return (
          <Chip
            clickable={row.connected !== true}
            label={row.connected === true ? 'Connected' : 'Connect now'}
            color={row.connected === true ? 'success' : 'default'}
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
      renderCell: ({ row }: GridCellParams<Channels_channels>) => (
        <IconButton
          onClick={(event) => {
            setMorePopup(event.currentTarget)
            setChannelId(row.id)
            setChannel(row)
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
          toolbar: ChannelsTableHeader
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
              onEdit(channel as Channels_channels)
              setMorePopup(null)
            }}
          >
            <BorderColorOutlinedIcon />
            <Typography>{t('Edit')}</Typography>
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
            <Typography>{t('Delete')}</Typography>
          </Stack>
        </Stack>
      </Popover>
    </Paper>
  )
}
