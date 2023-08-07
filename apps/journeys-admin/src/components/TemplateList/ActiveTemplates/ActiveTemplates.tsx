import { useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useSnackbar } from 'notistack'
import { ReactElement, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Dialog } from '@core/shared/ui/Dialog'

import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { useAdminJourneysQuery } from '../../../libs/useAdminJourneysQuery'
import {
  ARCHIVE_ACTIVE_JOURNEYS,
  TRASH_ACTIVE_JOURNEYS
} from '../../JourneyList/ActiveJourneyList/ActiveJourneyList'
import { JourneyListProps } from '../../JourneyList/JourneyList'
import { sortJourneys } from '../../JourneyList/JourneySort/utils/sortJourneys'
import { TemplateCard } from '../../TemplateCard'

export function ActiveTemplates({
  sortOrder,
  event
}: Omit<JourneyListProps, 'authUser'>): ReactElement {
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
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false)
  const [trashDialogOpen, setTrashDialogOpen] = useState(false)

  async function handleArchiveSubmit(): Promise<void> {
    try {
      await archive({
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

  async function handleTrashSubmit(): Promise<void> {
    try {
      await trash({
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
    <>
      <Box>
        {sortedJourneys != null ? (
          <>
            {sortedJourneys.map((journey) => (
              <TemplateCard
                key={journey.id}
                journey={journey}
                isPublisher
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
                  {t('No templates to display.')}
                </Typography>
              </Card>
            )}
          </>
        ) : (
          <>
            {[0, 1, 2].map((index) => (
              <TemplateCard key={`templateCard${index}`} isPublisher />
            ))}
          </>
        )}
      </Box>
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
      <Dialog
        open={archiveDialogOpen}
        onClose={handleClose}
        dialogTitle={{
          title: 'Archive Templates',
          closeButton: true
        }}
        dialogAction={{
          onSubmit: handleArchiveSubmit,
          submitLabel: 'Archive',
          closeLabel: 'Cancel'
        }}
      >
        <Typography>
          {t(
            'Are you sure you would like to archive all active templates immediately?'
          )}
        </Typography>
      </Dialog>
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
    </>
  )
}
