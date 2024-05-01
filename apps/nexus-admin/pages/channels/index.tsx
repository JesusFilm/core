import { gql, useMutation, useQuery } from '@apollo/client'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { AuthAction, withUser, withUserTokenSSR } from 'next-firebase-auth'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { FC, useEffect, useState } from 'react'

import { Channel, Channel_channel } from '../../__generated__/Channel'
import { ChannelCreate } from '../../__generated__/ChannelCreate'
import { ChannelDelete } from '../../__generated__/ChannelDelete'
import { Channels, Channels_channels } from '../../__generated__/Channels'
import { ChannelUpdate } from '../../__generated__/ChannelUpdate'
import { ChannelsTable } from '../../src/components/ChannelsTable'
import { CreateChannelModal } from '../../src/components/CreateChannelModal'
import { DeleteModal } from '../../src/components/DeleteModal'
import { PageWrapper } from '../../src/components/PageWrapper'
import { UpdateChannelModal } from '../../src/components/UpdateChannelModal'

export const GET_CHANNELS = gql`
  query Channels($where: ChannelFilter) {
    channels(where: $where) {
      id
      name
      platform
      connected
      status
      youtube {
        title
        youtubeId
        channelId
        imageUrl
      }
    }
  }
`

const GET_CHANNEL = gql`
  query Channel($channelID: ID!) {
    channel(id: $channelID) {
      id
      name
      platform
    }
  }
`

const CHANNEL_CREATE = gql`
  mutation ChannelCreate($input: ChannelCreateInput!) {
    channelCreate(input: $input) {
      id
      name
      platform
    }
  }
`

const CHANNEL_UPDATE = gql`
  mutation ChannelUpdate($channelId: ID!, $input: ChannelUpdateInput!) {
    channelUpdate(id: $channelId, input: $input) {
      id
      name
      platform
    }
  }
`

const CHANNEL_DELETE = gql`
  mutation ChannelDelete($channelId: ID!) {
    channelDelete(id: $channelId) {
      id
      name
      platform
    }
  }
`

const ChannelsPage: FC = () => {
  const [openCreateChannelModal, setOpenCreateChannelModal] =
    useState<boolean>(false)
  const [openUpdateChannelModal, setOpenUpdateChannelModal] =
    useState<boolean>(false)
  const [deleteChannelModal, setDeleteChannelModal] = useState<boolean>(false)
  const [channelId, setChannelId] = useState<string>('')
  const [channels, setChannels] = useState<Channels_channels[]>([])
  const nexusId =
    typeof window !== 'undefined' ? localStorage.getItem('nexusId') : ''
  const [channel, setChannel] = useState<Channel_channel | null>(null)
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation()

  const { data, loading } = useQuery<Channels>(GET_CHANNELS, {
    variables: {
      where: {
        status: 'published',
        nexusId
      }
    }
  })

  const { data: channelData } = useQuery<Channel>(GET_CHANNEL, {
    skip: channelId === '',
    variables: {
      channelID: channelId,
      nexusId
    }
  })

  const [channelCreate] = useMutation<ChannelCreate>(CHANNEL_CREATE)
  const [channelUpdate] = useMutation<ChannelUpdate>(CHANNEL_UPDATE)
  const [channelDelete] = useMutation<ChannelDelete>(CHANNEL_DELETE)

  useEffect(() => {
    if (data !== undefined) {
      setChannels(data?.channels as Channels_channels[])
    }
  }, [data])

  useEffect(() => {
    if (channelData !== undefined) {
      setChannel(channelData?.channel)
    }
  }, [channelData])

  return (
    <PageWrapper title="Channels">
      <Stack spacing={14}>
        <Stack
          alignItems="flex-start"
          sx={{
            pt: 4
          }}
        >
          <Button
            variant="contained"
            onClick={() => setOpenCreateChannelModal(true)}
          >
            {t('Connect Channel')}
          </Button>
        </Stack>
        <ChannelsTable
          loading={loading}
          data={channels}
          onEdit={(channelId) => {
            setChannelId(channelId)
            setOpenUpdateChannelModal(true)
          }}
          onDelete={(channelId) => {
            setChannelId(channelId)
            setDeleteChannelModal(true)
          }}
        />
      </Stack>
      <CreateChannelModal
        open={openCreateChannelModal}
        onClose={() => setOpenCreateChannelModal(false)}
        onCreate={(channelData) => {
          void channelCreate({
            variables: {
              input: { nexusId, ...channelData }
            },
            onCompleted: () => {
              setOpenCreateChannelModal(false)
              enqueueSnackbar('Channel Created', {
                variant: 'success',
                preventDuplicate: true
              })
            },
            refetchQueries: [GET_CHANNELS]
          })
        }}
      />
      <UpdateChannelModal
        open={openUpdateChannelModal}
        onClose={() => setOpenUpdateChannelModal(false)}
        data={channel}
        onUpdate={(channelData) => {
          void channelUpdate({
            variables: {
              channelId,
              input: channelData
            },
            onCompleted: () => {
              setOpenUpdateChannelModal(false)
              enqueueSnackbar('Channel Updated', {
                variant: 'success',
                preventDuplicate: true
              })
            },
            refetchQueries: [GET_CHANNELS]
          })
        }}
      />
      <DeleteModal
        open={deleteChannelModal}
        onClose={() => setDeleteChannelModal(false)}
        content="Are you sure you would like to delete this channel?"
        onDelete={() => {
          void channelDelete({
            variables: {
              channelId
            },
            onCompleted: () => {
              setDeleteChannelModal(false)
              enqueueSnackbar('Channel Deleted', {
                variant: 'success',
                preventDuplicate: true
              })
            },
            refetchQueries: [GET_CHANNELS]
          })
        }}
      />
    </PageWrapper>
  )
}

export const getServerSideProps = withUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ user }) => {
  const token = await user?.getIdToken()

  return {
    props: {
      token
    }
  }
})

export default withUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(ChannelsPage)
