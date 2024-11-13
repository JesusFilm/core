import MenuItem from '@mui/material/MenuItem'
import { ComponentProps, ReactElement } from 'react'

import { FormTextField } from '../FormTextField'

interface FormSelectProps extends ComponentProps<typeof FormTextField> {
  options: Array<{ label: string; value: string }>
}

export function FormSelect({
  options,
  ...rest
}: FormSelectProps): ReactElement {
  return (
    <FormTextField select {...rest}>
      {options.map(({ label, value }) => (
        <MenuItem key={label} value={value}>
          {label}
        </MenuItem>
      ))}
    </FormTextField>
  )
}
