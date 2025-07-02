import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import InputAdornment from '@mui/material/InputAdornment'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, ReactNode } from 'react'

import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'

interface FontSelectProps {
  label: string
  value: string
  options: string[]
  onChange: (font: string) => void
  icon: ReactNode
  labelId: string
  selectId: string
  helperText?: string
}

export function FontSelect({
  label,
  value,
  options,
  onChange,
  icon,
  labelId,
  selectId,
  helperText
}: FontSelectProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Stack spacing={1}>
      <FormControl variant="filled">
        <InputLabel id={labelId}>{label}</InputLabel>
        <Select
          labelId={labelId}
          id={selectId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          displayEmpty
          IconComponent={ChevronDownIcon}
          startAdornment={
            <InputAdornment position="start">{icon}</InputAdornment>
          }
          renderValue={(value) => {
            if (value === '') {
              return <Typography>{t('None')}</Typography>
            }
            return value
          }}
        >
          {options.map((font) => (
            <MenuItem key={font} value={font} tabIndex={0} aria-label={font}>
              {font}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>{helperText}</FormHelperText>
      </FormControl>
    </Stack>
  )
}
