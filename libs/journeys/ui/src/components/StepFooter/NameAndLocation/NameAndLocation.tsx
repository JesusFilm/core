import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { ReactElement } from 'react'
import { useJourney } from '../../../libs/JourneyProvider'
import { getJourneyRTL } from '../../../libs/rtl'

interface NameAndLocationProps {
  name: string
  location?: string
}

export const NameAndLocation = ({
  name,
  location = ''
}: NameAndLocationProps): ReactElement => {
  const { journey } = useJourney()
  const { rtl } = getJourneyRTL(journey)

  return (
    <Stack
      className="name-and-location"
      sx={{
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'none'
      }}
    >
      <Typography
        variant="body2"
        sx={{
          whiteSpace: 'nowrap',
          overflow: 'clip',
          textOverflow: 'ellipsis',
          color: { xs: 'primary.main', lg: 'white' },
          opacity: 0.7
        }}
      >
        {rtl
          ? `${location}${
              (location !== '' &&
                location.length > 0 &&
                '\u00A0\u00B7\u00A0') ||
              ''
            }${name}`
          : `${name}${
              (location !== '' &&
                location.length > 0 &&
                '\u00A0\u00B7\u00A0') ||
              ''
            }${location}`}
      </Typography>
    </Stack>
  )
}
