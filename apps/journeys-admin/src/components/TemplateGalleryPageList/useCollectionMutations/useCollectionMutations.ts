import { useTranslation } from 'next-i18next/pages'
import { useSnackbar } from 'notistack'
import { useEffect, useRef, useState } from 'react'

import { GetTemplateGalleryPages_templateGalleryPages as TemplateGalleryPage } from '../../../../__generated__/GetTemplateGalleryPages'
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
  // Each mutation's `setBusyId(null)` lands after an await — if the
  // consumer unmounts mid-flight we'd be writing to dead state and React
  // would warn. Gate the post-await setState on this ref.
  const mountedRef = useRef(true)
  useEffect(
    () => () => {
      mountedRef.current = false
    },
    []
  )

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
      const { data } = await templateGalleryPagePublish({
        variables: { id: collection.id }
      })
      const result = data?.templateGalleryPagePublish
      if (result == null) return null
      // Merge server-set fields (status, publishedAt, updatedAt, slug)
      // into the input collection so the caller can open the success
      // dialog with the live public URL — and so any later read sees
      // the same authoritative timestamps as the gallery list refetch.
      return {
        ...collection,
        status: result.status,
        publishedAt: result.publishedAt,
        updatedAt: result.updatedAt,
        slug: result.slug
      }
    } catch (error) {
      showError(error, t("Couldn't publish collection"))
      return null
    } finally {
      if (mountedRef.current) setBusyId(null)
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
      if (mountedRef.current) setBusyId(null)
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
      if (mountedRef.current) setBusyId(null)
    }
  }

  return { busyId, publish, unpublish, ungroup }
}
