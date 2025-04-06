import { gql, useLazyQuery, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import IconButton from '@mui/material/IconButton'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'

import X2Icon from '@core/shared/ui/icons/X2'

import { GetJourneyEventsVariables } from '../../../../__generated__/GetJourneyEvents'
import { useJourneyEventsExport } from '../../../libs/useJourneyEventsExport'

import { ClearAllButton } from './ClearAllButton'
import { ExportDialog } from './ExportDialog'

interface FilterDrawerProps {
  handleClose?: () => void
  handleChange?: (e) => void
  sortSetting?: 'date' | 'duration'
  chatStarted: boolean
  withPollAnswers: boolean
  withSubmittedText: boolean
  withIcon: boolean
  hideInteractive: boolean
  handleClearAll?: () => void
  journeyId?: string
}

export function FilterDrawer({
  journeyId,
  handleClose,
  handleChange,
  sortSetting,
  chatStarted,
  withPollAnswers,
  withSubmittedText,
  withIcon,
  hideInteractive,
  handleClearAll
}: FilterDrawerProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const { exportJourneyEvents } = useJourneyEventsExport()
  const [showExportDialog, setShowExportDialog] = useState(false)
  const handleExport = async (
    input: Pick<GetJourneyEventsVariables, 'journeyId' | 'filter'>
  ): Promise<void> => {
    try {
      await exportJourneyEvents(input)
    } catch (error) {
      enqueueSnackbar(error.message, {
        variant: 'error'
      })
    }
  }

  return (
    <Stack sx={{ height: '100vh' }} data-testid="FilterDrawer">
      <Box sx={{ display: { sm: 'block', md: 'none' } }}>
        <Stack direction="row" sx={{ px: 6, py: 2 }} alignItems="center">
          <Typography variant="subtitle1">{t('Refine Results')}</Typography>
          <IconButton sx={{ ml: 'auto' }}>
            <X2Icon onClick={handleClose} />
          </IconButton>
        </Stack>
        <Divider />
      </Box>

      <Box sx={{ px: 6, py: 5 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="subtitle2">{t('Filter By')}</Typography>
          <ClearAllButton handleClearAll={handleClearAll} />
        </Stack>
        <FormGroup>
          <FormControlLabel
            control={<Checkbox />}
            label={t('Chat Started')}
            value="Chat Started"
            onChange={handleChange}
            checked={chatStarted}
          />
          <FormControlLabel
            control={<Checkbox />}
            label={t('With Poll Answers')}
            value="With Poll Answers"
            onChange={handleChange}
            checked={withPollAnswers}
          />
          <FormControlLabel
            control={<Checkbox />}
            label={t('With Submitted Text')}
            value="With Submitted Text"
            onChange={handleChange}
            checked={withSubmittedText}
          />
          <FormControlLabel
            control={<Checkbox />}
            label={t('With Icon')}
            value="With Icon"
            onChange={handleChange}
            checked={withIcon}
          />
          <FormControlLabel
            control={<Checkbox />}
            label={t('Hide Inactive')}
            value="Hide Inactive"
            onChange={handleChange}
            checked={hideInteractive}
          />
        </FormGroup>
      </Box>

      <Divider />

      <Box sx={{ px: 6, py: 5 }}>
        <Typography variant="subtitle2">{t('Sort By')}</Typography>
        <RadioGroup
          aria-labelledby="journeys-sort-radio-buttons-group"
          defaultValue="date"
          name="journeys-sort-radio-group"
        >
          <FormControlLabel
            value="date"
            control={<Radio />}
            label={t('Date')}
            onChange={handleChange}
            checked={sortSetting === 'date'}
          />
          <FormControlLabel
            value="duration"
            control={<Radio />}
            label={t('Duration')}
            onChange={handleChange}
            checked={sortSetting === 'duration'}
          />
        </RadioGroup>
      </Box>

      {journeyId != null && (
        <>
          <Box sx={{ px: 6, py: 5, mt: 'auto' }}>
            <Button
              variant="contained"
              color="primary"
              sx={{ width: '100%' }}
              onClick={() => setShowExportDialog(true)}
            >
              {t('Export data')}
            </Button>
          </Box>
          <ExportDialog
            open={showExportDialog}
            onClose={() => setShowExportDialog(false)}
            onExport={() => handleExport({ journeyId })}
          />
        </>
      )}
    </Stack>
  )
}
