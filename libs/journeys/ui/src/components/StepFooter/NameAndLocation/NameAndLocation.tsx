import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { ReactElement } from 'react'

interface NameAndLocationProps {
  name?: string
  location?: string
  rtl: boolean
}

export const NameAndLocation = ({
  name,
  location,
  rtl
}: NameAndLocationProps): ReactElement => {
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
          variant="body2"
          sx={{
            whiteSpace: 'nowrap',
            maxWidth: { xs: '260px', lg: '100%' },
            overflow: 'clip',
            textOverflow: 'ellipsis',
            color: 'secondary.light'
          }}
        >
          {!rtl && name != null && `${name} `}
          {!rtl &&
            location != null &&
            name != null &&
            location.toString().length > 0 &&
            `\u00A0\u00B7\u00A0 ${location}`}
          {rtl &&
            location != null &&
            name != null &&
            location.toString().length > 0 &&
            `${location} \u00A0\u00B7\u00A0 `}
          {rtl && name != null && ` ${name}`}
        </Typography>
      </Box>
    </Stack>
  )
}
