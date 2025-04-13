'use client'

import { useMutation, useSuspenseQuery } from '@apollo/client'
import { DragEndEvent } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { graphql } from 'gql.tada'
import { useRouter } from 'next/navigation'

import Plus2 from '@core/shared/ui/icons/Plus2'

import { OrderedList } from '../../../../../components/OrderedList'
import { OrderedItem } from '../../../../../components/OrderedList/OrderedItem'
import { Section } from '../../../../../components/Section'
import { getVideoChildrenLabel } from '../../../../../libs/getVideoChildrenLabel'

const VIDEO_CHILDREN_ORDER_UPDATE = graphql(`
  mutation VideoChildrenOrderUpdate($input: VideoUpdateInput!) {
    videoUpdate(input: $input) {
      id
      children {
        id
      }
    }
  }
`)

const GET_ADMIN_VIDEO_CHILDREN = graphql(`
  query GetAdminVideoChildren($id: ID!, $languageId: ID) {
    adminVideo(id: $id) {
      id
      label
      children {
        id
        title(languageId: $languageId) {
          id
          value
        }
        images(aspectRatio: banner) {
          id
          mobileCinematicHigh
        }
        imageAlt(languageId: $languageId) {
          id
          value
        }
      }
    }
  }
`)

interface ChildrenProps {
  params: {
    videoId: string
  }
}

export default function ChildrenPage({ params: { videoId } }: ChildrenProps) {
  const router = useRouter()
  const { data } = useSuspenseQuery(GET_ADMIN_VIDEO_CHILDREN, {
    variables: { id: videoId }
  })

  const videoLabel = getVideoChildrenLabel(data.adminVideo.label)

  const childVideos = data.adminVideo.children
  const [updateVideoChildrenOrder] = useMutation(VIDEO_CHILDREN_ORDER_UPDATE, {
    refetchQueries: [
      {
        query: GET_ADMIN_VIDEO_CHILDREN,
        variables: { videoId }
      }
    ]
  })

  async function updateOrderOnDrag(e: DragEndEvent): Promise<void> {
    const { active, over } = e
    if (over == null) return
    if (e.active.id !== over.id) {
      const oldIndex = data.adminVideo.children.findIndex(
        (item) => item.id === active.id
      )
      const newIndex = data.adminVideo.children.findIndex(
        (item) => item.id === over.id
      )
      const newOrder = arrayMove(data.adminVideo.children, oldIndex, newIndex)
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
      title={videoLabel}
      boxProps={{
        sx: { p: 2, height: 'calc(100vh - 400px)', overflowY: 'scroll' }
      }}
      variant="outlined"
      action={{
        label: 'Add',
        startIcon: <Plus2 />,
        onClick: () => router.push(`/videos/${videoId}/children/add`)
      }}
    >
      {!childVideos || childVideos.length === 0 ? (
        <Section.Fallback>No children to show</Section.Fallback>
      ) : (
        <OrderedList
          onOrderUpdate={updateOrderOnDrag}
          items={data.adminVideo.children}
        >
          {data.adminVideo.children.map(
            ({ id, title, images, imageAlt }, i) => (
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
                onClick={() => router.push(`/videos/${id}`)}
                menuActions={[
                  {
                    label: 'Edit',
                    handler: () => router.push(`/videos/${id}`)
                  }
                ]}
              />
            )
          )}
        </OrderedList>
      )}
    </Section>
  )
}
