import { useMutation } from '@apollo/client'
import { DragEndEvent } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { graphql } from 'gql.tada'
import { usePathname, useRouter } from 'next/navigation'
import { useSnackbar } from 'notistack'
import { ReactElement, useEffect, useState } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'
import Plus2 from '@core/shared/ui/icons/Plus2'

import { OrderedList } from '../../../../../../components/OrderedList'
import { OrderedItem } from '../../../../../../components/OrderedList/OrderedItem'
import { GetAdminVideo_AdminVideo_Children as AdminVideoChildren } from '../../../../../../libs/useAdminVideo'
import { GET_ADMIN_VIDEO } from '../../../../../../libs/useAdminVideo/useAdminVideo'
import { VideoCreateForm } from '../../../_VideoList/VideoCreateForm'
import { Section } from '../Section'

interface ChildrenProps {
  videoId: string
  childVideos: AdminVideoChildren
  label: 'Items' | 'Clips' | 'Episodes'
}

export const VIDEO_CHILDREN_ORDER_UPDATE = graphql(`
  mutation VideoChildrenOrderUpdate($input: VideoUpdateInput!) {
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

export const REMOVE_VIDEO_CHILD = graphql(`
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

export function VideoChildren({
  videoId,
  childVideos,
  label
}: ChildrenProps): ReactElement {
  const pathname = usePathname()
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()

  const [videos, setVideos] = useState(childVideos || [])
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  // Update local state when childVideos prop changes
  useEffect(() => {
    if (childVideos) {
      setVideos(childVideos)
    }
  }, [childVideos])

  const [updateVideoChildrenOrder] = useMutation(VIDEO_CHILDREN_ORDER_UPDATE, {
    refetchQueries: [
      {
        query: GET_ADMIN_VIDEO,
        variables: { videoId }
      }
    ]
  })

  const [removeVideoChild] = useMutation(REMOVE_VIDEO_CHILD, {
    refetchQueries: [
      {
        query: GET_ADMIN_VIDEO,
        variables: { videoId }
      }
    ]
  })

  const handleOpenCreateDialog = (): void => {
    setShowCreateDialog(true)
  }

  const handleCreateSuccess = async (newVideoId: string): Promise<void> => {
    try {
      // After child video is created, update the parent's childIds
      const result = await updateVideoChildrenOrder({
        variables: {
          input: {
            id: videoId,
            childIds: [...videos.map((video) => video.id), newVideoId]
          }
        },
        update: (cache, { data }) => {
          if (data?.videoUpdate?.children) {
            // Update the local state with the new list of children
            setVideos(data.videoUpdate.children)

            // Update the cache for any queries that use this video's children
            cache.modify({
              id: cache.identify({ __typename: 'Video', id: videoId }),
              fields: {
                children: () => data.videoUpdate.children
              }
            })
          }
        }
      })

      if (result.data?.videoUpdate?.children) {
        enqueueSnackbar('Successfully added video as child.', {
          variant: 'success'
        })
      }
    } catch (error) {
      enqueueSnackbar('Failed to add video as child.', {
        variant: 'error'
      })
    } finally {
      setShowCreateDialog(false)
    }
  }

  const handleRemoveChild = async (childId: string): Promise<void> => {
    try {
      // Remove child by updating the childIds array without the removed child
      const updatedChildIds = videos
        .map((video) => video.id)
        .filter((id) => id !== childId)

      const result = await removeVideoChild({
        variables: {
          input: {
            id: videoId,
            childIds: updatedChildIds
          }
        },
        update: (cache, { data }) => {
          if (data?.videoUpdate?.children) {
            // Update the local state with the new list of children
            setVideos(data.videoUpdate.children)

            // Update the cache for any queries that use this video's children
            cache.modify({
              id: cache.identify({ __typename: 'Video', id: videoId }),
              fields: {
                children: () => data.videoUpdate.children
              }
            })
          }
        }
      })

      if (result.data?.videoUpdate?.children) {
        enqueueSnackbar('Successfully removed child video.', {
          variant: 'success'
        })
      }
    } catch (error) {
      enqueueSnackbar('Failed to remove child video.', {
        variant: 'error'
      })
    }
  }

  if (!childVideos || childVideos.length === 0) {
    return (
      <Section
        title={label}
        boxProps={{
          sx: { p: 2, height: 'calc(100vh - 400px)', overflowY: 'scroll' }
        }}
        variant="outlined"
        action={{
          label: 'Add',
          startIcon: <Plus2 />,
          onClick: handleOpenCreateDialog
        }}
      >
        <Section.Fallback>No children to show</Section.Fallback>

        <Dialog
          open={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          dialogTitle={{
            title: `Create New ${label.slice(0, -1)}`,
            closeButton: true
          }}
          divider
          sx={{ '& .MuiDialog-paperFullWidth': { maxWidth: 480 } }}
        >
          <VideoCreateForm
            parentId={videoId}
            close={() => setShowCreateDialog(false)}
            onCreateSuccess={handleCreateSuccess}
          />
        </Dialog>
      </Section>
    )
  }

  function handleClick(id: string): void {
    if (pathname == null) return
    const [, locale, entity] = pathname.split('/')
    router.push(`/${locale}/${entity}/${id}`)
  }

  function handleEditClick(id: string): void {
    router.push(`/videos/${id}`)
  }

  async function updateOrderOnDrag(e: DragEndEvent): Promise<void> {
    const { active, over } = e
    if (over == null) return
    if (e.active.id !== over.id) {
      const oldIndex = videos.findIndex((item) => item.id === active.id)
      const newIndex = videos.findIndex((item) => item.id === over.id)
      const newOrder = arrayMove(videos, oldIndex, newIndex)
      setVideos(newOrder)
      await updateVideoChildrenOrder({
        variables: {
          input: {
            id: videoId,
            childIds: newOrder.map((video) => video.id)
          }
        }
      })
    }
  }

  return (
    <Section
      title={label}
      boxProps={{
        sx: { p: 2, height: 'calc(100vh - 400px)', overflowY: 'scroll' }
      }}
      variant="outlined"
      action={{
        label: 'Add',
        startIcon: <Plus2 />,
        onClick: handleOpenCreateDialog
      }}
    >
      {videos.length > 0 ? (
        <OrderedList onOrderUpdate={updateOrderOnDrag} items={videos}>
          {videos.map(({ id, title, images, imageAlt }, i) => (
            <OrderedItem
              key={id}
              id={id}
              label={title?.[0]?.value ?? 'Untitled Video'}
              subtitle={id}
              idx={i}
              img={{
                src: images?.[0]?.mobileCinematicHigh ?? '',
                alt: imageAlt?.[0]?.value ?? 'Video thumbnail'
              }}
              sx={{
                cursor: 'pointer'
              }}
              onClick={() => handleClick(id)}
              menuActions={[
                {
                  label: 'Edit',
                  handler: handleEditClick
                },
                {
                  label: 'Remove',
                  handler: handleRemoveChild
                }
              ]}
            />
          ))}
        </OrderedList>
      ) : (
        <Section.Fallback>No children to show</Section.Fallback>
      )}

      <Dialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        dialogTitle={{
          title: `Create New ${label.slice(0, -1)}`,
          closeButton: true
        }}
        divider
        sx={{ '& .MuiDialog-paperFullWidth': { maxWidth: 480 } }}
      >
        <VideoCreateForm
          parentId={videoId}
          close={() => setShowCreateDialog(false)}
          onCreateSuccess={handleCreateSuccess}
        />
      </Dialog>
    </Section>
  )
}
