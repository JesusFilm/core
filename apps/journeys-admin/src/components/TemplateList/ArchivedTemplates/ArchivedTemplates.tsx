import { ReactElement, useState, useEffect } from 'react'
import { useMutation } from '@apollo/client'
import { useSnackbar } from 'notistack'
import { useTranslation } from 'react-i18next'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Dialog } from '@core/shared/ui/Dialog'
import { sortJourneys } from '../../JourneyList/JourneySort/utils/sortJourneys'
import {
  RESTORE_ARCHIVED_JOURNEYS,
  TRASH_ARCHIVED_JOURNEYS
} from '../../JourneyList/ArchivedJourneyList/ArchivedJourneyList'
import { TemplateCard } from '../../TemplateCard'
import { useAdminJourneysQuery } from '../../../libs/useAdminJourneysQuery'
import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { JourneyListProps } from '../../JourneyList/JourneyList'

export function ArchivedTemplates({
  sortOrder,
  event
}: JourneyListProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const { data, refetch } = useAdminJourneysQuery({
    status: [JourneyStatus.archived],
    template: true
  })
  const [restore] = useMutation(RESTORE_ARCHIVED_JOURNEYS, {
    update(_cache, { data }) {
      if (data?.journeysRestore != null) {
        enqueueSnackbar(t('Journeys Restored'), {
          variant: 'success'
        })
        void refetch()
      }
    }
  })
  const [trash] = useMutation(TRASH_ARCHIVED_JOURNEYS, {
    update(_cache, { data }) {
      if (data?.journeysTrash != null) {
        enqueueSnackbar(t('Journeys Trashed'), {
          variant: 'success'
        })
        void refetch()
      }
    }
  })
  const [openRestoreDialog, setOpenRestoreDialog] = useState(false)
  const [openTrashDialog, setOpenTrashDialog] = useState(false)

  async function handleRestoreSubmit(): Promise<void> {
    try {
      await restore({
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
    setOpenRestoreDialog(false)
    setOpenTrashDialog(false)
  }

  useEffect(() => {
    switch (event) {
      case 'restoreAllArchived':
        setOpenRestoreDialog(true)
        break
      case 'trashAllArchived':
        setOpenTrashDialog(true)
        break
      case 'refetchArchived':
        void refetch()
        break
    }
  }, [event, refetch])

  const sortedJourneys =
    data?.journeys != null ? sortJourneys(data?.journeys, sortOrder) : undefined

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
            {sortedJourneys.length > 0 ? (
              <span>
                <Box width="100%" sx={{ textAlign: 'center' }}>
                  <Typography variant="caption">
                    {t(
                      'Archived templates are delisted from the Template Library.'
                    )}
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
                    {t('No archived templates.')}
                  </Typography>
                </Card>
              </>
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
        open={openRestoreDialog}
        onClose={handleClose}
        dialogTitle={{
          title: t('Unarchive Templates'),
          closeButton: true
        }}
        dialogAction={{
          onSubmit: handleRestoreSubmit,
          submitLabel: t('Unarchive'),
          closeLabel: t('Cancel')
        }}
      >
        <Typography>
          {t(
            'Are you sure you would like to unarchive all archived templates immediately?'
          )}
        </Typography>
      </Dialog>
      <Dialog
        open={openTrashDialog}
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
            'Are you sure you would like to trash all archived templates immediately?'
          )}
        </Typography>
      </Dialog>
    </>
  )
}
