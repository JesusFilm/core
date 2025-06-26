import { useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import dynamic from 'next/dynamic'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement, useEffect, useState } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { JourneyFields } from '../../../../__generated__/JourneyFields'
import { useAdminJourneysQuery } from '../../../libs/useAdminJourneysQuery'
import {
  ARCHIVE_ACTIVE_JOURNEYS,
  TRASH_ACTIVE_JOURNEYS
} from '../../JourneyList/ActiveJourneyList/ActiveJourneyList'
import { JourneyCard } from '../../JourneyList/JourneyCard'
import type { JourneyListProps } from '../../JourneyList/JourneyList'
import { sortJourneys } from '../../JourneyList/JourneySort/utils/sortJourneys'
import { LoadingJourneyList } from '../../JourneyList/LoadingJourneyList'

const Dialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "core/shared/ui-dynamic/Dialog" */
      '@core/shared/ui-dynamic/Dialog'
    ).then((mod) => mod.Dialog),
  { ssr: false }
)

export function ActiveTemplateList({
  sortOrder,
  event
}: Omit<JourneyListProps, 'user'>): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const { data, refetch } = useAdminJourneysQuery({
    status: [JourneyStatus.draft, JourneyStatus.published],
    template: true
  })
  const [archive] = useMutation(ARCHIVE_ACTIVE_JOURNEYS, {
    update(_cache, { data }) {
      if (data?.journeysArchive != null) {
        enqueueSnackbar(t('Journeys Archived'), {
          variant: 'success'
        })
        void refetch()
      }
    }
  })
  const [trash] = useMutation(TRASH_ACTIVE_JOURNEYS, {
    update(_cache, { data }) {
      if (data?.journeysTrash != null) {
        enqueueSnackbar(t('Journeys Trashed'), {
          variant: 'success'
        })
        void refetch()
      }
    }
  })
  const [archiveDialogOpen, setArchiveDialogOpen] = useState<
    boolean | undefined
  >()
  const [trashDialogOpen, setTrashDialogOpen] = useState<boolean | undefined>()

  async function handleArchiveSubmit(): Promise<void> {
    try {
      await archive({
        variables: {
          ids: data?.journeys?.map((journey) => journey.id)
        }
      })
    } catch (error) {
      if (error instanceof Error) {
        enqueueSnackbar(error.message, {
          variant: 'error',
          preventDuplicate: true
        })
      }
    }
    handleClose()
  }

  async function handleTrashSubmit(): Promise<void> {
    try {
      await trash({
        variables: {
          ids: data?.journeys?.map((journey) => journey.id)
        }
      })
    } catch (error) {
      if (error instanceof Error) {
        enqueueSnackbar(error.message, {
          variant: 'error',
          preventDuplicate: true
        })
      }
    }
    handleClose()
  }
  function handleClose(): void {
    setArchiveDialogOpen(false)
    setTrashDialogOpen(false)
  }

  useEffect(() => {
    switch (event) {
      case 'archiveAllActive':
        setArchiveDialogOpen(true)
        break
      case 'trashAllActive':
        setTrashDialogOpen(true)
        break
      case 'refetchActive':
        void refetch()
        break
    }
  }, [event, refetch])

  const sortedJourneys =
    data?.journeys != null ? sortJourneys(data.journeys, sortOrder) : undefined

  return (
    <Box
      sx={{
        mt: { xs: 3, sm: 2 },
        px: { xs: 5, sm: 0 }
      }}
    >
      {sortedJourneys != null ? (
        <>
          <Grid container spacing={4} rowSpacing={{ xs: 2.5, sm: 4 }}>
            {sortedJourneys.map((journey) => (
              <Grid
                key={journey.id}
                size={{ xs: 12, sm: 6, md: 6, lg: 3, xl: 3 }}
              >
                <JourneyProvider
                  value={{
                    journey: journey as unknown as JourneyFields,
                    variant: 'admin'
                  }}
                >
                  <JourneyCard
                    key={journey.id}
                    journey={journey}
                    refetch={refetch}
                  />
                </JourneyProvider>
              </Grid>
            ))}
          </Grid>
          {sortedJourneys.length === 0 && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                pt: 30
              }}
            >
              <Typography variant="subtitle1" align="center" gutterBottom>
                {t('No templates to display.')}
              </Typography>
            </Box>
          )}
        </>
      ) : (
        <LoadingJourneyList hideHelperText />
      )}
      <Stack alignItems="center">
        <Typography
          variant="caption"
          align="center"
          component="div"
          sx={{ py: { xs: 3, sm: 5 }, maxWidth: 290 }}
        >
          {t(
            'You can archive a template to to delist it from the Template Library.'
          )}
        </Typography>
      </Stack>
      {archiveDialogOpen != null && (
        <Dialog
          open={archiveDialogOpen}
          onClose={handleClose}
          dialogTitle={{
            title: t('Archive Templates'),
            closeButton: true
          }}
          dialogAction={{
            onSubmit: handleArchiveSubmit,
            submitLabel: t('Archive'),
            closeLabel: t('Cancel')
          }}
        >
          <Typography>
            {t(
              'Are you sure you would like to archive all active templates immediately?'
            )}
          </Typography>
        </Dialog>
      )}
      {trashDialogOpen != null && (
        <Dialog
          open={trashDialogOpen}
          onClose={handleClose}
          dialogTitle={{
            title: t('Trash Templates'),
            closeButton: true
          }}
          dialogAction={{
            onSubmit: handleTrashSubmit,
            submitLabel: t('Trash'),
            closeLabel: t('Cancel')
          }}
        >
          <Typography>
            {t(
              'Are you sure you would like to trash all active templates immediately?'
            )}
          </Typography>
        </Dialog>
      )}
    </Box>
  )
}
