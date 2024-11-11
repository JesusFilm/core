import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import FormLabel from '@mui/material/FormLabel'
import { useField } from 'formik'
import { ReactElement } from 'react'

import { Textarea } from '../Textarea'

interface FormTextAreaProps {
  name: string
  label: string
  helperText?: string
  minRows?: number
  maxRows?: number
}

export function FormTextArea({
  name,
  label,
  helperText = '',
  minRows = 6,
  maxRows = 6
}: FormTextAreaProps): ReactElement {
  const [formikProps, meta] = useField(name)

  const hasError = meta.error !== undefined && meta.touched

  return (
    <FormControl sx={{ width: '100%' }}>
      <FormLabel htmlFor={name}>{label}</FormLabel>
      <Textarea
        {...formikProps}
        id={name}
        minRows={minRows}
        maxRows={maxRows}
        sx={{ minWidth: '100%', maxWidth: '100%' }}
      />
      <FormHelperText error={hasError}>
        {hasError ? meta.error : helperText}
      </FormHelperText>
    </FormControl>
  )
}
