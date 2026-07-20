import { ApolloQueryResult, gql, useMutation } from '@apollo/client'
import CircularProgress from '@mui/material/CircularProgress'
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
import { evictFromTemplateGalleryPages } from '../../../../../../libs/evictFromTemplateGalleryPages'
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
    // Filter the archived journey out of every cached
    // `TemplateGalleryPage.templates` list, then evict only the
    // `TemplateGalleryItem` variant — the `Journey` entity itself stays
    // live (it still surfaces in the archived list).
    update(cache, { data }) {
      const archivedIds =
        data?.journeysArchive
          ?.filter((j): j is NonNullable<typeof j> => j != null)
          .map((j) => j.id) ?? []
      evictFromTemplateGalleryPages(cache, archivedIds, {
        evictJourneyEntity: false
      })
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
      onCompleted: () => {
        // Snackbar fires on this tick — do NOT await secondary work.
        // The unassign is fire-and-forget cleanup so unarchiving later
        // returns the journey to the flat template list rather than its
        // prior collection slot. Awaiting it would block the snackbar
        // on a ~1s round-trip the user doesn't care about (Mike review,
        // NES-1644). Failure mode is identical to pre-fix: stale join
        // row server-side, surfaces only on restore.
        void unassignFromCollection({
          variables: { journeyId: id, pageId: null }
        }).catch((unassignError) => {
          console.warn(
            '[ArchiveJourney] failed to unassign archived journey from its collection',
            { journeyId: id, error: unassignError }
          )
        })
        enqueueSnackbar(t('Journey Archived'), {
          variant: 'success',
          preventDuplicate: true
        })
        void refetch?.()
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
