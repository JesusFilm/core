import { FormControl, FormLabel, TextField, Typography } from '@mui/material'
import { ReactElement } from 'react'

import { Textarea } from '../../../../../../../components/Textarea'

interface UpdateableFieldProps {
  id: string
  label: string
  value: string
  handleUpdate: (input: { id: string; value: string }) => void
  fullWidth?: boolean
  disabled?: boolean
}

export function UpdateableField({
  label,
  id,
  value: initialValue,
  handleUpdate,
  disabled,
}: UpdateableFieldProps): ReactElement {
  const handleBlur = (e): void => {
    handleUpdate({ id, value: e.target.value })
  }

  return (
    <FormControl>
      <FormLabel id={label} htmlFor={label}>
        <Typography variant="body2" fontWeight={500}>
          {label}
        </Typography>
      </FormLabel>
        <TextField
          disabled={disabled}
          defaultValue={initialValue}
          onBlur={handleBlur}
          fullWidth
        />
    </FormControl>
  )
}
