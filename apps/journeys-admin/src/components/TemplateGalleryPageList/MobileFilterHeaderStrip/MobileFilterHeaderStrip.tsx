import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { GetTemplateGalleryPages_templateGalleryPages as TemplateGalleryPage } from '../../../../__generated__/GetTemplateGalleryPages'
import { CollectionActionsMenu } from '../CollectionActionsMenu'

export interface MobileFilterHeaderStripProps {
  /** The collection that is currently filtered to, or null when "All
   * Templates" is active. */
  selectedCollection: TemplateGalleryPage | null
  /** Number of templates currently displayed in the list below. */
  count: number
  onEdit?: (collection: TemplateGalleryPage) => void
  onPublish?: (collection: TemplateGalleryPage) => void
  onUnpublish?: (collection: TemplateGalleryPage) => void
  onUngroup?: (collection: TemplateGalleryPage) => void
  busy?: boolean
  canPublish?: boolean
  publishBlockedReason?: string | null
}

/**
 * Thin band shown above the mobile list. Surfaces the active filter's name
 * and template count, and — when a collection is filtered — the 3-dot
 * actions menu for that collection. When "All Templates" is active the menu
 * is hidden because there is no managed entity to act on.
 */
export function MobileFilterHeaderStrip({
  selectedCollection,
  count,
  onEdit,
  onPublish,
  onUnpublish,
  onUngroup,
  busy,
  canPublish,
  publishBlockedReason
}: MobileFilterHeaderStripProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const name = selectedCollection?.title ?? t('All Templates')

  return (
    <Stack
      data-testid="MobileFilterHeaderStrip"
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{
        py: 1,
        px: 0,
        minHeight: 44
      }}
    >
      <Stack
        direction="row"
        alignItems="baseline"
        spacing={1}
        sx={{ minWidth: 0, flex: 1 }}
      >
        <Typography variant="subtitle1" noWrap sx={{ fontWeight: 600 }}>
          {name}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ flexShrink: 0 }}
        >
          ·{' '}
          {t('{{count}} templates', {
            count,
            defaultValue_one: '{{count}} template',
            defaultValue_other: '{{count}} templates'
          })}
        </Typography>
      </Stack>
      {selectedCollection != null && (
        <CollectionActionsMenu
          collection={selectedCollection}
          onEdit={onEdit}
          onPublish={onPublish}
          onUnpublish={onUnpublish}
          onUngroup={onUngroup}
          busy={busy}
          canPublish={canPublish}
          publishBlockedReason={publishBlockedReason}
          testIdSuffix="mobile-filter"
        />
      )}
    </Stack>
  )
}
