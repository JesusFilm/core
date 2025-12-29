import Box from '@mui/material/Box'
import { SxProps } from '@mui/material/styles'
import { ReactElement } from 'react'

import ChevronDown from '@core/shared/ui/icons/ChevronDown'
import { FacebookIcon } from '@core/shared/ui/icons/FacebookIcon'
import LinkAngled from '@core/shared/ui/icons/LinkAngled'

import { ReferrerValue } from '../ReferrerValue'

const iconStyles = { fontSize: '18px' }

interface BaseReferrerProps {
  property: string
  visitors: number | null
  style?: SxProps
}

export function BaseReferrer({
  property,
  visitors,
  style
}: BaseReferrerProps): ReactElement {
  let Icon

  switch (property) {
    case 'Facebook':
      Icon = <FacebookIcon />
      break
    case 'Direct / None':
      Icon = <LinkAngled sx={iconStyles} />
      break
    case 'other sources':
      Icon = <ChevronDown sx={iconStyles} />
      break
    default:
      Icon = <LinkAngled sx={iconStyles} />
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        padding: '8px 12px',
        ':hover': {
          cursor: 'default'
        },
        ...style
      }}
      data-testid="BaseReferrer"
    >
      {Icon}
      <Box
        sx={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          alignItems: 'inherit',
          gap: 2
        }}
      >
        <ReferrerValue
          tooltipTitle={property}
          property={property}
          visitors={visitors}
        />
      </Box>
    </Box>
  )
}
