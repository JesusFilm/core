import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import dynamic from 'next/dynamic'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement, useEffect, useState } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { JourneyFields } from '../../../../__generated__/JourneyFields'
import { useAdminJourneysQuery } from '../../../libs/useAdminJourneysQuery'
import { JourneyCard } from '../JourneyCard'
import type { JourneyListProps } from '../JourneyList'
import { sortJourneys } from '../JourneySort/utils/sortJourneys'
import { LoadingJourneyList } from '../LoadingJourneyList'

const Dialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "core/shared/ui-dynamic/Dialog" */
      '@core/shared/ui-dynamic/Dialog'
    ).then((mod) => mod.Dialog),
  { ssr: false }
)

export const RESTORE_ARCHIVED_JOURNEYS = gql`
  mutation RestoreArchivedJourneys($ids: [ID!]!) {
    journeysRestore(ids: $ids) {
      id
      status
    }
  }
`

export const TRASH_ARCHIVED_JOURNEYS = gql`
  mutation TrashArchivedJourneys($ids: [ID!]!) {
    journeysTrash(ids: $ids) {
      id
      status
    }
  }
`

export function ArchivedJourneyList({
  user,
  sortOrder,
  event
}: JourneyListProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const { data, refetch } = useAdminJourneysQuery({
    status: [JourneyStatus.archived],
    useLastActiveTeamId: true
  })

  const [restore] = useMutation(RESTORE_ARCHIVED_JOURNEYS, {
    update(_cache, { data }) {
      if (data?.journeysRestore != null) {
        enqueueSnackbar(t('Journeys Restored'), {
          variant: 'success'
        })
        void refetch()
      }
    }
  })
  const [trash] = useMutation(TRASH_ARCHIVED_JOURNEYS, {
    update(_cache, { data }) {
      if (data?.journeysTrash != null) {
        enqueueSnackbar(t('Journeys Trashed'), {
          variant: 'success'
        })
        void refetch()
      }
    }
  })
  const [openRestoreDialog, setOpenRestoreDialog] = useState<
    boolean | undefined
  >()
  const [openTrashDialog, setOpenTrashDialog] = useState<boolean | undefined>()

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
      await restore({ variables: { ids: journeyIds } })
    } catch (error) {
      if (error instanceof Error) {
        enqueueSnackbar(error.message, {
          variant: 'error',
          preventDuplicate: true
        })
      }
    }
    handleClose()
  }

  async function handleTrashSubmit(): Promise<void> {
    try {
      const journeyIds = data?.journeys
        ?.filter(
          (journey) =>
            journey.userJourneys?.find(
              (userJourney) => userJourney.user?.id === (user?.id ?? '')
            )?.role === 'owner'
        )
        .map((journey) => journey.id)
      await trash({ variables: { ids: journeyIds } })
    } catch (error) {
      if (error instanceof Error) {
        enqueueSnackbar(error.message, {
          variant: 'error',
          preventDuplicate: true
        })
      }
    }
    handleClose()
  }

  function handleClose(): void {
    setOpenRestoreDialog(false)
    setOpenTrashDialog(false)
  }

  useEffect(() => {
    switch (event) {
      case 'restoreAllArchived':
        setOpenRestoreDialog(true)
        break
      case 'trashAllArchived':
        setOpenTrashDialog(true)
        break
      case 'refetchArchived':
        void refetch()
        break
    }
  }, [event, refetch])

  const sortedJourneys =
    data?.journeys != null ? sortJourneys(data.journeys, sortOrder) : undefined

  return (
    <>
      {sortedJourneys == null ? (
        <LoadingJourneyList hideHelperText />
      ) : (
        <Box
          sx={{
            mt: { xs: 3, sm: 2 },
            px: { xs: 5, sm: 0 }
          }}
        >
          <Grid container spacing={4} rowSpacing={{ xs: 2.5, sm: 4 }}>
            {sortedJourneys.map((journey) => (
              <Grid
                key={journey.id}
                size={{ xs: 12, sm: 6, md: 6, lg: 3, xl: 3 }}
              >
                <JourneyProvider
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
              </Grid>
            ))}
          </Grid>
          {sortedJourneys.length === 0 && (
            <>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  pt: 30
                }}
              >
                <Typography variant="subtitle1" align="center">
                  {t('No archived journeys.')}
                </Typography>
              </Box>
            </>
          )}
        </Box>
      )}
      <Stack alignItems="center">
        <Typography
          variant="caption"
          align="center"
          component="div"
          sx={{ py: { xs: 3, sm: 5 }, maxWidth: 290 }}
        >
          {t(
            'You can archive a Journey to hide it from your active Journey list for better organization.'
          )}
        </Typography>
      </Stack>
      {openRestoreDialog != null && (
        <Dialog
          open={openRestoreDialog}
          onClose={handleClose}
          dialogTitle={{
            title: t('Unarchive Journeys'),
            closeButton: true
          }}
          dialogAction={{
            onSubmit: handleRestoreSubmit,
            submitLabel: t('Unarchive'),
            closeLabel: t('Cancel')
          }}
        >
          <Typography sx={{ fontWeight: 'bold' }}>
            {t('This will unarchive all archived journeys you own.')}
          </Typography>
          <Typography>{t('Are you sure you want to proceed?')}</Typography>
        </Dialog>
      )}
      {openTrashDialog != null && (
        <Dialog
          open={openTrashDialog}
          onClose={handleClose}
          dialogTitle={{
            title: t('Trash Journeys'),
            closeButton: true
          }}
          dialogAction={{
            onSubmit: handleTrashSubmit,
            submitLabel: t('Trash'),
            closeLabel: t('Cancel')
          }}
        >
          <Typography sx={{ fontWeight: 'bold' }}>
            {t('This will trash all archived journeys you own.')}
          </Typography>
          <Typography>{t('Are you sure you want to proceed?')}</Typography>
        </Dialog>
      )}
    </>
  )
}
