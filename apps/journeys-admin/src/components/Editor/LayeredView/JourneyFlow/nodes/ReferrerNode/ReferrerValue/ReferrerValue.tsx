import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

const textStyles = { fontSize: '12px', lineHeight: '20px' }

interface ReferrerValueProps {
  tooltipTitle: string
  property: string
  visitors: number | null
}

export function ReferrerValue({
  tooltipTitle,
  property,
  visitors
}: ReferrerValueProps): ReactElement {
  return (
    <>
      <Tooltip
        title={tooltipTitle}
        placement="top"
        slotProps={{
          popper: {
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [0, -8]
                }
              }
            ]
          },
          tooltip: {
            sx: {
              py: 0
            }
          }
        }}
      >
        <Typography noWrap sx={textStyles}>
          {property}
        </Typography>
      </Tooltip>
      <Typography
        variant="body2"
        sx={{
          ...textStyles,
          fontWeight: 600,
          placeSelf: 'end'
        }}
      >
        {visitors}
      </Typography>
    </>
  )
}
