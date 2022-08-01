import { ReactElement, useState, useEffect } from 'react'
import { AuthUser } from 'next-firebase-auth'
import Typography from '@mui/material/Typography'
import { useMutation } from '@apollo/client'
import { useSnackbar } from 'notistack'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import { activeTemplates as archivedTemplates } from '../ActiveTemplates/ActiveTemplates'
import { SortOrder } from '../../../JourneyList/JourneySort'
import { Dialog } from '../../../Dialog'
import { sortJourneys } from '../../../JourneyList/JourneySort/utils/sortJourneys'
import {
  RESTORE_ARCHIVED_JOURNEYS,
  TRASH_ARCHIVED_JOURNEYS
} from '../../../JourneyList/StatusTabPanel/ArchivedStatusTab/ArchivedStatusTab'

interface ArchivedTemplateProps {
  event: string | undefined
  sortOrder?: SortOrder
  authUser?: AuthUser
}

export function ArchivedTemplates({
  event,
  sortOrder,
  authUser
}: ArchivedTemplateProps): ReactElement {
  const { enqueueSnackbar } = useSnackbar()
  const [openRestoreAll, setOpenRestoreAll] = useState(false)
  const [openTrashAll, setOpenTrashAll] = useState(false)

  const [restoreArchived] = useMutation(RESTORE_ARCHIVED_JOURNEYS, {
    variables: {
      ids: archivedTemplates
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
        // void refetch()
      }
    }
  })

  const [trashArchived] = useMutation(TRASH_ARCHIVED_JOURNEYS, {
    variables: {
      ids: archivedTemplates
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
        // void refetch()
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
    switch (event) {
      case 'restoreAllArchived':
        setOpenRestoreAll(true)
        break
      case 'trashAllArchived':
        setOpenTrashAll(true)
        break
      case 'refetchArchived':
        // void refetch()
        break
    }
  }, [event])

  const sortedTemplates = archivedTemplates // archivedTemplates != null ? sortJourneys(archivedTemplates, sortOrder) : undefined

  return (
    <>
      {sortedTemplates.map((template) => (
        <Typography key={template.id}>{template.title}</Typography>
      ))}

      {sortedTemplates.length > 0 ? (
        <span>
          <Box width="100%" sx={{ textAlign: 'center' }}>
            <Typography variant="caption">
              Archived journeys are hidden from your active journey list for
              better organization.
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
              No archived journeys.
            </Typography>
          </Card>
          <Box width="100%" sx={{ textAlign: 'center' }}>
            <Typography variant="caption">
              You can archive a Journey to hide it from your active Journey list
              for better organization.
            </Typography>
          </Box>
        </>
      )}

      <Dialog
        open={openRestoreAll ?? false}
        handleClose={handleClose}
        dialogTitle={{
          title: 'Unarchive Journeys',
          closeButton: true
        }}
        dialogAction={{
          onSubmit: restoreAll,
          submitLabel: 'Unarchive',
          closeLabel: 'Cancel'
        }}
      >
        <Typography>
          Are you sure you would like to unarchive all archived journeys
          immediately?
        </Typography>
      </Dialog>
      <Dialog
        open={openTrashAll ?? false}
        handleClose={handleClose}
        dialogTitle={{
          title: 'Trash Journeys',
          closeButton: true
        }}
        dialogAction={{
          onSubmit: trashAll,
          submitLabel: 'Trash',
          closeLabel: 'Cancel'
        }}
      >
        <Typography>
          Are you sure you would like to trash all archived journeys
          immediately?
        </Typography>
      </Dialog>
    </>
  )
}
