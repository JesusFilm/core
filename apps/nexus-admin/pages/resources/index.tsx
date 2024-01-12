import { gql, useMutation, useQuery } from '@apollo/client'
import { Button, Stack } from '@mui/material'
import { AuthAction, withUser, withUserTokenSSR } from 'next-firebase-auth'
import { useRouter } from 'next/navigation'
import { FC, useEffect, useState } from 'react'
import useDrivePicker from 'react-google-drive-picker'
import {
  PickerCallback,
  PickerConfiguration
} from 'react-google-drive-picker/dist/typeDefs'

import { Resource, Resource_resource } from '../../__generated__/Resource'
import { ResourceDelete } from '../../__generated__/ResourceDelete'
import { ResourceFromGoogleDrive } from '../../__generated__/ResourceFromGoogleDrive'
import { Resources, Resources_resources } from '../../__generated__/Resources'
import { ResourceUpdate } from '../../__generated__/ResourceUpdate'
import { DeleteModal } from '../../src/components/DeleteModal'
import { MainLayout } from '../../src/components/MainLayout'
import { ResourcesTable } from '../../src/components/ResourcesTable'
import { UpdateResourceModal } from '../../src/components/UpdateResourceModal'

export const GET_RESOURCES = gql`
  query Resources($where: ResourceFilter) {
    resources(where: $where) {
      id
      name
      localizations {
        id
        keywords
        language
        resourceId
        title
        description
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
      localizations {
        id
        keywords
        language
        resourceId
        title
        description
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
      localizations {
        id
        keywords
        language
        resourceId
        title
        description
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
      localizations {
        id
        keywords
        language
        resourceId
        title
        description
      }
      status
    }
  }
`

const RESOURCE_DELETE = gql`
  mutation ResourceDelete($resourceId: ID!) {
    resourceDelete(id: $resourceId) {
      id
    }
  }
`

const ResourcesPage: FC = () => {
  const [deleteResourceModal, setDeleteResourceModal] = useState<boolean>(false)
  const [resourceId, setResourceId] = useState<string>('')
  const [resources, setResources] = useState<Resources_resources[]>([])
  const [resource, setResource] = useState<Resource_resource | null>(null)
  const [openUpdateResourceModal, setOpenUpdateResourceModal] =
    useState<boolean>(false)

  const [openPicker] = useDrivePicker()
  const isSSRMode = typeof window !== 'undefined'
  const nexusId = isSSRMode ? localStorage.getItem('nexusId') : ''
  const router = useRouter()

  const { data, loading } = useQuery<Resources>(GET_RESOURCES, {
    variables: {
      where: {
        status: 'published',
        nexusId
      }
    }
  })

  const { data: resourceData } = useQuery<Resource>(GET_RESOURCE, {
    skip: !resourceId,
    variables: {
      resourceId,
      nexusId
    }
  })

  useEffect(() => {
    if (data != null) {
      setResources(data?.resources as Resources_resources[])
    }
  }, [data])

  useEffect(() => {
    if (resourceData != null) {
      setResource(resourceData?.resource)
    }
  }, [resourceData])

  const [resourceLoad] = useMutation<ResourceFromGoogleDrive>(RESOURCE_LOAD)
  const [resourceUpdate] = useMutation<ResourceUpdate>(RESOURCE_UPDATE)
  const [resourceDelete] = useMutation<ResourceDelete>(RESOURCE_DELETE)

  const openGooglePicker = async () => {
    // eslint-disable-next-line import/dynamic-import-chunkname
    const gapi = await import('gapi-script').then((module) => module.gapi)

    gapi.load('client:auth2', () => {
      gapi.client
        .init({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY
        })
        .then(() => {
          let tokenInfo = gapi.auth.getToken()

          const pickerConfig: PickerConfiguration = {
            clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '',
            developerKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY ?? '',
            viewId: 'DOCS_VIDEOS',
            token: tokenInfo ? tokenInfo.access_token : '',
            showUploadView: true,
            showUploadFolders: true,
            supportDrives: true,
            multiselect: true,
            callbackFunction: (data: PickerCallback) => {
              const elements = Array.from(
                document.getElementsByClassName(
                  'picker-dialog'
                ) as HTMLCollectionOf<HTMLElement>
              )

              for (let i = 0; i < elements.length; i++) {
                elements[i].style.zIndex = '2000'
              }

              if (data.action === 'picked') {
                if (!tokenInfo) {
                  tokenInfo = gapi.auth.getToken()
                }

                console.log(data)

                const fileIds: string[] = []

                data.docs.forEach((doc) => fileIds.push(doc.id))

                loadResourceFromGoogleDrive(fileIds, tokenInfo.access_token)
              }
            }
          }
          openPicker(pickerConfig)
        })
    })
  }

  const loadResourceFromGoogleDrive = (
    fileIds: string[],
    accessToken: string
  ) => {
    void resourceLoad({
      variables: {
        input: {
          authCode: accessToken,
          fileIds,
          nexusId
        }
      },
      refetchQueries: [GET_RESOURCES]
    })
  }

  return (
    <MainLayout title="Resources">
      <Stack spacing={14}>
        <Stack
          direction="row"
          alignItems="center"
          spacing={4}
          sx={{
            pt: 4
          }}
        >
          <Button
            variant="contained"
            onClick={async () => await openGooglePicker()}
          >
            Load from Google drive
          </Button>
          <Button
            variant="contained"
            onClick={() => router.push('/resources/import-youtube-template')}
          >
            Import from Youtube Template
          </Button>
        </Stack>
        <ResourcesTable
          loading={loading}
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
          void resourceUpdate({
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
          void resourceDelete({
            variables: {
              resourceId
            },
            onCompleted: () => {
              setDeleteResourceModal(false)
            },
            refetchQueries: [GET_RESOURCES]
          })
        }}
      />
    </MainLayout>
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
})(ResourcesPage)
