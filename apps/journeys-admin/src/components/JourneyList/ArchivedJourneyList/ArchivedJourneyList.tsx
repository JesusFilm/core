import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import dynamic from 'next/dynamic'
import { useSnackbar } from 'notistack'
import { ReactElement, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { useAdminJourneysSuspenseQuery } from '../../../libs/useAdminJourneysSuspenseQuery'
import { JourneyCard } from '../JourneyCard'
import type { JourneyListProps } from '../JourneyList'
import { sortJourneys } from '../JourneySort/utils/sortJourneys'

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
  const { data, refetch } = useAdminJourneysSuspenseQuery({
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
      enqueueSnackbar(error.message, {
        variant: 'error',
        preventDuplicate: true
      })
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
      enqueueSnackbar(error.message, {
        variant: 'error',
        preventDuplicate: true
      })
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

  const sortedJourneys = sortJourneys(data.journeys, sortOrder)

  return (
    <>
      <Box>
        {sortedJourneys.map((journey) => (
          <JourneyCard key={journey.id} journey={journey} refetch={refetch} />
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
                {t('No archived journeys.')}
              </Typography>
            </Card>
          </>
        )}
      </Box>
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
          <Typography>
            {t(
              'Are you sure you would like to unarchive all archived journeys immediately?'
            )}
          </Typography>
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
          <Typography>
            {t(
              'Are you sure you would like to trash all archived journeys immediately?'
            )}
          </Typography>
        </Dialog>
      )}
    </>
  )
}
