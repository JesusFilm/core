import { Button, Stack } from '@mui/material'
import { useState } from 'react'
import { ChannelsTable } from '../../src/components/ChannelsTable'
import { CreateChannelModal } from '../../src/components/CreateChannelModal'
import { MainLayout } from '../../src/components/MainLayout'

const ChannelsPage = () => {
  const [openCreateChannelModal, setOpenCreateChannelModal] =
    useState<boolean>(false)

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
        <ChannelsTable />
      </Stack>
      <CreateChannelModal
        open={openCreateChannelModal}
        onClose={() => setOpenCreateChannelModal(false)}
      />
    </MainLayout>
  )
}

export default ChannelsPage
