import { ReactElement, useEffect, useState } from 'react'
import Card from '@mui/material/Card'
import { gql, useMutation } from '@apollo/client'
import Typography from '@mui/material/Typography'
import { Dialog } from '@core/shared/ui/Dialog'
import { useTranslation } from 'react-i18next'
import { AuthUser } from 'next-firebase-auth'
import { useSnackbar } from 'notistack'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { GetActiveJourneys_journeys as Journeys } from '../../../../__generated__/GetActiveJourneys'
import { JourneyFields } from '../../../../__generated__/JourneyFields'
import { JourneyCard } from '../JourneyCard'
import { AddJourneyButton } from '../AddJourneyButton'
import { SortOrder } from '../JourneySort'
import { sortJourneys } from '../JourneySort/utils/sortJourneys'
import { useActiveJourneys } from '../../../libs/useActiveJourneys'
import { getDuplicatedJourney } from './utils/getDuplicatedJourney'

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

interface ActiveJourneyListProps {
  onLoad: () => void
  sortOrder?: SortOrder
  event: string | undefined
  authUser?: AuthUser
}

export function ActiveJourneyList({
  onLoad,
  sortOrder,
  event,
  authUser
}: ActiveJourneyListProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const activeJourneys = useActiveJourneys()

  const [oldJourneys, setOldJourneys] = useState<Journeys[]>()
  const [journeys, setJourneys] = useState<Journeys[]>()

  useEffect(() => {
    setOldJourneys(journeys)
    setJourneys(activeJourneys?.data?.journeys)
  }, [activeJourneys?.data?.journeys, journeys, oldJourneys])

  const duplicatedJourneyId = getDuplicatedJourney(oldJourneys, journeys)

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
    update(cache, { data }) {
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
    if (activeJourneys != null) {
      const { loading, error } = activeJourneys
      if (!loading && error == null) {
        onLoad()
      }
    }
  }, [onLoad, activeJourneys])

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

  const sortedJourneys =
    journeys != null ? sortJourneys(journeys, sortOrder) : undefined

  return (
    <>
      {journeys != null && sortedJourneys != null ? (
        <>
          {sortedJourneys.map((journey) => (
            <JourneyProvider
              key={journey.id}
              value={{ journey: journey as JourneyFields, admin: true }}
            >
              <JourneyCard
                journey={journey}
                refetch={activeJourneys?.refetch}
                duplicatedJourneyId={duplicatedJourneyId}
              />
            </JourneyProvider>
          ))}
          {journeys.length === 0 && (
            <Card
              variant="outlined"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                pt: 20,
                pb: 16,
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
              <AddJourneyButton variant="button" />
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
