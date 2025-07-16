'use client'

import { useMutation, useSuspenseQuery } from '@apollo/client'
import { useRouter } from 'next/navigation'
import { enqueueSnackbar } from 'notistack'

import { graphql } from '@core/shared/gql'
import { Dialog } from '@core/shared/ui/Dialog'

const REMOVE_VIDEO_CHILD = graphql(`
  mutation RemoveVideoChild($input: VideoUpdateInput!) {
    videoUpdate(input: $input) {
      id
      children {
        id
        title {
          id
          value
        }
        images(aspectRatio: banner) {
          id
          mobileCinematicHigh
        }
        imageAlt {
          id
          value
        }
      }
    }
  }
`)

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

interface DeleteChildProps {
  params: {
    videoId: string
    childId: string
  }
}

export default function DeleteChild({
  params: { videoId, childId }
}: DeleteChildProps) {
  const router = useRouter()
  const { data } = useSuspenseQuery(GET_VIDEO_CHILDREN, {
    variables: { id: videoId }
  })
  const returnUrl = `/videos/${videoId}/children`
  const [removeVideoChild, { loading }] = useMutation(REMOVE_VIDEO_CHILD)

  const handleRemoveChild = async (): Promise<void> => {
    // Remove child by updating the childIds array without the removed child
    const updatedChildIds = data.adminVideo.children
      .map((video) => video.id)
      .filter((id) => id !== childId)

    await removeVideoChild({
      variables: {
        input: {
          id: videoId,
          childIds: updatedChildIds
        }
      },
      onCompleted: () => {
        enqueueSnackbar('Successfully removed child video.', {
          variant: 'success'
        })
        router.push(returnUrl, {
          scroll: false
        })
      },
      onError: () => {
        enqueueSnackbar('Failed to remove child video.', {
          variant: 'error'
        })
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
        title: 'Delete Child Video',
        closeButton: true
      }}
      dialogAction={{
        onSubmit: handleRemoveChild,
        submitLabel: 'Delete',
        closeLabel: 'Cancel'
      }}
      loading={loading}
    >
      {`Are you sure you want to delete the video child? This action cannot be undone.`}
    </Dialog>
  )
}
