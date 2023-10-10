import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useSnackbar } from 'notistack'
import { ReactElement, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { Dialog } from '@core/shared/ui/Dialog'

import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { JourneyFields } from '../../../../__generated__/JourneyFields'
import { useAdminJourneysQuery } from '../../../libs/useJourneysAdminQuery'
import { useTeam } from '../../Team/TeamProvider'
import { JourneyCard } from '../JourneyCard'
import type { JourneyListProps } from '../JourneyList'
import { sortJourneys } from '../JourneySort/utils/sortJourneys'

export const RESTORE_TRASHED_JOURNEYS = gql`
  mutation RestoreTrashedJourneys($ids: [ID!]!) {
    journeysRestore(ids: $ids) {
      id
      status
    }
  }
`

export const DELETE_TRASHED_JOURNEYS = gql`
  mutation DeleteTrashedJourneys($ids: [ID!]!) {
    journeysDelete(ids: $ids) {
      id
      status
    }
  }
`
export function TrashedJourneyList({
  user,
  sortOrder,
  event
}: JourneyListProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const { activeTeam } = useTeam()
  const { data, refetch } = useAdminJourneysQuery({
    status: [JourneyStatus.trashed],
    teamId: activeTeam?.id
  })
  const [restoreTrashed] = useMutation(RESTORE_TRASHED_JOURNEYS, {
    update(_cache, { data }) {
      if (data?.journeysRestore != null) {
        enqueueSnackbar(t('Journeys Restored'), {
          variant: 'success'
        })
        void refetch()
      }
    }
  })
  const [deleteTrashed] = useMutation(DELETE_TRASHED_JOURNEYS, {
    update(_cache, { data }) {
      if (data?.journeysDelete != null) {
        enqueueSnackbar(t('Journeys Deleted'), {
          variant: 'success'
        })
        void refetch()
      }
    }
  })
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  async function handleRestoreSubmit(): Promise<void> {
    try {
      const journeyIds = data?.journeys
        ?.filter(
          (journey) =>
            journey.userJourneys?.find(
              (userJourney) => userJourney.user?.id === (user?.id ?? '')
            )?.role === 'owner'
        )
        .map((journey) => journey.id)
      await restoreTrashed({ variables: { ids: journeyIds } })
    } catch (error) {
      enqueueSnackbar(error.message, {
        variant: 'error',
        preventDuplicate: true
      })
    }
    handleClose()
  }

  async function handleDeleteSubmit(): Promise<void> {
    try {
      const journeyIds = data?.journeys
        ?.filter(
          (journey) =>
            journey.userJourneys?.find(
              (userJourney) => userJourney.user?.id === (user?.id ?? '')
            )?.role === 'owner'
        )
        .map((journey) => journey.id)
      await deleteTrashed({ variables: { ids: journeyIds } })
    } catch (error) {
      enqueueSnackbar(error.message, {
        variant: 'error',
        preventDuplicate: true
      })
    }
    handleClose()
  }

  function handleClose(): void {
    setRestoreDialogOpen(false)
    setDeleteDialogOpen(false)
  }

  useEffect(() => {
    switch (event) {
      case 'restoreAllTrashed':
        setRestoreDialogOpen(true)
        break
      case 'deleteAllTrashed':
        setDeleteDialogOpen(true)
        break
      case 'refetchTrashed':
        void refetch()
        break
    }
  }, [event, refetch])

  // calculate 40 days ago. may later be replaced by cron job
  const daysAgo = new Date()
  daysAgo.setDate(new Date().getDate() - 40)

  const sortedJourneys =
    data?.journeys != null
      ? sortJourneys(
          data.journeys.filter(
            (journey) => new Date(journey.trashedAt) > daysAgo
          ),
          sortOrder
        )
      : undefined

  return (
    <>
      <Box>
        {sortedJourneys != null ? (
          <>
            {sortedJourneys.map((journey) => (
              <JourneyProvider
                key={journey.id}
                value={{
                  journey: journey as unknown as JourneyFields,
                  variant: 'admin'
                }}
              >
                <JourneyCard
                  key={journey.id}
                  journey={journey}
                  refetch={refetch}
                />
              </JourneyProvider>
            ))}
            {sortedJourneys.length === 0 && (
              <>
                <Card
                  variant="outlined"
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    py: 20,
                    borderBottomLeftRadius: { xs: 0, sm: 12 },
                    borderBottomRightRadius: { xs: 0, sm: 12 },
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0
                  }}
                >
                  <Typography variant="subtitle1" align="center">
                    {t('Your trashed journeys will appear here.')}
                  </Typography>
                </Card>
              </>
            )}
          </>
        ) : (
          [0, 1, 2].map((index) => <JourneyCard key={`journeyCard${index}`} />)
        )}
      </Box>
      <Stack alignItems="center">
        <Typography
          variant="caption"
          align="center"
          component="div"
          sx={{ py: { xs: 3, sm: 5 }, maxWidth: 290 }}
        >
          {t('Trashed journeys are moved here for up to 40 days.')}
        </Typography>
      </Stack>
      <Dialog
        open={restoreDialogOpen}
        onClose={handleClose}
        dialogTitle={{
          title: t('Restore Journeys'),
          closeButton: true
        }}
        dialogAction={{
          onSubmit: handleRestoreSubmit,
          submitLabel: t('Restore'),
          closeLabel: t('Cancel')
        }}
      >
        <Typography>
          {t(
            'Are you sure you would like to restore all trashed journeys immediately?'
          )}
        </Typography>
      </Dialog>
      <Dialog
        open={deleteDialogOpen}
        onClose={handleClose}
        dialogTitle={{
          title: t('Delete Journeys Forever'),
          closeButton: true
        }}
        dialogAction={{
          onSubmit: handleDeleteSubmit,
          submitLabel: t('Delete Forever'),
          closeLabel: t('Cancel')
        }}
      >
        <Typography>
          {t(
            'Are you sure you would like to permanently delete all trashed journeys immediately?'
          )}
        </Typography>
      </Dialog>
    </>
  )
}
