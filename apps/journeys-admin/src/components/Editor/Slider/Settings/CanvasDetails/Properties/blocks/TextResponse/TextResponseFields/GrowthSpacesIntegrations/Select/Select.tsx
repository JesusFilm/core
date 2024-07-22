import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import MuiSelect, { SelectChangeEvent } from '@mui/material/Select'
import { ReactElement } from 'react'

interface SelectProps {
  label: string
  value?: string
  options?: string[]
  onChange: (event: SelectChangeEvent) => void
}

export function Select({
  label,
  value,
  options,
  onChange
}: SelectProps): ReactElement {
  return (
    <Box>
      <FormControl fullWidth>
        <InputLabel>{label}</InputLabel>
        <MuiSelect label={label} value={value} onChange={onChange}>
          {options?.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </MuiSelect>
      </FormControl>
    </Box>
  )
}
