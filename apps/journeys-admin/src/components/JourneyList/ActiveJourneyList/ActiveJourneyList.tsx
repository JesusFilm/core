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
import type { JourneyListProps } from '../JourneyList'

import { ActivePriorityList } from './ActivePriorityList'
import { AddJourneyButton } from './AddJourneyButton'

const Dialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "core/shared/ui-dynamic/Dialog" */
      '@core/shared/ui-dynamic/Dialog'
    ).then((mod) => mod.Dialog),
  { ssr: false }
)

export const ARCHIVE_ACTIVE_JOURNEYS = gql`
  mutation ArchiveActiveJourneys($ids: [ID!]!) {
    journeysArchive(ids: $ids) {
      id
      status
    }
  }
`

export const TRASH_ACTIVE_JOURNEYS = gql`
  mutation TrashActiveJourneys($ids: [ID!]!) {
    journeysTrash(ids: $ids) {
      id
      status
    }
  }
`
export function ActiveJourneyList({
  user,
  sortOrder,
  event
}: JourneyListProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const { data, refetch } = useAdminJourneysSuspenseQuery({
    status: [JourneyStatus.draft, JourneyStatus.published],
    useLastActiveTeamId: true
  })
  const [archive] = useMutation(ARCHIVE_ACTIVE_JOURNEYS, {
    update(_cache, { data }) {
      if (data?.journeysArchive != null) {
        enqueueSnackbar(t('Journeys Archived'), {
          variant: 'success'
        })
        void refetch()
      }
    }
  })
  const [trash] = useMutation(TRASH_ACTIVE_JOURNEYS, {
    update(_cache, { data }) {
      if (data?.journeysTrash != null) {
        enqueueSnackbar(t('Journeys Trashed'), {
          variant: 'success'
        })
        void refetch()
      }
    }
  })
  const [archiveDialogOpen, setArchiveDialogOpen] = useState<
    boolean | undefined
  >()
  const [trashDialogOpen, setTrashDialogOpen] = useState<boolean | undefined>()

  async function handleArchiveSubmit(): Promise<void> {
    try {
      const journeyIds = data?.journeys
        ?.filter(
          (journey) =>
            journey.userJourneys?.find(
              (userJourney) => userJourney.user?.id === (user?.id ?? '')
            )?.role === 'owner'
        )
        .map((journey) => journey.id)
      await archive({ variables: { ids: journeyIds } })
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
    setArchiveDialogOpen(false)
    setTrashDialogOpen(false)
  }

  useEffect(() => {
    switch (event) {
      case 'archiveAllActive':
        setArchiveDialogOpen(true)
        break
      case 'trashAllActive':
        setTrashDialogOpen(true)
        break
      case 'refetchActive':
        void refetch()
        break
    }
  }, [event, refetch])

  return (
    <>
      <Box>
        <ActivePriorityList
          journeys={data.journeys}
          sortOrder={sortOrder}
          refetch={refetch}
          user={user}
        />
        {data.journeys.length === 0 && (
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
            <Typography variant="subtitle1" align="center" gutterBottom>
              {t('No journeys to display.')}
            </Typography>
            <Typography variant="caption" align="center" gutterBottom>
              {t('Create a journey, then find it here.')}
            </Typography>
            <AddJourneyButton />
          </Card>
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
      {archiveDialogOpen != null && (
        <Dialog
          open={archiveDialogOpen}
          onClose={handleClose}
          dialogTitle={{
            title: t('Archive Journeys'),
            closeButton: true
          }}
          dialogAction={{
            onSubmit: handleArchiveSubmit,
            submitLabel: t('Archive'),
            closeLabel: t('Cancel')
          }}
        >
          <Typography>
            {t(
              'Are you sure you would like to archive all active journeys immediately?'
            )}
          </Typography>
        </Dialog>
      )}
      {trashDialogOpen != null && (
        <Dialog
          open={trashDialogOpen}
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
              'Are you sure you would like to trash all active journeys immediately?'
            )}
          </Typography>
        </Dialog>
      )}
    </>
  )
}
