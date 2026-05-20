import { ApolloQueryResult, gql, useMutation } from '@apollo/client'
import Typography from '@mui/material/Typography'
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
  /**
   * When true, render the template-flavoured copy ("Trash Template?",
   * "Template trashed", etc.). The underlying mutation is unchanged —
   * templates are journeys with `template: true` on the server, so
   * `journeysTrash` handles both. Plumbed from `JourneyCardMenu` so the
   * trash flow on the template gallery says the right thing (NES-1669).
   */
  template?: boolean
}

export function TrashJourneyDialog({
  id,
  open,
  handleClose,
  refetch,
  fromTemplateId,
  template
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
      enqueueSnackbar(
        template === true ? t('Template trashed') : t('Journey trashed'),
        {
          variant: 'success',
          preventDuplicate: true
        }
      )
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
      dialogTitle={{
        title: template === true ? t('Trash Template?') : t('Trash Journey?'),
        closeButton: true
      }}
      loading={loading}
      dialogAction={{
        onSubmit: handleTrash,
        submitLabel: t('Delete'),
        closeLabel: t('Cancel')
      }}
      testId="TrashJourneyDialog"
    >
      <Typography>
        {template === true
          ? t(
              'By selecting “delete”, this template will be moved to the trash. It will ' +
                'remain there for 40 days, before being automatically and permanently ' +
                'deleted.'
            )
          : t(
              'By selecting “delete”, this journey will be moved to the trash. It will ' +
                'remain there for 40 days, before being automatically and permanently ' +
                'deleted.'
            )}
      </Typography>
    </Dialog>
  )
}
