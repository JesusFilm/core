import { CheckboxProps } from '@formium/react/dist/inputs'
import MuiCheckbox from '@mui/material/Checkbox'
import { ReactElement } from 'react'

export function Checkbox(props: CheckboxProps): ReactElement {
  return <MuiCheckbox {...props} />
}
