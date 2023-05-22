import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { ReactElement } from 'react'
import Stack from '@mui/material/Stack'

import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import { ClearAllButton } from './ClearAllButton'

interface Props {
  handleClose?: () => void
  handleChange?: (e) => void
  sortSetting: string
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
}: Props): ReactElement {
  return (
    <Box sx={{ height: '100vh' }}>
      <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
        <Stack direction="row" sx={{ px: 6, py: 5 }} alignItems="center">
          <Typography variant="subtitle1">
            Filters <ClearAllButton handleClearAll={handleClearAll} />
          </Typography>
          <IconButton sx={{ ml: 'auto' }}>
            <CloseRoundedIcon onClick={handleClose} />
          </IconButton>
        </Stack>
        <Divider />
      </Box>

      <Box sx={{ px: 6, py: 5 }}>
        <Typography variant="subtitle2">Categories</Typography>
        <FormGroup>
          <FormControlLabel
            control={<Checkbox />}
            label="Chat Started"
            value="Chat Started"
            onChange={handleChange}
            checked={chatStarted}
          />
          <FormControlLabel
            control={<Checkbox />}
            label="With Poll Answers"
            value="With Poll Answers"
            onChange={handleChange}
            checked={withPollAnswers}
          />
          <FormControlLabel
            control={<Checkbox />}
            label="With Submitted Text"
            value="With Submitted Text"
            onChange={handleChange}
            checked={withSubmittedText}
          />
          <FormControlLabel
            control={<Checkbox />}
            label="With Icon"
            value="With Icon"
            onChange={handleChange}
            checked={withIcon}
          />
          <FormControlLabel
            control={<Checkbox />}
            label="Hide Inactive"
            value="Hide Inactive"
            onChange={handleChange}
            checked={hideInteractive}
          />
        </FormGroup>
      </Box>

      <Divider />

      <Box sx={{ px: 6, py: 5 }}>
        <Typography variant="subtitle2">Sort By</Typography>
        <RadioGroup
          aria-labelledby="journeys-sort-radio-buttons-group"
          defaultValue="date"
          name="journeys-sort-radio-group"
        >
          <FormControlLabel
            value="date"
            control={<Radio />}
            label="Date"
            onChange={handleChange}
            checked={sortSetting === 'date'}
          />
          <FormControlLabel
            value="duration"
            control={<Radio />}
            label="Duration"
            onChange={handleChange}
            checked={sortSetting === 'duration'}
          />
        </RadioGroup>
      </Box>
    </Box>
  )
}
