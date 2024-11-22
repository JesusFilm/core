import { useMutation } from '@apollo/client'
import { DragEndEvent } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import Typography from '@mui/material/Typography'
import { graphql } from 'gql.tada'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ReactElement, useState } from 'react'

import Edit2 from '@core/shared/ui/icons/Edit2'
import EyeOpen from '@core/shared/ui/icons/EyeOpen'
import Trash2 from '@core/shared/ui/icons/Trash2'

import { OrderedList } from '../../../../../../../components/OrderedList'
import { OrderedItem } from '../../../../../../../components/OrderedList/OrderedItem'
import { GetAdminVideo_AdminVideo_Children as VideoChildren } from '../../../../../../../libs/useAdminVideo'
import { useEdit } from '../../_EditProvider'
import { Section } from '../Section'

interface ChildrenProps {
  childVideos: VideoChildren
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

export function Children({ childVideos }: ChildrenProps): ReactElement {
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslations()
  const {
    state: { isEdit }
  } = useEdit()

  const [videos, setVideos] = useState(childVideos)

  const [updateVideoChildrenOrder] = useMutation(VIDEO_CHILDREN_ORDER_UPDATE)

  if (childVideos.length === 0) {
    return <Typography>{t('No children to show')}</Typography>
  }

  function view(id: string): void {
    if (pathname == null) return
    const [, locale, entity] = pathname.split('/')
    router.push(`/${locale}/${entity}/${id}`)
  }

  function edit(id: string): void {
    if (pathname == null) return
    const [, locale, entity] = pathname.split('/')
    router.push(`/${locale}/${entity}/${id}?isEdit=true`)
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
            id: active.id.toString(),
            childIds: newOrder.map((video) => video.id)
          }
        }
      })
    }
  }

  return (
    <Section
      title={t('Children')}
      action={
        isEdit
          ? {
              label: 'Create Child',
              onClick: () => alert('Create child')
            }
          : undefined
      }
      boxProps={{
        sx: { p: 0, height: 'calc(100vh - 400px)', overflowY: 'scroll' }
      }}
    >
      {videos.length > 0 ? (
        <OrderedList onOrderUpdate={updateOrderOnDrag} items={videos}>
          {videos.map(({ id, title, images, imageAlt }, i) => (
            <OrderedItem
              key={id}
              id={id}
              label={title[0].value}
              idx={i}
              iconButtons={[
                {
                  Icon: EyeOpen,
                  events: {
                    onClick: () => view(id)
                  },
                  name: 'View'
                },
                {
                  Icon: Edit2,
                  events: {
                    onClick: () => edit(id)
                  },
                  name: 'Edit'
                },
                {
                  Icon: Trash2,
                  events: {
                    onClick: () => alert('Delete child')
                  },
                  name: 'Delete',
                  slotProps: {
                    button: {
                      color: 'error'
                    },
                    icon: {
                      color: 'error'
                    }
                  }
                }
              ]}
              img={{
                src: images?.[0]?.mobileCinematicHigh as string,
                alt: imageAlt[0].value
              }}
            />
          ))}
        </OrderedList>
      ) : (
        <Section.Fallback>{t('No children to show')}</Section.Fallback>
      )}
    </Section>
  )
}
