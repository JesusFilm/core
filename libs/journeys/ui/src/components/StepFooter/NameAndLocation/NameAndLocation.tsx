import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { ReactElement } from 'react'
// import { useJourney } from '../../../libs/JourneyProvider'
// import { getJourneyRTL } from '../../../libs/rtl'

export const NameAndLocation = (): ReactElement => {
  //   const { journey } = useJourney()
  //   const nameToFetch = journey.hostId

  const name = 'Alexander & Eliza Hamilton'
  const location = 'New York Harbour'
  return (
    <Stack
      className="name-and-location"
      sx={{
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'none'
      }}
    >
      <Box>
        <Typography
          className="writing"
          variant="body2"
          sx={{
            whiteSpace: 'nowrap',
            maxWidth: '250px',
            overflow: 'clip',
            textOverflow: 'ellipsis',
            color: 'secondary.light'
          }}
        >
          {`${name} `}{' '}
          {location != null &&
            location.toString().length > 0 &&
            `• ${location}`}
        </Typography>
      </Box>
    </Stack>
  )
}
