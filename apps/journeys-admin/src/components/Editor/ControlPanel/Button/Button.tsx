import styled from '@emotion/styled'
import Box from '@mui/material/Box'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip'
import { ReactElement } from 'react'

interface ButtonProps {
  icon: ReactElement
  value: string
  onClick?: () => void
  testId?: string
}

export function Button({
  icon,
  value,
  onClick,
  testId
}: ButtonProps): ReactElement {
  const handleClick = (): void => {
    onClick?.()
  }

  return (
    <Box
      onMouseDown={(e) => e.preventDefault()}
      data-testid={`JourneysAdminButton${testId ?? ''}`}
    >
      <Tooltip
        title={value}
        placement="right"
        slotProps={{
          popper: {
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [0, -4]
                }
              }
            ]
          }
        }}
      >
        <CardActionArea onClick={handleClick}>
          <CardContent sx={{ py: 3 }}>{icon}</CardContent>
        </CardActionArea>
      </Tooltip>
    </Box>
  )
}
