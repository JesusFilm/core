import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { ReactElement } from 'react'
import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'

export function FilterDrawer(): ReactElement {
  const locationOptions = [
    'Dnipro, Ukraine',
    'Halifax, Canada',
    'Auckland, New Zealand'
  ]

  const sourceOptions = ['Facebook', 'Youtube', 'whatsApp']

  return (
    <>
      <Box sx={{ px: 6, py: 5 }}>
        <Autocomplete
          disablePortal
          id="location-autocomplete"
          options={locationOptions}
          sx={{ width: '100%', mb: 5 }}
          renderInput={(params) => (
            <TextField
              {...params}
              aria-label="location"
              variant="filled"
              label="Location"
            />
          )}
        />
        <Autocomplete
          disablePortal
          id="source-autocomplete"
          options={sourceOptions}
          sx={{ width: '100%' }}
          renderInput={(params) => (
            <TextField
              {...params}
              aria-label="source"
              variant="filled"
              label="Source"
            />
          )}
        />
      </Box>

      <Divider />

      <Box sx={{ px: 6, py: 5 }}>
        <Typography variant="subtitle2">Categories</Typography>
        <FormGroup>
          <FormControlLabel control={<Checkbox />} label="Chat Started" />
          <FormControlLabel control={<Checkbox />} label="With Poll Answers" />
          <FormControlLabel
            control={<Checkbox />}
            label="With Submitted Text"
          />
          <FormControlLabel control={<Checkbox />} label="With Icon" />
          <FormControlLabel control={<Checkbox />} label="Hide Inactive" />
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
          <FormControlLabel value="date" control={<Radio />} label="Date" />
          <FormControlLabel
            value="duration"
            control={<Radio />}
            label="Duration"
          />
        </RadioGroup>
      </Box>
    </>
  )
}
