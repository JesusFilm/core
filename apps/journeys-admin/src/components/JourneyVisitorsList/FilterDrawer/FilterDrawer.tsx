import Box from '@mui/material/Box'
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
import { ReactElement } from 'react'

import X2Icon from '@core/shared/ui/icons/X2'

import { ClearAllButton } from './ClearAllButton'

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
}

export function FilterDrawer({
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
  return (
    <Box sx={{ height: '100vh' }} data-testid="FilterDrawer">
      <Box sx={{ display: { sm: 'block', md: 'none' } }}>
        <Stack direction="row" sx={{ px: 6, py: 2 }} alignItems="center">
          <Typography variant="subtitle1">
            {t('Filters')} <ClearAllButton handleClearAll={handleClearAll} />
          </Typography>
          <IconButton sx={{ ml: 'auto' }}>
            <X2Icon onClick={handleClose} />
          </IconButton>
        </Stack>
        <Divider />
      </Box>

      <Box sx={{ px: 6, py: 5 }}>
        <Typography variant="subtitle2">{t('Categories')}</Typography>
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
    </Box>
  )
}
