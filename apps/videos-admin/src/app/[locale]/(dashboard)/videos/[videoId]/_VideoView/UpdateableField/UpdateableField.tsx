import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import { Textarea } from '../../../../../../../components/Textarea'

interface UpdateableFieldProps {
  id: string
  label: string
  value: string
  handleUpdate: (input: { id: string; value: string }) => void
  fullWidth?: boolean
  disabled?: boolean
  variant: 'textfield' | 'textarea'
  isEdit: boolean
}

export function UpdateableField({
  label,
  id,
  value: initialValue,
  handleUpdate,
  disabled,
  variant,
  isEdit
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
      {variant === 'textarea' && (
        <Textarea
          id={label}
          defaultValue={initialValue}
          // value={value}
          // onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlur}
          minRows={6}
          maxRows={6}
          sx={{ width: '100%' }}
        />
      )}
      {variant === 'textfield' && (
        <TextField
          disabled={disabled}
          defaultValue={initialValue}
          onBlur={handleBlur}
          fullWidth
          slotProps={{
            input: {
              readOnly: !isEdit
            }
          }}
        />
      )}
    </FormControl>
  )
}
