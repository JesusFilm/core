import { useTranslation } from 'next-i18next/pages'
import { useSnackbar } from 'notistack'
import { useState } from 'react'

import { GetTemplateGalleryPages_templateGalleryPages as TemplateGalleryPage } from '../../../../__generated__/GetTemplateGalleryPages'
import { TemplateGalleryPageStatus } from '../../../../__generated__/globalTypes'
import { useTemplateGalleryPageDeleteMutation } from '../../../libs/useTemplateGalleryPageDeleteMutation'
import { useTemplateGalleryPagePublishMutation } from '../../../libs/useTemplateGalleryPagePublishMutation'
import { useTemplateGalleryPageUnpublishMutation } from '../../../libs/useTemplateGalleryPageUnpublishMutation'

interface CollectionMutations {
  /** Id of the collection currently mid-mutation, or null when idle. */
  busyId: string | null
  /**
   * Publishes the collection. Resolves to the just-published collection
   * on success, or null if the mutation failed (the snackbar already
   * told the user). The parent uses the resolved value to open the
   * success dialog with the now-live public URL.
   */
  publish: (
    collection: TemplateGalleryPage
  ) => Promise<TemplateGalleryPage | null>
  unpublish: (collection: TemplateGalleryPage) => Promise<void>
  ungroup: (collection: TemplateGalleryPage) => Promise<void>
}

/**
 * Wraps the publish / unpublish / delete mutations with shared snackbar
 * + busy-id bookkeeping. Extracted out of TemplateGalleryPageList so each
 * mutation flow is unit-testable in isolation.
 */
export function useCollectionMutations(): CollectionMutations {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const [busyId, setBusyId] = useState<string | null>(null)

  const [templateGalleryPagePublish] = useTemplateGalleryPagePublishMutation()
  const [templateGalleryPageUnpublish] =
    useTemplateGalleryPageUnpublishMutation()
  const [templateGalleryPageDelete] = useTemplateGalleryPageDeleteMutation()

  function showError(error: unknown, fallback: string): void {
    enqueueSnackbar(error instanceof Error ? error.message : fallback, {
      variant: 'error',
      preventDuplicate: true
    })
  }

  async function publish(
    collection: TemplateGalleryPage
  ): Promise<TemplateGalleryPage | null> {
    setBusyId(collection.id)
    try {
      await templateGalleryPagePublish({ variables: { id: collection.id } })
      // Return a published projection of the input collection so the
      // caller can open the success dialog with the live public URL
      // without having to refetch the gallery list.
      return {
        ...collection,
        status: TemplateGalleryPageStatus.published,
        publishedAt: new Date().toISOString()
      }
    } catch (error) {
      showError(error, t("Couldn't publish collection"))
      return null
    } finally {
      setBusyId(null)
    }
  }

  async function unpublish(collection: TemplateGalleryPage): Promise<void> {
    setBusyId(collection.id)
    try {
      await templateGalleryPageUnpublish({ variables: { id: collection.id } })
      enqueueSnackbar(t('Collection unpublished'), {
        variant: 'success',
        preventDuplicate: true
      })
    } catch (error) {
      showError(error, t("Couldn't unpublish collection"))
    } finally {
      setBusyId(null)
    }
  }

  async function ungroup(collection: TemplateGalleryPage): Promise<void> {
    setBusyId(collection.id)
    try {
      await templateGalleryPageDelete({ variables: { id: collection.id } })
      enqueueSnackbar(t('Collection removed'), {
        variant: 'success',
        preventDuplicate: true
      })
    } catch (error) {
      showError(error, t("Couldn't remove collection"))
    } finally {
      setBusyId(null)
    }
  }

  return { busyId, publish, unpublish, ungroup }
}
