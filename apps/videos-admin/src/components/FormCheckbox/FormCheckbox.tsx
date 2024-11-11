import Checkbox from '@mui/material/Checkbox'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormHelperText from '@mui/material/FormHelperText'
import { useField } from 'formik'
import { ReactElement } from 'react'

interface FormCheckboxProps {
  name: string
  label: string
  helperText?: string
}

export function FormCheckbox({
  name,
  label,
  helperText = ''
}: FormCheckboxProps): ReactElement {
  const [{ checked, ...formikProps }, meta] = useField(name)

  const hasError = meta.error !== undefined && meta.touched

  return (
    <FormControl>
      <FormControlLabel
        label={label}
        control={<Checkbox {...formikProps} checked={checked} />}
        sx={{ width: 'fit-content' }}
      />
      <FormHelperText error={hasError}>
        {hasError ? meta.error : helperText}
      </FormHelperText>
    </FormControl>
  )
}
