import { useTranslation } from 'next-i18next/pages'
import { useSnackbar } from 'notistack'
import { useState } from 'react'

import { GetTemplateGalleryPages_templateGalleryPages as TemplateGalleryPage } from '../../../../__generated__/GetTemplateGalleryPages'
import { useTemplateGalleryPageDeleteMutation } from '../../../libs/useTemplateGalleryPageDeleteMutation'
import { useTemplateGalleryPagePublishMutation } from '../../../libs/useTemplateGalleryPagePublishMutation'
import { useTemplateGalleryPageUnpublishMutation } from '../../../libs/useTemplateGalleryPageUnpublishMutation'

interface CollectionMutations {
  /** Id of the collection currently mid-mutation, or null when idle. */
  busyId: string | null
  publish: (collection: TemplateGalleryPage) => Promise<void>
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

  async function publish(collection: TemplateGalleryPage): Promise<void> {
    setBusyId(collection.id)
    try {
      await templateGalleryPagePublish({ variables: { id: collection.id } })
      enqueueSnackbar(t('Collection published'), {
        variant: 'success',
        preventDuplicate: true
      })
    } catch (error) {
      showError(error, t("Couldn't publish collection"))
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
