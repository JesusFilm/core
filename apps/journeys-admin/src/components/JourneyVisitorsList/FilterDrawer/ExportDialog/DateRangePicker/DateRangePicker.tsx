import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { Locale } from 'date-fns'
import { i18n, useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import CalendarIcon from '@core/shared/ui/icons/Calendar1'
import ChevronDown from '@core/shared/ui/icons/ChevronDown'

import { getSupportedLocale } from '../../../../../../middleware'

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
  console.log(
    'Browser Language:',
    typeof window !== 'undefined' ? navigator.language : 'Server side'
  )
  // type LocaleKey = typeof locale
  // const localeTest = locale as unknown as LocaleKey
  return (
    <LocalizationProvider
      dateAdapter={AdapterDateFns}
      // adapterLocale={getSupportedLocale(locale)}
    >
      <Box sx={{ py: 2, pr: 2, width: '100%' }}>
        <Stack direction="row" spacing={2} alignItems="center">
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
              // format="dd-MM-yyyy"
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
      </Box>
    </LocalizationProvider>
  )
}
