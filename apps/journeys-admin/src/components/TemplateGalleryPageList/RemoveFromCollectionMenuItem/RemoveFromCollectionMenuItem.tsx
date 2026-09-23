import { useTranslation } from 'next-i18next/pages'
import { useSnackbar } from 'notistack'
import { ReactElement, useRef } from 'react'

import X2Icon from '@core/shared/ui/icons/X2'

import { sendCollectionTemplateRemoveEvent } from '../../../libs/sendCollectionEvent'
import { useTemplateGalleryPageRemoveJourneyMutation } from '../../../libs/useTemplateGalleryPageRemoveJourneyMutation'
import { MenuItem } from '../../MenuItem'
import { useInCollection } from '../InCollectionContext'

interface RemoveFromCollectionMenuItemProps {
  /** The journey (template) this card shows. */
  id: string
  handleCloseMenu: () => void
  /**
   * Keeps the parent menu mounted after it closes, so this item survives
   * the mutation round-trip and can still raise the result toast. Without
   * it the menu unmounts on close and the toast is lost.
   */
  handleKeepMounted?: () => void
}

/**
 * "Remove from collection" on a template card's ⋮ menu. Renders nothing
 * outside a collection (no InCollectionContext). Same semantics as dragging
 * the card to All Templates: only this membership goes; when it was the
 * template's home and links remain, the oldest link becomes the home, and
 * the toast says where.
 */
export function RemoveFromCollectionMenuItem({
  id,
  handleCloseMenu,
  handleKeepMounted
}: RemoveFromCollectionMenuItemProps): ReactElement | null {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const inCollection = useInCollection()
  const [templateGalleryPageRemoveJourney, { loading }] =
    useTemplateGalleryPageRemoveJourneyMutation()
  // Synchronous double-click guard: `loading` flips asynchronously, so two
  // clicks in one tick would both fire. Same pattern as useCollectionForm.
  const submittingRef = useRef(false)

  if (inCollection == null) return null
  const { collectionId, collectionTitle } = inCollection

  async function handleClick(): Promise<void> {
    if (submittingRef.current) return
    submittingRef.current = true
    handleKeepMounted?.()
    handleCloseMenu()
    try {
      const { data } = await templateGalleryPageRemoveJourney({
        variables: { journeyId: id, pageId: collectionId },
        refetchQueries: ['GetTemplateGalleryPages']
      })
      sendCollectionTemplateRemoveEvent({
        collectionId,
        templateId: id,
        via: 'menu'
      })
      const promoted = data?.templateGalleryPageRemoveJourney.find(
        (page) =>
          page.id !== collectionId &&
          page.memberships.some((m) => m.journeyId === id && m.isHome)
      )
      enqueueSnackbar(
        promoted != null
          ? t('Removed from {{collection}}. Its home is now {{home}}.', {
              collection: collectionTitle,
              home: promoted.title
            })
          : t('Removed from {{collection}}', { collection: collectionTitle }),
        { variant: 'success', preventDuplicate: true }
      )
    } catch (error) {
      enqueueSnackbar(
        error instanceof Error
          ? error.message
          : t("Couldn't remove template from collection"),
        { variant: 'error', preventDuplicate: true }
      )
    } finally {
      submittingRef.current = false
    }
  }

  return (
    <MenuItem
      label={t('Remove from collection')}
      icon={<X2Icon />}
      disabled={loading}
      onClick={() => {
        void handleClick()
      }}
      testId="RemoveFromCollection"
    />
  )
}
