import { Button, Stack } from '@mui/material'
import { ChannelsTable } from '../../src/components/ChannelsTable'
import { MainLayout } from '../../src/components/MainLayout'

const ChannelsPage = () => {
  return (
    <MainLayout title="Channels">
      <Stack spacing={14}>
        <Stack
          alignItems="flex-start"
          sx={{
            pt: 4
          }}
        >
          <Button variant="contained">Create New Channel</Button>
        </Stack>
        <ChannelsTable />
      </Stack>
    </MainLayout>
  )
}

export default ChannelsPage
