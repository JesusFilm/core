import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { ReactElement } from 'react'

interface NameAndLocationProps {
  name?: string
  location?: string
}

export const NameAndLocation = ({
  name,
  location
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
            // minHeight: name != null ? 'none' : '10px',
            whiteSpace: 'nowrap',
            maxWidth: '260px',
            overflow: 'clip',
            textOverflow: 'ellipsis',
            color: 'secondary.light'
          }}
        >
          {name != null && `${name} `}
          {location != null &&
            name != null &&
            location.toString().length > 0 &&
            `\u00A0\u00B7\u00A0 ${location}`}
        </Typography>
      </Box>
    </Stack>
  )
}
