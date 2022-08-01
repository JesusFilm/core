import Typography from '@mui/material/Typography'
import { ReactElement, useState, useEffect } from 'react'
import { useMutation } from '@apollo/client'
import { AuthUser } from 'next-firebase-auth'
import { useSnackbar } from 'notistack'
import { SortOrder } from '../../../JourneyList/JourneySort'
import { Dialog } from '../../../Dialog'
import { sortJourneys } from '../../../JourneyList/JourneySort/utils/sortJourneys'
import {
  ARCHIVE_ACTIVE_JOURNEYS,
  TRASH_ACTIVE_JOURNEYS
} from '../../../JourneyList/StatusTabPanel/ActiveStatusTab/ActiveStatusTab'

interface ActiveTemplatesProps {
  event: string | undefined
  sortOrder?: SortOrder
  authUser?: AuthUser
}

// replace with query getPublishedJourneys({where: template: true})
export const activeTemplates = [
  {
    id: 'template1.id',
    title: 'Template 1',
    userJourneys: [
      {
        id: 'userJourney1.id',
        role: 'owner',
        user: {
          id: 'user1.id',
          firstName: 'John'
        }
      }
    ],
    trashedAt: new Date()
  },
  {
    id: 'template2.id',
    title: 'Template 2',
    userJourneys: [
      {
        id: 'userJourney2.id',
        role: 'owner',
        user: {
          id: 'user2.id',
          firstName: 'Jane'
        }
      }
    ],
    trashedAt: new Date()
  },
  {
    id: 'template3.id',
    title: 'Template 3',
    userJourneys: [
      {
        id: 'userJourney3.id',
        role: 'owner',
        user: {
          id: 'user3.id',
          firstName: 'Steve'
        }
      }
    ],
    trashedAt: new Date()
  }
]

export function ActiveTemplates({
  event,
  sortOrder,
  authUser
}: ActiveTemplatesProps): ReactElement {
  const [templates, setTemplates] = useState(activeTemplates)
  const [openArchiveAll, setOpenArchiveAll] = useState(false)
  const [openTrashAll, setOpenTrashAll] = useState(false)
  const { enqueueSnackbar } = useSnackbar()

  const [archiveActive] = useMutation(ARCHIVE_ACTIVE_JOURNEYS, {
    variables: {
      ids: templates
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
        enqueueSnackbar('Journeys Archived', {
          variant: 'success'
        })
        // void refetch()
      }
    }
  })

  const [trashActive] = useMutation(TRASH_ACTIVE_JOURNEYS, {
    variables: {
      ids: templates
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

  const handleClose = (): void => {
    setOpenArchiveAll(false)
    setOpenTrashAll(false)
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

  useEffect(() => {
    switch (event) {
      case 'archiveAllActive':
        setOpenArchiveAll(true)
        break
      case 'trashAllActive':
        setOpenTrashAll(true)
        break
      case 'refetchActive':
        // void refetch()
        break
    }
  }, [event])

  const sortedTemplates = templates // templates != null ? sortJourneys(templates, sortOrder) : undefined

  return (
    <>
      {sortedTemplates.map((template) => (
        <Typography key={template.id}>{template.title}</Typography>
      ))}

      <Dialog
        open={openArchiveAll ?? false}
        handleClose={handleClose}
        dialogTitle={{
          title: 'Archive Journeys',
          closeButton: true
        }}
        dialogAction={{
          onSubmit: archiveAll,
          submitLabel: 'Archive',
          closeLabel: 'Cancel'
        }}
      >
        <Typography>
          Are you sure you would like to archive all active journeys
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
          Are you sure you would like to trash all active journeys immediately?
        </Typography>
      </Dialog>
    </>
  )
}
