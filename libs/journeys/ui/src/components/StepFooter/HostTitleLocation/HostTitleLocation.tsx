import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import { useJourney } from '../../../libs/JourneyProvider'
import { getJourneyRTL } from '../../../libs/rtl'

export function HostTitleLocation(): ReactElement {
  const { journey } = useJourney()
  const { rtl } = getJourneyRTL(journey)
  const host = journey?.host != null ? journey.host : undefined
  const divider =
    journey?.host?.location != null && journey?.host?.location !== ''
      ? '\u00A0\u00B7\u00A0'
      : ''

  // ----------- HERE: Host -----------
  return host != null ? (
    <Typography
      data-testid="StepFooterHostTitleLocation"
      variant="caption"
      sx={{
        whiteSpace: 'nowrap',
        overflow: 'clip',
        textOverflow: 'ellipsis',
        color: { xs: 'primary.main', lg: 'white' },
        opacity: 0.7
      }}
    >
      {rtl
        ? `${host.location ?? ''}${divider}${host.title}`
        : `${host.title}${divider}${host.location ?? ''}`}
    </Typography>
  ) : (
    <></>
  )
}
