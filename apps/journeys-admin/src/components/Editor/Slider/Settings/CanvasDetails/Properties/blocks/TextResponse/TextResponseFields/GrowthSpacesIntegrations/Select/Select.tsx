import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import MuiSelect, { SelectChangeEvent } from '@mui/material/Select'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

interface SelectProps {
  label: string
  value?: string
  options?: Array<{ value: string; label: string }>
  onChange: (value: string | null) => void
}

export function Select({
  label,
  value,
  options,
  onChange
}: SelectProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  function handleChange(event: SelectChangeEvent): void {
    onChange(event.target.value === '' ? null : event.target.value)
  }
  return (
    <Box>
      <FormControl fullWidth>
        <InputLabel>{label}</InputLabel>
        <MuiSelect label={label} value={value ?? ''} onChange={handleChange}>
          <MenuItem value="">{t('None')}</MenuItem>
          {options?.map(({ value, label }) => {
            return (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            )
          })}
        </MuiSelect>
      </FormControl>
    </Box>
  )
}
