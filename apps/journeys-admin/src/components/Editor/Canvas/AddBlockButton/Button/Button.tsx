import { Stack } from '@mui/material'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
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
  disabled?: boolean
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
  testId,
  disabled = false
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
      <Card
        variant="outlined"
        sx={{
          height: 80,
          borderRadius: 2
        }}
      >
        <CardActionArea onClick={handleClick} disabled={disabled}>
          <CardContent
            sx={{
              height: 80,
              pl: 6,
              color: disabled ? 'secondary.light' : 'auto',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Stack direction="row" gap={4}>
              {icon}
              <Typography>{t(value)}</Typography>
            </Stack>
          </CardContent>
        </CardActionArea>
      </Card>
    </Box>
  )
}
