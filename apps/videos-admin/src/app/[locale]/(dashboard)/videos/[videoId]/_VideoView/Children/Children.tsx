import Typography from '@mui/material/Typography'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ReactElement, useMemo } from 'react'

import Edit2 from '@core/shared/ui/icons/Edit2'
import EyeOpen from '@core/shared/ui/icons/EyeOpen'
import Trash2 from '@core/shared/ui/icons/Trash2'

import { Section } from '../Section'
import { useEdit } from '../../_EditProvider'
import { OrderedList } from '../../../../../../../components/OrderedList'
import { OrderedItem } from '../../../../../../../components/OrderedList/OrderedItem'
import { GetAdminVideo_AdminVideo_Children as VideoChildren } from '../../../../../../../libs/useAdminVideo'

import Stack from '@mui/material/Stack'

interface ChildrenProps {
  childVideos: VideoChildren
}

export function Children({ childVideos }: ChildrenProps): ReactElement {
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslations()
  const {
    state: { isEdit }
  } = useEdit()

  if (childVideos.length === 0) {
    return <Typography>{t('No children to show')}</Typography>
  }

  const videos = useMemo(() => childVideos.map((video) => video), [childVideos])

  function view(id: string): void {
    if (pathname == null) return
    const [, locale, entity] = pathname.split('/')
    router.push(`/${locale}/${entity}/${id}`)
  }

  function edit(id: string): void {
    if (pathname == null) return
    const [, locale, entity] = pathname.split('/')
    router.push(`/${locale}/${entity}/${id}/edit`)
  }

  function updateOrderOnDrag(): void {}
  function updateOrderOnChange(): void {}

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
            <>
              <OrderedItem
                key={id}
                id={id}
                label={title[0].value}
                idx={i}
                onChange={updateOrderOnChange}
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
            </>
          ))}
        </OrderedList>
      ) : (
        <Section.Fallback>{t('No children to show')}</Section.Fallback>
      )}
    </Section>
  )
}
