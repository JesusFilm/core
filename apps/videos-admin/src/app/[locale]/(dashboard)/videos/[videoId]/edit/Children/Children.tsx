import { DndContext } from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'
import Stack from '@mui/material/Stack'
import { graphql } from 'gql.tada'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'

import Edit2 from '@core/shared/ui/icons/Edit2'
import EyeOpen from '@core/shared/ui/icons/EyeOpen'
import Trash2 from '@core/shared/ui/icons/Trash2'

import { ItemRow } from '../../../../../../../components/ItemRow'
import { Section } from '../../../../../../../components/Section'
import { SectionFallback } from '../../../../../../../components/Section/SectionFallback'

export const GET_ADMIN_VIDEO_WITH_CHILDREN = graphql(`
  query GetAdminVideoWithChildren($videoId: ID!) {
    adminVideo(id: $videoId) {
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

interface ChildrenProps {
  loading: boolean
  childVideos: unknown[]
}

export function Children({
  loading,
  childVideos
}: ChildrenProps): ReactElement {
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslations()

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
    <Section
      title="Children"
      action={{
        label: 'Create Child',
        onClick: () => alert('Create child')
      }}
    >
      {loading || childVideos == null || childVideos.length === 0 ? (
        <SectionFallback
          data-testid="VideoChildrenEmpty"
          loading={loading}
          message={t('No child videos')}
        />
      ) : (
        <DndContext>
          <SortableContext items={childVideos}>
            <Stack gap={1} sx={{ height: '600px', overflowY: 'scroll' }}>
              {childVideos.map((child, idx) => (
                <ItemRow
                  id={child.id}
                  key={child.id}
                  label={child.title[0].value}
                  img={{
                    src: child.images[0].mobileCinematicHigh,
                    alt: child.imageAlt[0].value
                  }}
                  actions={[
                    {
                      handler: () => view(child.id),
                      Icon: EyeOpen
                    },
                    {
                      handler: () => edit(child.id),
                      Icon: Edit2
                    },
                    {
                      handler: () => alert('Delete child'),
                      Icon: Trash2,
                      slotProps: {
                        icon: { color: 'error' }
                      }
                    }
                  ]}
                />
              ))}
            </Stack>
          </SortableContext>
        </DndContext>
      )}
    </Section>
  )
}
