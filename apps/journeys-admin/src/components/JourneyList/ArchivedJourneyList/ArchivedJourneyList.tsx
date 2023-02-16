import { ReactElement, useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import { gql, useMutation, useQuery } from '@apollo/client'
import { Dialog } from '@core/shared/ui/Dialog'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import { useSnackbar } from 'notistack'
import { AuthUser } from 'next-firebase-auth'
import { GetArchivedJourneys } from '../../../../__generated__/GetArchivedJourneys'
import { JourneyCard } from '../JourneyCard'
import { SortOrder } from '../JourneySort'
import { sortJourneys } from '../JourneySort/utils/sortJourneys'

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

interface ArchivedJourneyListProps {
  onLoad: () => void
  sortOrder?: SortOrder
  event: string | undefined
  authUser?: AuthUser
}

export function ArchivedJourneyList({
  onLoad,
  sortOrder,
  event,
  authUser
}: ArchivedJourneyListProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const { data, loading, error, refetch } = useQuery<GetArchivedJourneys>(
    GET_ARCHIVED_JOURNEYS
  )
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
    if (!loading && error == null) {
      onLoad()
    }
  }, [onLoad, loading, error])

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
      {journeys != null && sortedJourneys != null ? (
        <>
          {sortedJourneys.map((journey) => (
            <JourneyCard key={journey.id} journey={journey} refetch={refetch} />
          ))}
          {journeys.length > 0 ? (
            <span>
              <Box width="100%" sx={{ textAlign: 'center' }}>
                <Typography variant="caption">
                  {t(
                    'Archived journeys are hidden from your active journey list for better organization.'
                  )}
                </Typography>
              </Box>
            </span>
          ) : (
            <>
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
                  {t('No archived journeys.')}
                </Typography>
              </Card>
              <Box width="100%" sx={{ textAlign: 'center' }}>
                <Typography variant="caption">
                  {t(
                    'You can archive a Journey to hide it from your active Journey list for better organization.'
                  )}
                </Typography>
              </Box>
            </>
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
