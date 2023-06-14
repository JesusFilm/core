import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { ReactElement } from 'react'
import { useJourney } from '../../../libs/JourneyProvider'
import { getJourneyRTL } from '../../../libs/rtl'

interface NameAndLocationProps {
  name: string
  location?: string
  src1?: string
  src2?: string
  admin: boolean
}

export const NameAndLocation = ({
  name,
  location = '',
  src1,
  src2,
  admin
}: NameAndLocationProps): ReactElement => {
  const { journey } = useJourney()
  const { rtl } = getJourneyRTL(journey)

  const maxWidthAmount = src1 != null || src2 != null ? '190px' : '150px'
  const maxWidthAmountDesktop = src1 != null || src2 != null ? '260px' : '220px'

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
