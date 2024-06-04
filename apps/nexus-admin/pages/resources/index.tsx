import { gql, useMutation, useQuery } from '@apollo/client'
import LoadingButton from '@mui/lab/LoadingButton'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { useGoogleLogin } from '@react-oauth/google'
import { useRouter } from 'next/router'
import { AuthAction, withUser, withUserTokenSSR } from 'next-firebase-auth'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { FC, useEffect, useState } from 'react'
import useDrivePicker from 'react-google-drive-picker'

import { getGoogleAccessToken } from '../../__generated__/getGoogleAccessToken'
import { Resource, Resource_resource } from '../../__generated__/Resource'
import { ResourceDelete } from '../../__generated__/ResourceDelete'
import { Resources, Resources_resources } from '../../__generated__/Resources'
import { ResourceUpdate } from '../../__generated__/ResourceUpdate'
import { DeleteModal } from '../../src/components/DeleteModal'
import { MainLayout } from '../../src/components/MainLayout'
import { ResourcesTable } from '../../src/components/ResourcesTable'
import { UpdateResourceModal } from '../../src/components/UpdateResourceModal'
import { getOrigin } from '../../utils/getOrigin'

import { GET_GOOGLE_ACCESS_TOKEN } from './import-youtube-template'

export const GET_RESOURCES = gql`
  query Resources($where: ResourceFilter) {
    resources(where: $where) {
      id
      name
      resourceLocalizations {
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

export const GET_RESOURCE = gql`
  query Resource($resourceId: ID!) {
    resource(id: $resourceId) {
      id
      name
      resourceLocalizations {
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
      resourceLocalizations {
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

const RESOURCE_EXPORT = gql`
  mutation ResourceExportData($input: ResourceExportData) {
    resourceExportData(input: $input) {
      name
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
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation()
  const [openPicker] = useDrivePicker()
  const [googleAccessToken, setGoogleAccessToken] = useState('')
  const [googleAccessTokenId, setGoogleAccessTokenId] = useState('')

  const { data, loading } = useQuery<Resources>(GET_RESOURCES)

  const { data: resourceData } = useQuery<Resource>(GET_RESOURCE, {
    skip: resourceId === '',
    variables: {
      resourceId
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

  const [resourceUpdate] = useMutation<ResourceUpdate>(RESOURCE_UPDATE)
  const [resourceDelete] = useMutation<ResourceDelete>(RESOURCE_DELETE)
  const [resourceExport, { loading: isExporting }] =
    useMutation(RESOURCE_EXPORT)
  const [getGoogleAccessToken] = useMutation<getGoogleAccessToken>(
    GET_GOOGLE_ACCESS_TOKEN
  )

  const googleLogin = useGoogleLogin({
    flow: 'auth-code',
    scope:
      'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/spreadsheets.readonly',
    onSuccess: async ({ code }) => {
      void getGoogleAccessToken({
        variables: {
          input: {
            url: getOrigin(),
            authCode: code
          }
        },
        onCompleted: (data) => {
          setGoogleAccessTokenId(data.getGoogleAccessToken.id as string)
          setGoogleAccessToken(data.getGoogleAccessToken.accessToken as string)
        }
      })
    }
  })

  const directoryPicker = function (): void {
    openPicker({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '',
      developerKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY ?? '',
      token: googleAccessToken ?? '',
      viewId: 'FOLDERS',
      setSelectFolderEnabled: true,
      callbackFunction: (data) => {
        if (data.action === 'picked') {
          // TODO: send to backend the access token id and the selected directory id
          const folderId = data.docs[0]?.id

          console.log({
            googleAccessTokenId,
            folderId
          })

          void resourceExport({
            variables: {
              input: {
                id: googleAccessTokenId,
                folderId
              }
            },
            onCompleted: () => {
              enqueueSnackbar('Data Exported', {
                variant: 'success',
                preventDuplicate: true
              })
            }
          })
        }
      }
    })
  }

  useEffect(() => {
    if (googleAccessToken !== '') {
      directoryPicker()
    }
  }, [googleAccessToken])

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
            onClick={() => {
              void router.push('/resources/import-youtube-template')
            }}
          >
            {t('Import from Youtube Template')}
          </Button>
          <LoadingButton
            variant="contained"
            onClick={() => {
              if (googleAccessToken === '') {
                googleLogin()
              } else {
                directoryPicker()
              }
            }}
            loading={isExporting}
            loadingIndicator="Exporting..."
          >
            {t('Export database data')}
          </LoadingButton>
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
              enqueueSnackbar('Resource Updated', {
                variant: 'success',
                preventDuplicate: true
              })
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
              enqueueSnackbar('Resource Deleted', {
                variant: 'success',
                preventDuplicate: true
              })
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
