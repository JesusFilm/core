import { RadioGroupProps } from '@formium/react/dist/inputs'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import Radio from '@mui/material/Radio'
import MuiRadioGroup from '@mui/material/RadioGroup'
import { ReactElement } from 'react'

export function RadioGroup({
  disabled,
  name,
  onChange,
  onBlur,
  options
}: RadioGroupProps): ReactElement {
  return (
    <FormControl disabled={disabled} sx={{ pt: 4 }}>
      <MuiRadioGroup name={name} onChange={onChange} onBlur={onBlur}>
        {options.map((option) => (
          <FormControlLabel
            key={option.id}
            {...option}
            control={<Radio color="secondary" />}
          />
        ))}
      </MuiRadioGroup>
    </FormControl>
  )
}
