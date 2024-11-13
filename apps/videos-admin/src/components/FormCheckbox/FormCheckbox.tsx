import Checkbox from '@mui/material/Checkbox'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import { useField } from 'formik'
import { ReactElement } from 'react'

interface FormCheckboxProps {
  name: string
  label: string
}

export function FormCheckbox({ name, label }: FormCheckboxProps): ReactElement {
  const [{ value, ...formikProps }, meta] = useField(name)

  const hasError = meta.error !== undefined && meta.touched

  return (
    <FormControl error={hasError}>
      <FormControlLabel
        label={label}
        control={<Checkbox {...formikProps} checked={value} />}
        sx={{ width: 'fit-content' }}
      />
    </FormControl>
  )
}
