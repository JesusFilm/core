import { DndContext } from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'

import Edit2 from '@core/shared/ui/icons/Edit2'
import EyeOpen from '@core/shared/ui/icons/EyeOpen'
import Trash2 from '@core/shared/ui/icons/Trash2'

import { DraggableRow } from '../DraggableRow'
import { Section } from '../Section'

export function Children({ childVideos }): ReactElement {
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslations()

  if (childVideos.length === 0) {
    return <Typography>{t('No children to show')}</Typography>
  }

  const view = (id: string): void => {
    if (pathname == null) return

    const [, locale, entity] = pathname.split('/')

    router.push(`/${locale}/${entity}/${id}`)
  }

  const edit = (id: string): void => {
    if (pathname == null) return

    const [, locale, entity] = pathname.split('/')

    router.push(`/${locale}/${entity}/${id}/edit`)
  }

  return (
    <DndContext>
      <SortableContext items={childVideos}>
        <Section
          title="Children"
          action={{
            label: 'Create Child',
            onClick: () => alert('Create child')
          }}
        >
          <Stack gap={1} sx={{ height: '600px', overflowY: 'scroll' }}>
            {childVideos.map((child, idx) => (
              <DraggableRow
                id={child.id}
                key={child.id}
                label={child.title[0].value}
                idx={idx}
                count={childVideos.length}
                img={{
                  src: child.images[0].mobileCinematicHigh,
                  alt: child.imageAlt[0].value
                }}
                actions={[
                  {
                    Icon: EyeOpen,
                    events: {
                      onClick: () => view(child.id)
                    },
                    name: 'View'
                  },
                  {
                    Icon: Edit2,
                    events: {
                      onClick: () => edit(child.id)
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
              />
            ))}
          </Stack>
        </Section>
      </SortableContext>
    </DndContext>
  )
}
