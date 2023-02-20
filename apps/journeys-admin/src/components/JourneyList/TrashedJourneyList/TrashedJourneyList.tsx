import { ReactElement, useEffect, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import { gql, useMutation, useQuery } from '@apollo/client'
import Typography from '@mui/material/Typography'
import { Dialog } from '@core/shared/ui/Dialog'
import { useTranslation } from 'react-i18next'
import { useSnackbar } from 'notistack'
import { AuthUser } from 'next-firebase-auth'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JourneyFields } from '../../../../__generated__/JourneyFields'
import {
  GetTrashedJourneys,
  GetTrashedJourneys_journeys as TrashedJourney
} from '../../../../__generated__/GetTrashedJourneys'
import { JourneyCard } from '../JourneyCard'
import { SortOrder } from '../JourneySort'
import { sortJourneys } from '../JourneySort/utils/sortJourneys'

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

interface TrashedJourneyListProps {
  onLoad: (journeys: string[] | undefined) => void
  sortOrder?: SortOrder
  event: string | undefined
  authUser?: AuthUser
}

export function TrashedJourneyList({
  onLoad,
  sortOrder,
  event,
  authUser
}: TrashedJourneyListProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const { data, loading, error, refetch } =
    useQuery<GetTrashedJourneys>(GET_TRASHED_JOURNEYS)
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

  const once = useRef(false)
  useEffect(() => {
    if (!once.current) {
      if (!loading && error == null) {
        onLoad(journeys?.map((journey) => journey.id))
        once.current = true
      }
    }
  }, [onLoad, loading, error, journeys, once])

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
      {journeys != null && sortedJourneys != null ? (
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
                  pt: 20,
                  pb: 16,
                  borderBottomLeftRadius: { xs: 0, sm: 12 },
                  borderBottomRightRadius: { xs: 0, sm: 12 },
                  borderTopLeftRadius: 0,
                  borderTopRightRadius: 0
                }}
              >
                <Typography variant="subtitle1" align="center" gutterBottom>
                  {t('Your trashed journeys will appear here.')}
                </Typography>
              </Card>
            </>
          )}
          <span>
            <Box width="100%" sx={{ textAlign: 'center' }}>
              <Typography variant="caption">
                {t('Trashed journeys are moved here for up to 40 days.')}
              </Typography>
            </Box>
          </span>
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
