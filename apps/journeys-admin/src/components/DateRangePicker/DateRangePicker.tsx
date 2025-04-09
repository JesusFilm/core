import Stack from '@mui/material/Stack'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import CalendarIcon from '@core/shared/ui/icons/Calendar1'
import ChevronDown from '@core/shared/ui/icons/ChevronDown'

export interface DateRangePickerProps {
  startDate: Date | null
  endDate: Date | null
  onStartDateChange: (date: Date | null) => void
  onEndDateChange: (date: Date | null) => void
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange
}: DateRangePickerProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        sx={{ width: '100%' }}
      >
        <CalendarIcon sx={{ color: 'text.secondary' }} />
        <Stack
          direction="row"
          spacing={2}
          sx={{ flex: 1, '& > *': { flex: 1 } }}
        >
          <DatePicker
            label={t('From')}
            value={startDate}
            onChange={onStartDateChange}
            format="dd-MM-yyyy"
            slots={{
              openPickerIcon: ChevronDown
            }}
            slotProps={{
              textField: {
                size: 'small',
                fullWidth: true
              }
            }}
          />
          <DatePicker
            label={t('To')}
            value={endDate}
            onChange={onEndDateChange}
            format="dd-MM-yyyy"
            slots={{
              openPickerIcon: ChevronDown
            }}
            slotProps={{
              textField: {
                size: 'small',
                fullWidth: true
              }
            }}
          />
        </Stack>
      </Stack>
    </LocalizationProvider>
  )
}
