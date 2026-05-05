import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import CalendarIcon from '@core/shared/ui/icons/Calendar1'
import ChevronDown from '@core/shared/ui/icons/ChevronDown'

interface DateRangePickerProps {
  startDate: Date | null
  endDate: Date | null
  onStartDateChange: (date: Date | null) => void
  onEndDateChange: (date: Date | null) => void
  /** Minimum selectable date (dates before this are disabled). */
  minDate?: Date | null
  /** Maximum selectable date (dates after this are disabled). */
  maxDate?: Date | null
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  minDate = null,
  maxDate = null
}: DateRangePickerProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ py: 2, pr: 2, width: '100%' }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', sm: 'center' }}
        >
          <CalendarIcon
            sx={{
              color: 'text.secondary',
              display: { xs: 'none', md: 'block' }
            }}
          />
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ flex: 1 }}
          >
            <DatePicker
              label={t('From')}
              value={startDate}
              onChange={onStartDateChange}
              format="dd-MM-yyyy"
              minDate={minDate ?? undefined}
              maxDate={maxDate ?? undefined}
              slots={{
                openPickerIcon: ChevronDown
              }}
              slotProps={{
                textField: {
                  fullWidth: true
                }
              }}
            />
            <DatePicker
              label={t('To')}
              value={endDate}
              onChange={onEndDateChange}
              format="dd-MM-yyyy"
              minDate={minDate ?? undefined}
              maxDate={maxDate ?? undefined}
              slots={{
                openPickerIcon: ChevronDown
              }}
              slotProps={{
                textField: {
                  fullWidth: true
                }
              }}
            />
          </Stack>
        </Stack>
      </Box>
    </LocalizationProvider>
  )
}
