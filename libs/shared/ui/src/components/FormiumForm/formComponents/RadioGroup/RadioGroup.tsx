import { RadioGroupProps } from '@formium/react/dist/inputs'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import Radio from '@mui/material/Radio'
import MuiRadioGroup from '@mui/material/RadioGroup'
import { ReactElement } from 'react'

import CheckContainedIcon from '../../../icons/CheckContained'
import CircleIcon from '../../../icons/Circle'

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
                icon={<CircleIcon />}
                checkedIcon={<CheckContainedIcon />}
              />
            }
          />
        ))}
      </MuiRadioGroup>
    </FormControl>
  )
}
