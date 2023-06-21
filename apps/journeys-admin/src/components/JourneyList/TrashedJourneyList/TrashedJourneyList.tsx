import { ReactElement, useEffect, useState } from 'react'
import { gql, useMutation, useQuery } from '@apollo/client'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Dialog } from '@core/shared/ui/Dialog'
import { useTranslation } from 'react-i18next'
import { useSnackbar } from 'notistack'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JourneyFields } from '../../../../__generated__/JourneyFields'
import {
  GetTrashedJourneys,
  GetTrashedJourneys_journeys as TrashedJourney
} from '../../../../__generated__/GetTrashedJourneys'
import { JourneyCard } from '../JourneyCard'
import { sortJourneys } from '../JourneySort/utils/sortJourneys'
import { JourneyListProps } from '../JourneyList'

export const GET_TRASHED_JOURNEYS = gql`
  query GetTrashedJourneys {
    journeys: adminJourneys(status: [trashed]) {
      id
      title
      createdAt
      publishedAt
      trashedAt
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
  sortOrder,
  event,
  authUser
}: JourneyListProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const { data, refetch } = useQuery<GetTrashedJourneys>(GET_TRASHED_JOURNEYS)
  const journeys = data?.journeys

  const [restoreTrashed] = useMutation(RESTORE_TRASHED_JOURNEYS, {
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

  const [deleteTrashed] = useMutation(DELETE_TRASHED_JOURNEYS, {
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
      if (data?.journeysDelete != null) {
        enqueueSnackbar(t('Journeys Deleted'), {
          variant: 'success'
        })
        void refetch()
      }
    }
  })

  const [openRestoreAll, setOpenRestoreAll] = useState(false)
  const [openDeleteAll, setOpenDeleteAll] = useState(false)

  const snackbarError = (error: Error): void => {
    enqueueSnackbar(error.message, {
      variant: 'error',
      preventDuplicate: true
    })
  }

  const restoreAll = async (): Promise<void> => {
    try {
      await restoreTrashed()
    } catch (error) {
      snackbarError(error)
    }
    handleClose()
  }

  const deleteAll = async (): Promise<void> => {
    try {
      await deleteTrashed()
    } catch (error) {
      snackbarError(error)
    }
    handleClose()
  }

  const handleClose = (): void => {
    setOpenRestoreAll(false)
    setOpenDeleteAll(false)
  }

  useEffect(() => {
    switch (event) {
      case 'restoreAllTrashed':
        setOpenRestoreAll(true)
        break
      case 'deleteAllTrashed':
        setOpenDeleteAll(true)
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
    journeys != null
      ? (sortJourneys(journeys, sortOrder) as TrashedJourney[]).filter(
          (journey) => new Date(journey.trashedAt) > daysAgo
        )
      : undefined

  return (
    <>
      {sortedJourneys != null ? (
        <>
          {sortedJourneys.map((journey) => (
            <JourneyProvider
              key={journey.id}
              value={{
                journey: journey as unknown as JourneyFields,
                admin: true
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
        open={openRestoreAll ?? false}
        onClose={handleClose}
        dialogTitle={{
          title: t('Restore Journeys'),
          closeButton: true
        }}
        dialogAction={{
          onSubmit: restoreAll,
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
        open={openDeleteAll ?? false}
        onClose={handleClose}
        dialogTitle={{
          title: t('Delete Journeys Forever'),
          closeButton: true
        }}
        dialogAction={{
          onSubmit: deleteAll,
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
