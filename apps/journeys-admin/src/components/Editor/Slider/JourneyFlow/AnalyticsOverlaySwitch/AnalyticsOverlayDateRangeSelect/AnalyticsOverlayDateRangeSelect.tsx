import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import {
  DateRangePresetId,
  dateRangePresetLabels
} from '../buildPresetDateRange'

const dateRangePresetGroups: DateRangePresetId[][] = [
  ['today', 'yesterday'],
  ['last7Days', 'last30Days'],
  ['monthToDate', 'lastMonth'],
  ['yearToDate', 'last12Months'],
  ['allTime', 'customRange']
]

interface AnalyticsOverlayDateRangeSelectProps {
  value: DateRangePresetId
  onChange: (preset: DateRangePresetId) => void
}

export function AnalyticsOverlayDateRangeSelect({
  value,
  onChange
}: AnalyticsOverlayDateRangeSelectProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Select<DateRangePresetId>
      value={value}
      onChange={(event) => onChange(event.target.value as DateRangePresetId)}
      variant="outlined"
      size="small"
      sx={{
        minWidth: 160,
        '& .MuiSelect-select': {
          py: 1,
          display: 'inline-block',
          maxWidth: 200,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }
      }}
      aria-label={t('Date range preset')}
      MenuProps={{
        anchorOrigin: {
          vertical: 'bottom',
          horizontal: 'left'
        },
        transformOrigin: {
          vertical: 'top',
          horizontal: 'left'
        },
        MenuListProps: { dense: true }
      }}
    >
      {dateRangePresetGroups.flatMap((group, groupIndex) => [
        ...(groupIndex > 0 ? [<Divider key={`divider-${groupIndex}`} />] : []),
        ...group.map((preset) => (
          <MenuItem key={preset} value={preset}>
            <Typography>{t(dateRangePresetLabels[preset])}</Typography>
          </MenuItem>
        ))
      ])}
    </Select>
  )
}
