import { ReactElement, useEffect, useState } from 'react'
import { gql, useMutation, useQuery } from '@apollo/client'
import { Dialog } from '@core/shared/ui/Dialog'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import { useSnackbar } from 'notistack'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JourneyFields } from '../../../../__generated__/JourneyFields'
import { GetArchivedJourneys } from '../../../../__generated__/GetArchivedJourneys'
import { JourneyCard } from '../JourneyCard'
import { sortJourneys } from '../JourneySort/utils/sortJourneys'
import { JourneyListProps } from '../JourneyList'

export const GET_ARCHIVED_JOURNEYS = gql`
  query GetArchivedJourneys {
    journeys: adminJourneys(status: [archived]) {
      id
      title
      createdAt
      publishedAt
      description
      slug
      themeName
      themeMode
      language {
        id
        name(primary: true) {
          value
          primary
        }
      }
      status
      seoTitle
      seoDescription
      userJourneys {
        id
        role
        openedAt
        user {
          id
          firstName
          lastName
          imageUrl
        }
      }
    }
  }
`

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
  sortOrder,
  event,
  authUser
}: JourneyListProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const { data, refetch } = useQuery<GetArchivedJourneys>(GET_ARCHIVED_JOURNEYS)
  const journeys = data?.journeys

  const [restoreArchived] = useMutation(RESTORE_ARCHIVED_JOURNEYS, {
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
      if (data?.journeysRestore != null) {
        enqueueSnackbar(t('Journeys Restored'), {
          variant: 'success'
        })
        void refetch()
      }
    }
  })

  const [trashArchived] = useMutation(TRASH_ARCHIVED_JOURNEYS, {
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
        void refetch()
      }
    }
  })

  const [openRestoreAll, setOpenRestoreAll] = useState(false)
  const [openTrashAll, setOpenTrashAll] = useState(false)

  const snackbarError = (error: Error): void => {
    enqueueSnackbar(error.message, {
      variant: 'error',
      preventDuplicate: true
    })
  }

  const restoreAll = async (): Promise<void> => {
    try {
      await restoreArchived()
    } catch (error) {
      snackbarError(error)
    }
    handleClose()
  }

  const trashAll = async (): Promise<void> => {
    try {
      await trashArchived()
    } catch (error) {
      snackbarError(error)
    }
    handleClose()
  }

  const handleClose = (): void => {
    setOpenRestoreAll(false)
    setOpenTrashAll(false)
  }

  useEffect(() => {
    switch (event) {
      case 'restoreAllArchived':
        setOpenRestoreAll(true)
        break
      case 'trashAllArchived':
        setOpenTrashAll(true)
        break
      case 'refetchArchived':
        void refetch()
        break
    }
  }, [event, refetch])

  const sortedJourneys =
    journeys != null ? sortJourneys(journeys, sortOrder) : undefined

  return (
    <>
      {sortedJourneys != null ? (
        <>
          {sortedJourneys.map((journey) => (
            <JourneyProvider
              key={journey.id}
              value={{ journey: journey as JourneyFields, admin: true }}
            >
              <JourneyCard journey={journey} refetch={refetch} />
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
                  {t('No archived journeys.')}
                </Typography>
              </Card>
            </>
          )}
        </>
      ) : (
        [0, 1, 2].map((index) => <JourneyCard key={`journeyCard${index}`} />)
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
      <Dialog
        open={openRestoreAll ?? false}
        onClose={handleClose}
        dialogTitle={{
          title: t('Unarchive Journeys'),
          closeButton: true
        }}
        dialogAction={{
          onSubmit: restoreAll,
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
            'Are you sure you would like to trash all archived journeys immediately?'
          )}
        </Typography>
      </Dialog>
    </>
  )
}
