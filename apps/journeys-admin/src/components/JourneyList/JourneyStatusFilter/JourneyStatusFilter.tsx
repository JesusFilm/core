import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import type { JourneyStatus } from '../JourneyListView/JourneyListView'

interface JourneyStatusFilterProps {
  status?: JourneyStatus
  onChange: (value: JourneyStatus) => void
  disabled?: boolean
}

interface StatusOption {
  queryParam: JourneyStatus
  displayValue: string
}

export function JourneyStatusFilter({
  status,
  onChange: handleChange,
  disabled
}: JourneyStatusFilterProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  // Status filter options (Active, Archived, Trashed)
  const statusOptions: StatusOption[] = [
    {
      queryParam: 'active',
      displayValue: t('Active')
    },
    {
      queryParam: 'archived',
      displayValue: t('Archived')
    },
    {
      queryParam: 'trashed',
      displayValue: t('Trash')
    }
  ]

  const handleStatusChange = (
    event: SelectChangeEvent<JourneyStatus>
  ): void => {
    handleChange(event.target.value as JourneyStatus)
  }

  return (
    <FormControl size="small">
      <Select
        id="status-filter-select"
        value={status ?? 'active'}
        onChange={handleStatusChange}
        inputProps={{ 'aria-label': t('Filter by status') }}
        IconComponent={KeyboardArrowDown}
        autoWidth
        disabled={disabled != null && disabled}
        sx={{
          borderRadius: '8px',
          height: 'auto',
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 600,
          fontSize: '13px',
          color: (theme) => theme.palette.secondary.main,
          '& .MuiOutlinedInput-root': {
            height: '32px'
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderWidth: '2px',
            borderColor: (theme) => theme.palette.secondary.light
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderWidth: '2px'
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderWidth: '2px',
            borderColor: (theme) => theme.palette.secondary.main
          },
          '& .MuiOutlinedInput-input': {
            padding: '0 !important',
            height: '32px',
            boxSizing: 'border-box'
          },
          '& .MuiSelect-select': {
            display: 'flex',
            alignItems: 'center',
            paddingTop: '8px !important',
            paddingBottom: '8px !important',
            paddingLeft: '14px !important',
            paddingRight: '28px !important'
          },
          '& .MuiSelect-icon': {
            fontSize: '1rem'
          }
        }}
      >
        {statusOptions.map((statusOption) => (
          <MenuItem
            key={statusOption.queryParam}
            value={statusOption.queryParam}
          >
            {statusOption.displayValue}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
