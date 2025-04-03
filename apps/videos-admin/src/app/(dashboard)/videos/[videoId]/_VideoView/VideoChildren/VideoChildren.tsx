import { useMutation } from '@apollo/client'
import { DragEndEvent } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import Typography from '@mui/material/Typography'
import { graphql } from 'gql.tada'
import { usePathname, useRouter } from 'next/navigation'
import { ReactElement, useState } from 'react'

import { OrderedList } from '../../../../../../components/OrderedList'
import { OrderedItem } from '../../../../../../components/OrderedList/OrderedItem'
import { GetAdminVideo_AdminVideo_Children as AdminVideoChildren } from '../../../../../../libs/useAdminVideo'
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

  const [videos, setVideos] = useState(childVideos)

  const [updateVideoChildrenOrder] = useMutation(VIDEO_CHILDREN_ORDER_UPDATE)

  if (childVideos.length === 0) {
    return <Typography>No children to show</Typography>
  }

  function handleClick(id: string): void {
    if (pathname == null) return
    const [, locale, entity] = pathname.split('/')
    router.push(`/${locale}/${entity}/${id}`)
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
    >
      {videos.length > 0 ? (
        <OrderedList onOrderUpdate={updateOrderOnDrag} items={videos}>
          {videos.map(({ id, title, images, imageAlt }, i) => (
            <OrderedItem
              key={id}
              id={id}
              label={title[0].value}
              subtitle={id}
              idx={i}
              img={{
                src: images?.[0]?.mobileCinematicHigh as string,
                alt: imageAlt[0].value
              }}
              sx={{
                cursor: 'pointer'
              }}
              onClick={handleClick}
            />
          ))}
        </OrderedList>
      ) : (
        <Section.Fallback>No children to show</Section.Fallback>
      )}
    </Section>
  )
}
