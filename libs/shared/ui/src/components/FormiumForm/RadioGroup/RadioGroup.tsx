import { RadioGroupProps } from '@formium/react/dist/inputs'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormLabel from '@mui/material/FormLabel'
import Radio from '@mui/material/Radio'
import MuiRadioGroup from '@mui/material/RadioGroup'
import { ReactElement } from 'react'

export function RadioGroup({
  disabled,
  id,
  name,
  onChange,
  onBlur,
  options
}: RadioGroupProps): ReactElement {
  return (
    <FormControl disabled={disabled}>
      <FormLabel id={id}>{name}</FormLabel>
      <MuiRadioGroup name={name} onChange={onChange} onBlur={onBlur}>
        {options.map((option) => (
          <FormControlLabel {...option} control={<Radio />} />
        ))}
      </MuiRadioGroup>
    </FormControl>
  )
}
