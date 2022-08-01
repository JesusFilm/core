import { ReactElement, useState, useEffect } from 'react'
import { AuthUser } from 'next-firebase-auth'
import Typography from '@mui/material/Typography'
import { useMutation } from '@apollo/client'
import { useSnackbar } from 'notistack'
import Card from '@mui/material/Card'
import { activeTemplates as trashedTemplates } from '../ActiveTemplates/ActiveTemplates'
import { SortOrder } from '../../../JourneyList/JourneySort'
import { Dialog } from '../../../Dialog'
import { sortJourneys } from '../../../JourneyList/JourneySort/utils/sortJourneys'
import {
  RESTORE_TRASHED_JOURNEYS,
  DELETE_TRASHED_JOURNEYS
} from '../../../JourneyList/StatusTabPanel/TrashedStatusTab/TrashedStatusTab'

interface TrashedTemplatesProps {
  event: string | undefined
  sortOrder?: SortOrder
  authUser?: AuthUser
}

export function TrashedTemplates({
  event,
  sortOrder,
  authUser
}: TrashedTemplatesProps): ReactElement {
  const { enqueueSnackbar } = useSnackbar()
  const [openRestoreAll, setOpenRestoreAll] = useState(false)
  const [openDeleteAll, setOpenDeleteAll] = useState(false)

  const [restoreTrashed] = useMutation(RESTORE_TRASHED_JOURNEYS, {
    variables: {
      ids: trashedTemplates
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

  const [deleteTrashed] = useMutation(DELETE_TRASHED_JOURNEYS, {
    variables: {
      ids: trashedTemplates
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

  // TODO
  // const once = useRef(false)
  // useEffect(() => {
  //   if (!once.current) {
  //     if (!loading && error == null) {
  //       onLoad(journeys?.map((journey) => journey.id))
  //       once.current = true
  //     }
  //   }
  // }, [onLoad, loading, error, journeys, once])

  useEffect(() => {
    switch (event) {
      case 'restoreAllTrashed':
        setOpenRestoreAll(true)
        break
      case 'deleteAllTrashed':
        setOpenDeleteAll(true)
        break
      case 'refetchTrashed':
        // void refetch()
        break
    }
  }, [event])

  const sortedTemplates = trashedTemplates // journeys != null ? (sortJourneys(journeys, sortOrder) as TrashedJourney[]) : undefined

  // calculate 40 days ago. may later be replaced by cron job
  const daysAgo = new Date()
  daysAgo.setDate(new Date().getDate() - 40)

  return (
    <>
      {sortedTemplates
        .filter((journey) => new Date(journey.trashedAt) > daysAgo)
        .map((template) => (
          <Typography key={template.id}>{template.title}</Typography>
        ))}

      {sortedTemplates.length === 0 && (
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

      <Dialog
        open={openRestoreAll ?? false}
        handleClose={handleClose}
        dialogTitle={{
          title: 'Restore Templates',
          closeButton: true
        }}
        dialogAction={{
          onSubmit: restoreAll,
          submitLabel: 'Templates',
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
          title: 'Delete Template Forever',
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
