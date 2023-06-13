import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { ReactElement } from 'react'

interface NameAndLocationProps {
  name?: string
  location?: string
  rtl: boolean
  src1?: string
  src2?: string
  admin: boolean
}

export const NameAndLocation = ({
  name,
  location,
  rtl,
  src1,
  src2,
  admin
}: NameAndLocationProps): ReactElement => {
  const maxWidthAmount = src1 != null || src2 != null ? '190px' : '150px'
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
            width: `calc(100vw - ${
              !admin && src1 == null && src2 == null ? '110px' : maxWidthAmount
            })`,
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
