import Stack from '@mui/material/Stack'
import SvgIcon from '@mui/material/SvgIcon'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

interface StatsOverlayDataPointProps {
  children: string | number
  Icon?: typeof SvgIcon
  tooltipLabel: string
}

export function AnalyticsDataPoint({
  children,
  Icon,
  tooltipLabel = ''
}: StatsOverlayDataPointProps): ReactElement {
  return (
    <Tooltip
      title={tooltipLabel}
      placement="top"
      slotProps={{
        popper: {
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, -8]
              }
            }
          ]
        }
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{
          px: 3,
          py: 2,
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1
        }}
        className="stats-overlay__data-point"
        data-testid="StatsOverlayDataPoint"
      >
        {Icon != null && <Icon sx={{ fontSize: '16px' }} />}
        <Typography variant="caption" sx={{ fontWeight: 800 }}>
          {children}
        </Typography>
      </Stack>
    </Tooltip>
  )
}
