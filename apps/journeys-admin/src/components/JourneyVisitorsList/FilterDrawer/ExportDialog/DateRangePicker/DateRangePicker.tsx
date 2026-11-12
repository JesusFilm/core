import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { FieldRef } from '@mui/x-date-pickers/models'
import { isValid } from 'date-fns'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useCallback, useEffect, useRef } from 'react'

import CalendarIcon from '@core/shared/ui/icons/Calendar1'
import ChevronDown from '@core/shared/ui/icons/ChevronDown'

interface DateRangePickerProps {
  startDate: Date | null
  endDate: Date | null
  onStartDateChange: (date: Date | null) => void
  onEndDateChange: (date: Date | null) => void
  /** Reports edits before MUI can publish a complete date value. */
  onInputStateChange?: (state: {
    hasInput: boolean
    isIncomplete: boolean
  }) => void
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
  onInputStateChange,
  minDate = null,
  maxDate = null
}: DateRangePickerProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const startFieldRef = useRef<FieldRef<Date | null>>(null)
  const endFieldRef = useRef<FieldRef<Date | null>>(null)
  const reportInputState = useCallback(() => {
    if (onInputStateChange == null) return
    const fields = [startFieldRef.current, endFieldRef.current].map(
      (field) => field?.getSections() ?? []
    )
    onInputStateChange({
      hasInput: fields.some((sections) =>
        sections.some((section) => section.value !== '')
      ),
      isIncomplete: fields.some(
        (sections) =>
          sections.some((section) => section.value !== '') &&
          sections.some((section) => section.value === '')
      )
    })
  }, [onInputStateChange])
  const handleFieldInput = (): void => {
    // Read MUI's public section API after its event update has committed.
    queueMicrotask(reportInputState)
  }
  useEffect(reportInputState, [reportInputState, startDate, endDate])
  const minEndDate =
    startDate != null &&
    isValid(startDate) &&
    (minDate == null || startDate > minDate)
      ? startDate
      : minDate
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box
        sx={{ py: 2, pr: 2, width: '100%' }}
        onInput={handleFieldInput}
        onKeyUp={handleFieldInput}
        onPaste={handleFieldInput}
        onBlur={handleFieldInput}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{
            alignItems: { xs: 'stretch', sm: 'center' }
          }}
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
                field: { fieldRef: startFieldRef },
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
              minDate={minEndDate ?? undefined}
              maxDate={maxDate ?? undefined}
              slots={{
                openPickerIcon: ChevronDown
              }}
              slotProps={{
                field: { fieldRef: endFieldRef },
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
