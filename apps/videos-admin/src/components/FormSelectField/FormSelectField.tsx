import MenuItem from '@mui/material/MenuItem'
import { ComponentProps, ReactElement } from 'react'

import { FormTextField } from '../FormTextField'

interface FormSelectFieldProps extends ComponentProps<typeof FormTextField> {
  options: Array<{ label: string; value: string }>
}

export function FormSelectField({
  options,
  ...rest
}: FormSelectFieldProps): ReactElement {
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
