import { RadioGroupProps } from '@formium/react/dist/inputs'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
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
    <FormControl disabled={disabled}>
      <MuiRadioGroup name={name} onChange={onChange} onBlur={onBlur}>
        {options.map((option) => (
          <FormControlLabel
            key={option.id}
            {...option}
            control={
              <Radio
                color="secondary"
                icon={<RadioButtonUncheckedIcon />}
                checkedIcon={<CheckCircleIcon />}
              />
            }
          />
        ))}
      </MuiRadioGroup>
    </FormControl>
  )
}
