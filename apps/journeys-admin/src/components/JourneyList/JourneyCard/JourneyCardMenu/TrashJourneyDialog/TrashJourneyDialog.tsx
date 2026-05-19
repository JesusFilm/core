import { ApolloQueryResult, Reference, gql, useMutation } from '@apollo/client'
import Typography from '@mui/material/Typography'
import reject from 'lodash/reject'
import { useTranslation } from 'next-i18next/pages'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

import { GetAdminJourneys } from '../../../../../../__generated__/GetAdminJourneys'
import { JourneyStatus } from '../../../../../../__generated__/globalTypes'
import { JourneyTrash } from '../../../../../../__generated__/JourneyTrash'
import { useTemplateFamilyStatsAggregateLazyQuery } from '../../../../../libs/useTemplateFamilyStatsAggregateLazyQuery'

export const JOURNEY_TRASH = gql`
  mutation JourneyTrash($ids: [ID!]!) {
    journeysTrash(ids: $ids) {
      id
      status
      fromTemplateId
    }
  }
`

export interface TrashJourneyDialogProps {
  id: string
  open: boolean
  handleClose: () => void
  refetch?: () => Promise<ApolloQueryResult<GetAdminJourneys>>
  fromTemplateId?: string | null
}

export function TrashJourneyDialog({
  id,
  open,
  handleClose,
  refetch,
  fromTemplateId
}: TrashJourneyDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(false)
  const { refetchTemplateStats } = useTemplateFamilyStatsAggregateLazyQuery()

  const [trashJourney] = useMutation<JourneyTrash>(JOURNEY_TRASH, {
    variables: {
      ids: [id]
    },
    optimisticResponse: {
      journeysTrash: [
        {
          id,
          status: JourneyStatus.deleted,
          __typename: 'Journey',
          fromTemplateId: fromTemplateId ?? null
        }
      ]
    },
    // Drop the trashed journey from any cached `TemplateGalleryPage.templates`
    // list and from any normalized Journey/TemplateGalleryItem entity. The
    // mutation returns `Journey:<id>`, but `templates` stores entities as
    // `TemplateGalleryItem:<id>` (same DB row, different __typename — Pothos
    // variant), so Apollo's normal entity-merge can't reach across the
    // boundary. Mirrors the explicit list-filter pattern in
    // libs/blockDeleteUpdate so we don't rely on Apollo's dangling-ref
    // broadcast (observed to leave stale refs in templates lists on stage
    // even after evict + gc — NES-1644).
    update(cache, { data }) {
      if (data?.journeysTrash == null) return
      const trashedJourneys = data.journeysTrash.filter(
        (j): j is NonNullable<typeof j> => j != null
      )
      if (trashedJourneys.length === 0) return

      const trashedTemplateRefs = new Set<string>()
      for (const journey of trashedJourneys) {
        const ref = cache.identify({
          __typename: 'TemplateGalleryItem',
          id: journey.id
        })
        if (ref != null) trashedTemplateRefs.add(ref)
      }

      // Apollo's `cache.modify` without `id` only targets ROOT_QUERY; we
      // need to update every cached TemplateGalleryPage entity, regardless
      // of which root query argument set fetched it. Enumerating from
      // `cache.extract()` is the only API-level way to do that without
      // coupling to a specific query variables tuple.
      const snapshot = cache.extract()
      for (const cacheId of Object.keys(snapshot)) {
        if (!cacheId.startsWith('TemplateGalleryPage:')) continue
        cache.modify({
          id: cacheId,
          fields: {
            templates(existing) {
              if (!Array.isArray(existing)) return existing
              return reject(existing as Reference[], (ref) =>
                trashedTemplateRefs.has(ref.__ref)
              )
            }
          }
        })
      }

      for (const journey of trashedJourneys) {
        cache.evict({
          id: cache.identify({ __typename: 'Journey', id: journey.id })
        })
        cache.evict({
          id: cache.identify({
            __typename: 'TemplateGalleryItem',
            id: journey.id
          })
        })
      }
    }
  })

  async function handleTrash(): Promise<void> {
    setLoading(true)
    try {
      const { data } = await trashJourney()
      const templateIdToRefetch =
        data?.journeysTrash?.[0]?.fromTemplateId ?? fromTemplateId
      if (templateIdToRefetch != null) {
        void refetchTemplateStats([templateIdToRefetch])
      }

      await refetch?.()
      enqueueSnackbar(t('Journey trashed'), {
        variant: 'success',
        preventDuplicate: true
      })
      handleClose()
    } catch (error) {
      if (error instanceof Error) {
        enqueueSnackbar(error.message, {
          variant: 'error',
          preventDuplicate: true
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      dialogTitle={{ title: t('Trash Journey?'), closeButton: true }}
      loading={loading}
      dialogAction={{
        onSubmit: handleTrash,
        submitLabel: t('Delete'),
        closeLabel: t('Cancel')
      }}
      testId="TrashJourneyDialog"
    >
      <Typography>
        {t(
          'By selecting “delete”, this journey will be moved to the trash. It will ' +
            'remain there for 40 days, before being automatically and permanently ' +
            'deleted.'
        )}
      </Typography>
    </Dialog>
  )
}
