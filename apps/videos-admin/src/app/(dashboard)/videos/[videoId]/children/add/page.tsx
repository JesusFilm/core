'use client'

import { useMutation, useSuspenseQuery } from '@apollo/client'
import { graphql } from 'gql.tada'
import { useRouter } from 'next/navigation'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

import { VideoCreateForm } from '../../../_VideoCreateForm'

const GET_VIDEO_CHILDREN = graphql(`
  query GetVideoChildren($id: ID!) {
    adminVideo(id: $id) {
      id
      children {
        id
      }
    }
  }
`)

const UPDATE_VIDEO_CHILDREN_ORDER = graphql(`
  mutation UpdateVideoChildrenOrder($input: VideoUpdateInput!) {
    videoUpdate(input: $input) {
      id
      children {
        id
      }
    }
  }
`)

interface AddChildrenProps {
  params: {
    videoId: string
  }
}

export default function AddChildren({
  params: { videoId }
}: AddChildrenProps): ReactElement {
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()

  const { data } = useSuspenseQuery(GET_VIDEO_CHILDREN, {
    variables: { id: videoId }
  })

  const returnUrl = `/videos/${videoId}/children`

  const [updateVideoChildrenOrder] = useMutation(UPDATE_VIDEO_CHILDREN_ORDER, {
    onCompleted: () => {
      enqueueSnackbar('Successfully added video as child.', {
        variant: 'success'
      })
      router.push(returnUrl, {
        scroll: false
      })
    },
    onError: () => {
      enqueueSnackbar('Failed to add video as child.', {
        variant: 'error'
      })
    }
  })
  const handleCreateSuccess = async (newVideoId: string): Promise<void> => {
    // After child video is created, update the parent's childIds
    await updateVideoChildrenOrder({
      variables: {
        input: {
          id: videoId,
          childIds: [
            ...data.adminVideo.children.map(({ id }) => id),
            newVideoId
          ]
        }
      }
    })
  }

  return (
    <Dialog
      open={true}
      onClose={() =>
        router.push(returnUrl, {
          scroll: false
        })
      }
      dialogTitle={{
        title: 'Create New Child Video',
        closeButton: true
      }}
      divider
      sx={{ '& .MuiDialog-paperFullWidth': { maxWidth: 480 } }}
    >
      <VideoCreateForm
        parentId={videoId}
        onCreateSuccess={handleCreateSuccess}
      />
    </Dialog>
  )
}
