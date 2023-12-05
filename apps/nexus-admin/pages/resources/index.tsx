import { Button, Stack } from '@mui/material'
import { useState } from 'react'
import { DeleteModal } from '../../src/components/DeleteModal'
import { MainLayout } from '../../src/components/MainLayout'
import { ResourcesTable } from '../../src/components/ResourcesTable'

const ResourcesPage = () => {
  const [deleteResourceModal, setDeleteResourceModal] = useState<boolean>(false)

  return (
    <MainLayout title="Resources">
      <Stack spacing={14}>
        <Stack
          alignItems="flex-start"
          sx={{
            pt: 4
          }}
        >
          <Button variant="contained">Load from Google drive</Button>
        </Stack>
        <ResourcesTable />
      </Stack>
      <DeleteModal
        open={deleteResourceModal}
        onClose={() => setDeleteResourceModal(false)}
        content="Are you sure you would like to delete this resource?"
        onDelete={() => {}}
      />
    </MainLayout>
  )
}

export default ResourcesPage
