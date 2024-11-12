import Box from '@mui/material/Box'
import FormLabel from '@mui/material/FormLabel'
import { Theme } from '@mui/material/styles'
import { TextareaAutosizeProps } from '@mui/material/TextareaAutosize'
import TextField, { TextFieldProps } from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { MUIStyledCommonProps } from '@mui/system/createStyled'
import { ReactElement } from 'react'

import { Textarea } from '../../../../../../../components/Textarea'

interface UpdateableFieldProps {
  id: string
  label?: string
  value: string
  handleUpdate: (input: { id: string; value: string }) => void
  variant: 'textfield' | 'textarea'
  isEdit: boolean
  textAreaProps?: MUIStyledCommonProps<Theme> & TextareaAutosizeProps
  textFieldProps?: TextFieldProps
}

export function UpdateableField({
  label,
  id,
  value: initialValue,
  handleUpdate,
  variant,
  isEdit,
  textAreaProps,
  textFieldProps
}: UpdateableFieldProps): ReactElement {
  function handleBlur(value: string): void {
    handleUpdate({ id, value })
  }

  return (
    <Box>
      <FormLabel id={label} htmlFor={label}>
        <Typography variant="body2" fontWeight={500}>
          {label}
        </Typography>
      </FormLabel>
      {variant === 'textarea' && (
        <Textarea
          id={label}
          defaultValue={initialValue}
          onBlur={(e) => handleBlur(e.target.value)}
          minRows={6}
          maxRows={6}
          disabled={!isEdit}
          {...textAreaProps}
        />
      )}
      {variant === 'textfield' && (
        <TextField
          disabled={!isEdit}
          defaultValue={initialValue}
          onBlur={(e) => handleBlur(e.target.value)}
          {...textFieldProps}
        />
      )}
    </Box>
  )
}
