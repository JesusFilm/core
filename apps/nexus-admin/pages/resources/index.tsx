import { Button, Stack } from '@mui/material'
import { useState } from 'react'
import useDrivePicker from 'react-google-drive-picker'
import { DeleteModal } from '../../src/components/DeleteModal'
import { MainLayout } from '../../src/components/MainLayout'
import { ResourcesTable } from '../../src/components/ResourcesTable'

const ResourcesPage = () => {
  const [deleteResourceModal, setDeleteResourceModal] = useState<boolean>(false)
  const [openPicker, authResponse] = useDrivePicker()

  const openGooglePicker = () => {
    openPicker({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '',
      developerKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY ?? '',
      viewId: 'DOCS_VIDEOS',
      showUploadView: true,
      showUploadFolders: true,
      supportDrives: true,
      callbackFunction: (data) => {
        if (data.action === 'cancel') {
          console.log('User clicked cancel/close button')
        }
        console.log(data)
        console.log(authResponse)
      }
    })
  }

  return (
    <MainLayout title="Resources">
      <Stack spacing={14}>
        <Stack
          alignItems="flex-start"
          sx={{
            pt: 4
          }}
        >
          <Button variant="contained" onClick={() => openGooglePicker()}>
            Load from Google drive
          </Button>
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
