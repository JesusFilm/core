import { useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import dynamic from 'next/dynamic'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement, useEffect, useState } from 'react'

import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { useAdminJourneysQuery } from '../../../libs/useAdminJourneysQuery'
import { JourneyListProps } from '../../JourneyList/JourneyList'
import { sortJourneys } from '../../JourneyList/JourneySort/utils/sortJourneys'
import {
  DELETE_TRASHED_JOURNEYS,
  RESTORE_TRASHED_JOURNEYS
} from '../../JourneyList/TrashedJourneyList/TrashedJourneyList'
import { LoadingTemplateList } from '../LoadingTemplateList'
import { TemplateListItem } from '../TemplateListItem'

const Dialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "core/shared/ui-dynamic/Dialog" */
      '@core/shared/ui-dynamic/Dialog'
    ).then((mod) => mod.Dialog),
  { ssr: false }
)

export function TrashedTemplateList({
  sortOrder,
  event
}: Omit<JourneyListProps, 'user'>): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const { data, refetch } = useAdminJourneysQuery({
    status: [JourneyStatus.trashed],
    template: true
  })
  const [restoreTrashed] = useMutation(RESTORE_TRASHED_JOURNEYS, {
    update(_cache, { data }) {
      if (data?.journeysRestore != null) {
        enqueueSnackbar(t('Journeys Restored'), {
          variant: 'success'
        })
        void refetch()
      }
    }
  })
  const [deleteTrashed] = useMutation(DELETE_TRASHED_JOURNEYS, {
    update(_cache, { data }) {
      if (data?.journeysDelete != null) {
        enqueueSnackbar(t('Journeys Deleted'), {
          variant: 'success'
        })
        void refetch()
      }
    }
  })
  const [restoreDialogOpen, setRestoreDialogOpen] = useState<
    boolean | undefined
  >()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<
    boolean | undefined
  >()

  async function handleRestoreSubmit(): Promise<void> {
    try {
      await restoreTrashed({
        variables: {
          ids: data?.journeys?.map((journey) => journey.id)
        }
      })
    } catch (error) {
      enqueueSnackbar(error.message, {
        variant: 'error',
        preventDuplicate: true
      })
    }
    handleClose()
  }

  async function handleDeleteSubmit(): Promise<void> {
    try {
      await deleteTrashed({
        variables: {
          ids: data?.journeys?.map((journey) => journey.id)
        }
      })
    } catch (error) {
      enqueueSnackbar(error.message, {
        variant: 'error',
        preventDuplicate: true
      })
    }
    handleClose()
  }

  function handleClose(): void {
    setRestoreDialogOpen(false)
    setDeleteDialogOpen(false)
  }

  useEffect(() => {
    switch (event) {
      case 'restoreAllTrashed':
        setRestoreDialogOpen(true)
        break
      case 'deleteAllTrashed':
        setDeleteDialogOpen(true)
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
    data?.journeys != null
      ? sortJourneys(
          data.journeys.filter(
            (journey) => new Date(journey.trashedAt) > daysAgo
          ),
          sortOrder
        )
      : undefined

  return (
    <>
      {sortedJourneys != null ? (
        <Box>
          {sortedJourneys.map((journey) => (
            <TemplateListItem
              key={journey.id}
              journey={journey}
              refetch={refetch}
            />
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
                {t('Your trashed templates will appear here.')}
              </Typography>
            </Card>
          )}
        </Box>
      ) : (
        <LoadingTemplateList hideHelperText />
      )}
      <Stack alignItems="center">
        <Typography
          variant="caption"
          align="center"
          component="div"
          sx={{ py: { xs: 3, sm: 5 }, maxWidth: 290 }}
        >
          {t('Trashed templates are moved here for up to 40 days.')}
        </Typography>
      </Stack>
      {restoreDialogOpen != null && (
        <Dialog
          open={restoreDialogOpen}
          onClose={handleClose}
          dialogTitle={{
            title: t('Restore Templates'),
            closeButton: true
          }}
          dialogAction={{
            onSubmit: handleRestoreSubmit,
            submitLabel: t('Restore'),
            closeLabel: t('Cancel')
          }}
        >
          <Typography>
            {t(
              'Are you sure you would like to restore all trashed templates immediately?'
            )}
          </Typography>
        </Dialog>
      )}
      {deleteDialogOpen != null && (
        <Dialog
          open={deleteDialogOpen}
          onClose={handleClose}
          dialogTitle={{
            title: t('Delete Templates Forever'),
            closeButton: true
          }}
          dialogAction={{
            onSubmit: handleDeleteSubmit,
            submitLabel: t('Delete Forever'),
            closeLabel: t('Cancel')
          }}
        >
          <Typography>
            {t(
              'Are you sure you would like to permanently delete all trashed templates immediately?'
            )}
          </Typography>
        </Dialog>
      )}
    </>
  )
}
