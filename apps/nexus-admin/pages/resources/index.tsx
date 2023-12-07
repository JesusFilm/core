import { gql, useMutation } from '@apollo/client'
import { Button, Stack } from '@mui/material'
import { useState } from 'react'
import useDrivePicker from 'react-google-drive-picker'
import { DeleteModal } from '../../src/components/DeleteModal'
import { MainLayout } from '../../src/components/MainLayout'
import { ResourcesTable } from '../../src/components/ResourcesTable'

const RESOURCE_DELETE = gql`
  mutation ResourceDelete($resourceId: ID!) {
    resourceDelete(id: $resourceId) {
      id
      name
      nexusId
      refLink
      videoId
    }
  }
`

export type Resource = {
  id: string
  name: string
  videoId: string
}

const ResourcesPage = () => {
  const [deleteResourceModal, setDeleteResourceModal] = useState<boolean>(false)
  const [resourceId, setResourceId] = useState<string>('')
  const [openPicker, authResponse] = useDrivePicker()
  const [resourceDelete] = useMutation(RESOURCE_DELETE)

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
        <ResourcesTable
          data={[
            {
              id: '1',
              name: 'Test',
              videoId: '23125Asdafa9821cxdsfrw2'
            }
          ]}
          onEdit={(resourceId) => {
            setResourceId(resourceId)
            setDeleteResourceModal(true)
          }}
          onDelete={(resourceId) => {
            setResourceId(resourceId)
            setDeleteResourceModal(true)
          }}
        />
      </Stack>
      <DeleteModal
        open={deleteResourceModal}
        onClose={() => setDeleteResourceModal(false)}
        content="Are you sure you would like to delete this resource?"
        onDelete={() => {
          resourceDelete({
            variables: {
              resourceId
            },
            onCompleted: () => {
              setDeleteResourceModal(false)
            }
          })
        }}
      />
    </MainLayout>
  )
}

export default ResourcesPage
