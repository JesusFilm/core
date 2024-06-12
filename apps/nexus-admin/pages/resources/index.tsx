import { gql, useMutation, useQuery } from '@apollo/client'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { useRouter } from 'next/router'
import { AuthAction, withUser, withUserTokenSSR } from 'next-firebase-auth'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { FC, useEffect, useState } from 'react'

import { Resource, Resource_resource } from '../../__generated__/Resource'
import { ResourceDelete } from '../../__generated__/ResourceDelete'
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
  query Resource($id: ID!) {
    resource(id: $id) {
      id
      name
      customThumbnail
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

// const RESOURCE_EXPORT = gql`
//   mutation ResourceExportData($input: ResourceExportData) {
//     resourceExportData(input: $input) {
//       name
//     }
//   }
// `

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
  // const [resourceExport, { loading: isExporting }] =
  //   useMutation(RESOURCE_EXPORT)

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
          {/* <LoadingButton
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
          </LoadingButton> */}
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
