import { ReactElement, useState, useEffect, useRef } from 'react'
import { AuthUser } from 'next-firebase-auth'
import Typography from '@mui/material/Typography'
import { gql, useMutation, useQuery } from '@apollo/client'
import { useSnackbar } from 'notistack'
import Card from '@mui/material/Card'
import { SortOrder } from '../../../JourneyList/JourneySort'
import { Dialog } from '../../../Dialog'
import { sortJourneys } from '../../../JourneyList/JourneySort/utils/sortJourneys'
import {
  RESTORE_TRASHED_JOURNEYS,
  DELETE_TRASHED_JOURNEYS
} from '../../../JourneyList/StatusTabPanel/TrashedStatusTab/TrashedStatusTab'
import {
  GetTrashedPublisherTemplates,
  GetTrashedPublisherTemplates_journeys as TrashedJourney
} from '../../../../../__generated__/GetTrashedPublisherTemplates'
import { TemplateCard } from '../../../TemplateList/TemplateCard'

export const GET_TRASHED_PUBLISHER_TEMPLATES = gql`
  query GetTrashedPublisherTemplates {
    journeys: adminJourneys(status: [trashed], template: true) {
      id
      title
      createdAt
      publishedAt
      description
      slug
      themeName
      themeMode
      status
      seoTitle
      seoDescription
      template
      trashedAt
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
      language {
        id
        name(primary: true) {
          value
          primary
        }
      }
      primaryImageBlock {
        id
        parentBlockId
        parentOrder
        src
        alt
        width
        height
        blurhash
      }
    }
  }
`

interface TrashedTemplatesProps {
  onLoad: (journeys: string[] | undefined) => void
  event: string | undefined
  sortOrder?: SortOrder
  authUser?: AuthUser
}

export function TrashedTemplates({
  onLoad,
  event,
  sortOrder,
  authUser
}: TrashedTemplatesProps): ReactElement {
  const { data, loading, error, refetch } =
    useQuery<GetTrashedPublisherTemplates>(GET_TRASHED_PUBLISHER_TEMPLATES)

  const { enqueueSnackbar } = useSnackbar()
  const [openRestoreAll, setOpenRestoreAll] = useState(false)
  const [openDeleteAll, setOpenDeleteAll] = useState(false)

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
        enqueueSnackbar('Journeys Restored', {
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
        enqueueSnackbar('Journeys Deleted', {
          variant: 'success'
        })
        void refetch()
      }
    }
  })

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

  const sortedJourneys =
    journeys != null
      ? (sortJourneys(journeys, sortOrder) as TrashedJourney[])
      : undefined

  // calculate 40 days ago. may later be replaced by cron job
  const daysAgo = new Date()
  daysAgo.setDate(new Date().getDate() - 40)

  return (
    <>
      {sortedJourneys != null ? (
        <>
          {sortedJourneys
            .filter((journey) => new Date(journey.trashedAt) > daysAgo)
            .map((journey) => (
              <TemplateCard key={journey.id} journey={journey} admin={true} />
            ))}

          {sortedJourneys.length === 0 && (
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
                Your Trashed templates will appear here.
              </Typography>
            </Card>
          )}
        </>
      ) : (
        <>
          <TemplateCard />
          <TemplateCard />
          <TemplateCard />
        </>
      )}

      <Dialog
        open={openRestoreAll ?? false}
        handleClose={handleClose}
        dialogTitle={{
          title: 'Restore Templates',
          closeButton: true
        }}
        dialogAction={{
          onSubmit: restoreAll,
          submitLabel: 'Restore',
          closeLabel: 'Cancel'
        }}
      >
        <Typography>
          Are you sure you would like to restore all trashed templates
          immediately?
        </Typography>
      </Dialog>
      <Dialog
        open={openDeleteAll ?? false}
        handleClose={handleClose}
        dialogTitle={{
          title: 'Delete Templates Forever',
          closeButton: true
        }}
        dialogAction={{
          onSubmit: deleteAll,
          submitLabel: 'Delete Forever',
          closeLabel: 'Cancel'
        }}
      >
        <Typography>
          Are you sure you would like to permanently delete all trashed
          templates immediately?
        </Typography>
      </Dialog>
    </>
  )
}
