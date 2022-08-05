import { ReactElement, useState, useEffect } from 'react'
import { AuthUser } from 'next-firebase-auth'
import Typography from '@mui/material/Typography'
import { gql, useMutation, useQuery } from '@apollo/client'
import { useSnackbar } from 'notistack'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import { Dialog } from '../../../Dialog'
import { SortOrder } from '../../../JourneyList/JourneySort'
import { sortJourneys } from '../../../JourneyList/JourneySort/utils/sortJourneys'
import {
  RESTORE_ARCHIVED_JOURNEYS,
  TRASH_ARCHIVED_JOURNEYS
} from '../../../JourneyList/StatusTabPanel/ArchivedStatusTab/ArchivedStatusTab'
import { GetArchivedPublisherTemplates } from '../../../../../__generated__/GetArchivedPublisherTemplates'

export const GET_ARCHIVED_PUBLISHER_TEMPLATES = gql`
  query GetArchivedPublisherTemplates {
    journeys: adminJourneys(status: [archived], template: true) {
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

interface ArchivedTemplateProps {
  onLoad: () => void
  event: string | undefined
  sortOrder?: SortOrder
  authUser?: AuthUser
}

export function ArchivedTemplates({
  onLoad,
  event,
  sortOrder,
  authUser
}: ArchivedTemplateProps): ReactElement {
  const { data, loading, error, refetch } =
    useQuery<GetArchivedPublisherTemplates>(GET_ARCHIVED_PUBLISHER_TEMPLATES)

  const { enqueueSnackbar } = useSnackbar()
  const [openRestoreAll, setOpenRestoreAll] = useState(false)
  const [openTrashAll, setOpenTrashAll] = useState(false)

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
        enqueueSnackbar('Journeys Restored', {
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
        enqueueSnackbar('Journeys Trashed', {
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
      {sortedJourneys != null ? (
        <>
          {sortedJourneys.map((template) => (
            <Typography key={template.id}>{template.title}</Typography>
          ))}
          {sortedJourneys.length > 0 ? (
            <span>
              <Box width="100%" sx={{ textAlign: 'center' }}>
                <Typography variant="caption">
                  Archived journeys are hidden from your active templates list
                  for better organization.
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
                  No archived templates.
                </Typography>
              </Card>
              <Box width="100%" sx={{ textAlign: 'center' }}>
                <Typography variant="caption">
                  You can archive a Template to hide it from your active
                  Template list for better organization.
                </Typography>
              </Box>
            </>
          )}
        </>
      ) : (
        <></>
      )}

      <Dialog
        open={openRestoreAll ?? false}
        handleClose={handleClose}
        dialogTitle={{
          title: 'Unarchive Templates',
          closeButton: true
        }}
        dialogAction={{
          onSubmit: restoreAll,
          submitLabel: 'Unarchive',
          closeLabel: 'Cancel'
        }}
      >
        <Typography>
          Are you sure you would like to unarchive all archived templates
          immediately?
        </Typography>
      </Dialog>
      <Dialog
        open={openTrashAll ?? false}
        handleClose={handleClose}
        dialogTitle={{
          title: 'Trash Templates',
          closeButton: true
        }}
        dialogAction={{
          onSubmit: trashAll,
          submitLabel: 'Trash',
          closeLabel: 'Cancel'
        }}
      >
        <Typography>
          Are you sure you would like to trash all archived templates
          immediately?
        </Typography>
      </Dialog>
    </>
  )
}
