import { ApolloQueryResult, Reference, gql, useMutation } from '@apollo/client'
import CircularProgress from '@mui/material/CircularProgress'
import reject from 'lodash/reject'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'

import FolderDown1Icon from '@core/shared/ui/icons/FolderDown1'
import FolderUp1Icon from '@core/shared/ui/icons/FolderUp1'

import { GetAdminJourneys } from '../../../../../../../__generated__/GetAdminJourneys'
import { JourneyStatus } from '../../../../../../../__generated__/globalTypes'
import { JourneyArchive } from '../../../../../../../__generated__/JourneyArchive'
import { JourneyUnarchive } from '../../../../../../../__generated__/JourneyUnarchive'
import { useTemplateGalleryPageAssignJourneyMutation } from '../../../../../../libs/useTemplateGalleryPageAssignJourneyMutation'
import { MenuItem } from '../../../../../MenuItem'

export const JOURNEY_ARCHIVE = gql`
  mutation JourneyArchive($ids: [ID!]!) {
    journeysArchive(ids: $ids) {
      id
      status
    }
  }
`

export const JOURNEY_UNARCHIVE = gql`
  mutation JourneyUnarchive($ids: [ID!]!) {
    journeysRestore(ids: $ids) {
      id
      status
    }
  }
`

export interface ArchiveJourneyProps {
  status: JourneyStatus
  id: string
  published: boolean
  handleClose: () => void
  refetch?: () => Promise<ApolloQueryResult<GetAdminJourneys>>
  disabled?: boolean
}

export function ArchiveJourney({
  id,
  published,
  handleClose,
  refetch,
  disabled = false
}: ArchiveJourneyProps): ReactElement {
  const router = useRouter()
  const activeTab = router?.query.status?.toString() ?? 'active'
  const { t } = useTranslation('apps-journeys-admin')
  const [loading, setLoading] = useState(false)
  const previousStatus = published
    ? JourneyStatus.published
    : JourneyStatus.draft
  const [archiveJourney] = useMutation<JourneyArchive>(JOURNEY_ARCHIVE, {
    variables: {
      ids: [id]
    },
    optimisticResponse: {
      journeysArchive: [
        {
          id,
          status: JourneyStatus.archived,
          __typename: 'Journey'
        }
      ]
    },
    // Mirrors the TrashJourneyDialog cleanup: archived journeys are
    // filtered out of `TemplateGalleryPage.templates` by the resolver
    // (status: published only), so the cached templates lists must
    // also drop the ref. Apollo's dangling-ref broadcast leaves stale
    // refs in lists on stage; the explicit list-filter is deterministic.
    update(cache, { data }) {
      if (data?.journeysArchive == null) return
      const archivedJourneys = data.journeysArchive.filter(
        (j): j is NonNullable<typeof j> => j != null
      )
      if (archivedJourneys.length === 0) return

      const archivedTemplateRefs = new Set<string>()
      for (const journey of archivedJourneys) {
        const ref = cache.identify({
          __typename: 'TemplateGalleryItem',
          id: journey.id
        })
        if (ref != null) archivedTemplateRefs.add(ref)
      }

      const snapshot = cache.extract()
      for (const cacheId of Object.keys(snapshot)) {
        if (!cacheId.startsWith('TemplateGalleryPage:')) continue
        cache.modify({
          id: cacheId,
          fields: {
            templates(existing) {
              if (!Array.isArray(existing)) return existing
              return reject(existing as Reference[], (ref) =>
                archivedTemplateRefs.has(ref.__ref)
              )
            }
          }
        })
      }

      for (const journey of archivedJourneys) {
        // Evict the TemplateGalleryItem variant — the Journey entity
        // itself is preserved (status: archived is still a valid live
        // entity in the archived list).
        cache.evict({
          id: cache.identify({
            __typename: 'TemplateGalleryItem',
            id: journey.id
          })
        })
      }
    }
  })

  // Best-effort unassign so that unarchiving returns the journey to the
  // flat template list rather than its prior collection slot. Idempotent
  // no-op server-side when the journey isn't in any collection.
  const [unassignFromCollection] = useTemplateGalleryPageAssignJourneyMutation()
  const [unarchiveJourney] = useMutation<JourneyUnarchive>(JOURNEY_UNARCHIVE, {
    variables: {
      ids: [id]
    },
    optimisticResponse: {
      journeysRestore: [
        {
          id,
          status: previousStatus,
          __typename: 'Journey'
        }
      ]
    }
  })

  const { enqueueSnackbar } = useSnackbar()

  async function handleArchive(): Promise<void> {
    setLoading(true)
    await archiveJourney({
      onError: () => {
        enqueueSnackbar(t('Journey Archive failed'), {
          variant: 'error',
          preventDuplicate: true
        })
        setLoading(false)
      },
      onCompleted: async () => {
        // Sever any TemplateGalleryPage join row so that unarchiving
        // returns the journey to the flat template list. Failure here
        // is logged but doesn't contradict the archive success — same
        // best-effort pairing as TrashJourneyDialog.
        try {
          await unassignFromCollection({
            variables: { journeyId: id, pageId: null }
          })
        } catch (unassignError) {
          console.warn(
            '[ArchiveJourney] failed to unassign archived journey from its collection',
            { journeyId: id, error: unassignError }
          )
        }
        enqueueSnackbar(t('Journey Archived'), {
          variant: 'success',
          preventDuplicate: true
        })
        await refetch?.()
        handleClose()
        setLoading(false)
      }
    })
  }

  async function handleUnarchive(): Promise<void> {
    setLoading(true)
    await unarchiveJourney({
      onError: () => {
        enqueueSnackbar(t('Journey Unarchive failed'), {
          variant: 'error',
          preventDuplicate: true
        })
        setLoading(false)
      },
      onCompleted: async () => {
        enqueueSnackbar(t('Journey Unarchived'), {
          variant: 'success',
          preventDuplicate: true
        })
        await refetch?.()
        handleClose()
        setLoading(false)
      }
    })
  }

  return (
    <>
      {activeTab === 'active' && (
        <MenuItem
          label={t('Archive')}
          icon={
            loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              <FolderUp1Icon color="secondary" />
            )
          }
          onClick={handleArchive}
          testId="Archive"
          disabled={disabled || loading}
        />
      )}
      {activeTab === 'archived' && (
        <MenuItem
          label={t('Unarchive')}
          icon={
            loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              <FolderDown1Icon color="secondary" />
            )
          }
          onClick={handleUnarchive}
          testId="Unarchive"
          disabled={disabled || loading}
        />
      )}
    </>
  )
}
