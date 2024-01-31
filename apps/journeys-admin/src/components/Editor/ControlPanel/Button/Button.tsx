import Box from '@mui/material/Box'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

interface ButtonProps {
  icon: ReactElement
  value: string
  onClick?: () => void
  testId?: string
}

const StyledTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.white,
    border: '1px solid rgba(0, 0, 0, 0.1)'
  }
}))

export function Button({
  icon,
  value,
  onClick,
  testId
}: ButtonProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const handleClick = (): void => {
    onClick?.()
  }

  return (
    <Box
      onMouseDown={(e) => e.preventDefault()}
      data-testid={`JourneysAdminButton${testId ?? ''}`}
    >
      <StyledTooltip
        title={
          <Typography variant="caption" color="#30313D">
            {t(value)}
          </Typography>
        }
        placement="right"
        slotProps={{
          popper: {
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [0, -10]
                }
              }
            ]
          }
        }}
      >
        <CardActionArea onClick={handleClick}>
          <CardContent sx={{ px: 3.5, py: 3 }}>{icon}</CardContent>
        </CardActionArea>
      </StyledTooltip>
    </Box>
  )
}
