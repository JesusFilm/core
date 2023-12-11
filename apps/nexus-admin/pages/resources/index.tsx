import { gql, useMutation, useQuery } from '@apollo/client'
import { Button, Stack } from '@mui/material'
import { AuthAction, withUser } from 'next-firebase-auth'
import { useEffect, useState } from 'react'
import useDrivePicker from 'react-google-drive-picker'
import { DeleteModal } from '../../src/components/DeleteModal'
import { MainLayout } from '../../src/components/MainLayout'
import { ResourcesTable } from '../../src/components/ResourcesTable'
import { UpdateResourceModal } from '../../src/components/UpdateResourceModal'

export const GET_RESOURCES = gql`
  query Resources {
    resources {
      id
      name
      googleDrive {
        title
        driveId
      }
      status
    }
  }
`

const GET_RESOURCE = gql`
  query Resource($resourceId: ID!) {
    resource(id: $resourceId) {
      id
      name
      googleDrive {
        title
        driveId
      }
      status
    }
  }
`

const RESOURCE_LOAD = gql`
  mutation ResourceFromGoogleDrive($input: ResourceFromGoogleDriveInput!) {
    resourceFromGoogleDrive(input: $input) {
      id
      name
      googleDrive {
        title
        driveId
      }
      status
    }
  }
`

const RESOURCE_UPDATE = gql`
  mutation ResourceUpdate($resourceId: ID!, $input: ResourceUpdateInput!) {
    resourceUpdate(id: $resourceId, input: $input) {
      id
      name
      googleDrive {
        title
        driveId
      }
      status
    }
  }
`

const RESOURCE_DELETE = gql`
  mutation ResourceDelete($resourceId: ID!) {
    resourceDelete(id: $resourceId)
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
  const [resource, setResource] = useState<Resource | null>(null)
  const [openUpdateResourceModal, setOpenUpdateResourceModal] =
    useState<boolean>(false)

  const [openPicker, authResponse] = useDrivePicker()
  const nexusId =
    typeof window !== 'undefined' ? localStorage.getItem('nexusId') : ''

  const { data } = useQuery(GET_RESOURCES)
  const { data: resourceData } = useQuery(GET_RESOURCE, {
    skip: !resourceId,
    variables: {
      resourceId,
      nexusId
    }
  })

  useEffect(() => {
    if (data) {
      setResources(data?.resources)
    }
  }, [data])

  useEffect(() => {
    if (resourceData) {
      setResource(resourceData?.resource)
    }
  }, [resourceData])

  const [resourceLoad] = useMutation(RESOURCE_LOAD)
  const [resourceUpdate] = useMutation(RESOURCE_UPDATE)
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
            setOpenUpdateResourceModal(true)
          }}
          onDelete={(resourceId) => {
            setResourceId(resourceId)
            setDeleteResourceModal(true)
          }}
        />
      </Stack>
      <UpdateResourceModal
        open={openUpdateResourceModal}
        onClose={() => setOpenUpdateResourceModal(false)}
        data={resource}
        onUpdate={(resourceData) => {
          resourceUpdate({
            variables: {
              resourceId,
              input: resourceData
            },
            onCompleted: () => {
              setOpenUpdateResourceModal(false)
            },
            refetchQueries: [GET_RESOURCES]
          })
        }}
      />
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

export default withUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(ResourcesPage)
