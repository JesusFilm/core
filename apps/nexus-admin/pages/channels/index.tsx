import { gql, useMutation, useQuery } from '@apollo/client'
import { Button, Stack } from '@mui/material'
import { useEffect, useState } from 'react'
import { ChannelsTable } from '../../src/components/ChannelsTable'
import { CreateChannelModal } from '../../src/components/CreateChannelModal'
import { DeleteModal } from '../../src/components/DeleteModal'
import { MainLayout } from '../../src/components/MainLayout'
import { UpdateChannelModal } from '../../src/components/UpdateChannelModal'

const GET_CHANNELS = gql`
  query {
    channels {
      id
      nexusId
      name
      platform
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
      nexusId
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

export type Channel = {
  id: string
  name: string
  platform: string
}

const ChannelsPage = () => {
  const [openCreateChannelModal, setOpenCreateChannelModal] =
    useState<boolean>(false)
  const [openUpdateChannelModal, setOpenUpdateChannelModal] =
    useState<boolean>(false)
  const [deleteChannelModal, setDeleteChannelModal] = useState<boolean>(false)
  const [channelId, setChannelId] = useState<string>('')
  const [channels, setChannels] = useState<Channel[] | []>([])
  const nexusId =
    typeof window !== 'undefined' ? localStorage.getItem('nexusId') : ''
  const [channel, setChannel] = useState<Channel | null>(null)

  const { data } = useQuery(GET_CHANNELS)
  const { data: channelData } = useQuery(GET_CHANNEL, {
    skip: !channelId,
    variables: {
      channelID: channelId,
      nexusId
    }
  })

  const [channelCreate] = useMutation(CHANNEL_CREATE)
  const [channelUpdate] = useMutation(CHANNEL_UPDATE)
  const [channelDelete] = useMutation(CHANNEL_DELETE)

  useEffect(() => {
    if (data) {
      setChannels(data?.channels)
    }
  }, [data])

  useEffect(() => {
    if (channelData) {
      setChannel(channelData?.channel)
    }
  }, [channelData])

  return (
    <MainLayout title="Channels">
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
            Create New Channel
          </Button>
        </Stack>
        <ChannelsTable
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
          channelCreate({
            variables: {
              input: { nexusId, ...channelData }
            },
            onCompleted: () => {
              setOpenCreateChannelModal(false)
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
          channelUpdate({
            variables: {
              channelId,
              input: channelData
            },
            onCompleted: () => {
              setOpenUpdateChannelModal(false)
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
          channelDelete({
            variables: {
              channelId
            },
            onCompleted: () => {
              setDeleteChannelModal(false)
            },
            refetchQueries: [GET_CHANNELS]
          })
        }}
      />
    </MainLayout>
  )
}

export default ChannelsPage
