import { CheckboxProps } from '@formium/react/dist/inputs'
import MuiCheckbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import { ReactElement } from 'react'

export function Checkbox(props: CheckboxProps): ReactElement {
  return (
    <FormControlLabel
      control={<MuiCheckbox {...props} />}
      label={props.label}
    />
  )
}
