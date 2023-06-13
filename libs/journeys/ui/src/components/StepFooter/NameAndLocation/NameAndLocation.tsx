import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { ReactElement } from 'react'

interface NameAndLocationProps {
  name: string
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
  const maxWidthAmountDesktop = src1 != null || src2 != null ? '260px' : '220px'
  const trimmedName = name.trim()
  const trimmedLocation = location?.trim()
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
          width: {
            xs: `calc(100vw - ${
              !admin && src1 == null && src2 == null ? '110px' : maxWidthAmount
            })`,
            lg: `calc(100vw - ${
              !admin && src1 == null && src2 == null
                ? '180px'
                : maxWidthAmountDesktop
            })`
          },
          overflow: 'clip',
          textOverflow: 'ellipsis',
          color: 'secondary.light'
        }}
      >
        {rtl
          ? `${trimmedLocation ?? ''}${
              (trimmedLocation != null &&
                trimmedLocation.length > 0 &&
                '\u00A0\u00B7\u00A0') ||
              ''
            }${trimmedName}`
          : `${trimmedName}${
              (trimmedLocation != null &&
                trimmedLocation.length > 0 &&
                '\u00A0\u00B7\u00A0') ||
              ''
            }${trimmedLocation ?? ''}`}
      </Typography>
    </Stack>
  )
}
