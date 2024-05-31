import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import SvgIcon from '@mui/material/SvgIcon'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import Clock1 from '@core/shared/ui/icons/Clock1'
import EyeOpen from '@core/shared/ui/icons/EyeOpen'

interface DataPointProps {
  children: string | number
  Icon?: typeof SvgIcon
}

function DataPoint({ children, Icon }: DataPointProps): ReactElement {
  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{ alignItems: 'center', color: 'info.main' }}
    >
      {Icon != null && <Icon fontSize="small" />}
      <Typography sx={{ fontWeight: 800 }}>{children}</Typography>
    </Stack>
  )
}

interface StepBlockNodeAnalyticsProps {
  visitDuration?: string
  views?: number
  bouncePercentage?: number | null
}

export function StepBlockNodeAnalytics({
  visitDuration = '0:00',
  views = 0,
  bouncePercentage
}: StepBlockNodeAnalyticsProps): ReactElement {
  return (
    <>
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          gap: 6,
          position: 'absolute',
          top: 0,
          left: 0,
          transform: 'translateY(-100%)'
        }}
        data-testid="AnalyticsOverlay"
      >
        <DataPoint Icon={Clock1}>{visitDuration}</DataPoint>
        <DataPoint Icon={EyeOpen}>{views}</DataPoint>
      </Stack>
      {bouncePercentage != null && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            right: 32,
            transform: 'translateY(50%)',
            px: 1,
            borderRadius: 1,
            backgroundColor: '#ffcdcd',
            boxShadow: 1
          }}
        >
          <Typography variant="body2">{bouncePercentage}%</Typography>
        </Box>
      )}
    </>
  )
}
