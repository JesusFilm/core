import { gql, useMutation, useQuery } from '@apollo/client'
import { Button, Stack } from '@mui/material'
import { useEffect, useState } from 'react'
import useDrivePicker from 'react-google-drive-picker'
import { DeleteModal } from '../../src/components/DeleteModal'
import { MainLayout } from '../../src/components/MainLayout'
import { ResourcesTable } from '../../src/components/ResourcesTable'

export const GET_RESOURCES = gql`
  query {
    resources {
      id
      name
      videoId
    }
  }
`

const RESOURCE_LOAD = gql`
  mutation AddResourceFromGoogleDrive(
    $input: AddResourceFromGoogleDriveInput!
  ) {
    addResourcefromGoogleDrive(input: $input) {
      id
      name
      videoId
    }
  }
`

const RESOURCE_DELETE = gql`
  mutation ResourceDelete($resourceId: ID!) {
    resourceDelete(id: $resourceId) {
      id
      name
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
  const [resources, setResources] = useState<Resource[] | []>([])
  const [openPicker, authResponse] = useDrivePicker()
  const nexusId =
    typeof window !== 'undefined' ? localStorage.getItem('nexusId') : ''

  const { data } = useQuery(GET_RESOURCES)

  useEffect(() => {
    if (data) {
      setResources(data?.resources)
    }
  }, [data])

  const [resourceDelete] = useMutation(RESOURCE_DELETE)
  const [resourceLoad] = useMutation(RESOURCE_LOAD)

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

        if (data.action === 'picked') {
          loadResourceFromGoogleDrive(data.docs?.[0]?.id)
        }
      }
    })
  }

  const loadResourceFromGoogleDrive = (fileId: string) => {
    const accessToken = authResponse?.access_token

    resourceLoad({
      variables: {
        input: {
          accessToken,
          fileId,
          nexusId
        }
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
          data={resources}
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
