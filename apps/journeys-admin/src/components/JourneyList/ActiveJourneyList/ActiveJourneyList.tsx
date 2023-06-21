import { ReactElement, useEffect, useState } from 'react'
import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Dialog } from '@core/shared/ui/Dialog'
import { useTranslation } from 'react-i18next'
import { useSnackbar } from 'notistack'
import { GetActiveJourneys_journeys as Journeys } from '../../../../__generated__/GetActiveJourneys'
import { JourneyCard } from '../JourneyCard'
import { JourneyListProps } from '../JourneyList'
import { DiscoveryJourneys } from '../../DiscoveryJourneys'
import { useJourneys } from '../../../libs/useJourneys'
import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { AddJourneyButton } from './AddJourneyButton'
import { ActivePriorityList } from './ActivePriorityList'

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
  sortOrder,
  event,
  authUser
}: JourneyListProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const activeJourneys = useJourneys({
    status: [JourneyStatus.draft, JourneyStatus.published]
  })

  const [oldJourneys, setOldJourneys] = useState<Journeys[]>()
  const [journeys, setJourneys] = useState<Journeys[]>()

  useEffect(() => {
    setOldJourneys(journeys)
    setJourneys(activeJourneys?.data?.journeys)
  }, [activeJourneys?.data?.journeys, journeys, oldJourneys])

  const [archiveActive] = useMutation(ARCHIVE_ACTIVE_JOURNEYS, {
    variables: {
      ids: journeys
        ?.filter(
          (journey) =>
            journey.userJourneys?.find(
              (userJourney) => userJourney.user?.id === (authUser?.id ?? '')
            )?.role === 'owner'
        )
        .map((journey) => journey.id)
    },
    update(cache, { data }) {
      if (data?.journeysArchive != null) {
        enqueueSnackbar(t('Journeys Archived'), {
          variant: 'success'
        })
        void activeJourneys?.refetch()
      }
    }
  })

  const [trashActive] = useMutation(TRASH_ACTIVE_JOURNEYS, {
    variables: {
      ids: journeys
        ?.filter(
          (journey) =>
            journey.userJourneys?.find(
              (userJourney) => userJourney.user?.id === (authUser?.id ?? '')
            )?.role === 'owner'
        )
        .map((journey) => journey.id)
    },
    update(_cache, { data }) {
      if (data?.journeysTrash != null) {
        enqueueSnackbar(t('Journeys Trashed'), {
          variant: 'success'
        })
        void activeJourneys?.refetch()
      }
    }
  })

  const [openArchiveAll, setOpenArchiveAll] = useState(false)
  const [openTrashAll, setOpenTrashAll] = useState(false)

  const snackbarError = (error: Error): void => {
    enqueueSnackbar(error.message, {
      variant: 'error',
      preventDuplicate: true
    })
  }

  const archiveAll = async (): Promise<void> => {
    try {
      await archiveActive()
    } catch (error) {
      snackbarError(error)
    }
    handleClose()
  }

  const trashAll = async (): Promise<void> => {
    try {
      await trashActive()
    } catch (error) {
      snackbarError(error)
    }
    handleClose()
  }

  const handleClose = (): void => {
    setOpenArchiveAll(false)
    setOpenTrashAll(false)
  }

  useEffect(() => {
    switch (event) {
      case 'archiveAllActive':
        setOpenArchiveAll(true)
        break
      case 'trashAllActive':
        setOpenTrashAll(true)
        break
      case 'refetchActive':
        void activeJourneys?.refetch()
        break
    }
  }, [event, activeJourneys])

  return (
    <>
      {journeys != null ? (
        <>
          <ActivePriorityList
            journeys={journeys}
            sortOrder={sortOrder}
            refetch={activeJourneys?.refetch}
            authUser={authUser}
          />
          {journeys.length === 0 && (
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
                No journeys to display.
              </Typography>
              <Typography variant="caption" align="center" gutterBottom>
                Create a journey, then find it here.
              </Typography>
              <AddJourneyButton />
            </Card>
          )}
        </>
      ) : (
        <>
          {[0, 1, 2].map((index) => (
            <JourneyCard key={`journeyCard${index}`} />
          ))}
        </>
      )}
      <Box
        sx={{
          pt: { xs: 6, sm: 8 }
        }}
      >
        <DiscoveryJourneys />
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
      <Dialog
        open={openArchiveAll ?? false}
        onClose={handleClose}
        dialogTitle={{
          title: t('Archive Journeys'),
          closeButton: true
        }}
        dialogAction={{
          onSubmit: archiveAll,
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
      <Dialog
        open={openTrashAll ?? false}
        onClose={handleClose}
        dialogTitle={{
          title: t('Trash Journeys'),
          closeButton: true
        }}
        dialogAction={{
          onSubmit: trashAll,
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
    </>
  )
}
