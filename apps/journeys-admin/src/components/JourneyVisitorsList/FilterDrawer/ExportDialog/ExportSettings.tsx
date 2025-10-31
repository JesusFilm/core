import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import ChevronDown from '@core/shared/ui/icons/ChevronDown'

import { ContactDataForm } from './ContactDataForm'
import { DateRangePicker } from './DateRangePicker'
import { FilterForm } from './FilterForm'

interface ExportSettingsProps {
  startDate: Date | null
  endDate: Date | null
  onStartDateChange: (date: Date | null) => void
  onEndDateChange: (date: Date | null) => void
  exportBy: string
  onExportByChange: (value: string) => void
  setSelectedEvents: (events: string[]) => void
  contactData: string[]
  setContactData: (fields: string[]) => void
}

export function ExportSettings({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  exportBy,
  onExportByChange,
  setSelectedEvents,
  contactData,
  setContactData
}: ExportSettingsProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <>
      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={onStartDateChange}
        onEndDateChange={onEndDateChange}
      />
      <Box
        sx={{
          pt: 4,
          pr: 2,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 2
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ whiteSpace: 'nowrap', minWidth: 'fit-content' }}
        >
          {t('Export By:')}
        </Typography>
        <FormControl fullWidth>
          <Select
            value={exportBy}
            onChange={(e) => onExportByChange(e.target.value)}
            displayEmpty
            inputProps={{ 'aria-label': t('Export By:') }}
            IconComponent={ChevronDown}
            renderValue={(selected) => {
              if (!selected) {
                return t('Select Data')
              }
              return selected
            }}
          >
            <MenuItem value="" disabled hidden>
              {t('Select Data')}
            </MenuItem>
            <MenuItem value="Visitor Actions">{t('Visitor Actions')}</MenuItem>
            <MenuItem value="Contact Data">{t('Contact Data')}</MenuItem>
          </Select>
        </FormControl>
      </Box>
      {exportBy === 'Visitor Actions' && (
        <Box sx={{ pt: 4 }}>
          <Typography variant="subtitle2" gutterBottom>
            {t('Select visitor actions:')}
          </Typography>
          <FilterForm setSelectedEvents={setSelectedEvents} />
        </Box>
      )}
      {exportBy === 'Contact Data' && (
        <Box sx={{ pt: 4 }}>
          <Typography variant="subtitle2" gutterBottom>
            {t('Select contact data:')}
          </Typography>
          <ContactDataForm
            setSelectedFields={setContactData}
            selectedFields={contactData}
          />
        </Box>
      )}
    </>
  )
}
