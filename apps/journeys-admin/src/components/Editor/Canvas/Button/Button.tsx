import Plus2 from '@core/shared/ui/icons/Plus2'
import { Stack } from '@mui/material'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

export interface NewBlockButtonProps {
  disabled?: boolean
}

interface ButtonProps {
  icon: ReactElement
  value: string
  onClick?: () => void
  testId?: string
  disabled?: boolean
}

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
      <Tooltip
        title={
          <Typography
            display={{ xs: 'none', sm: 'flex' }}
            variant="caption"
            lineHeight="12px"
          >
            {t(
              disabled && value === 'Video'
                ? 'Video Blocks cannot be placed on top of Block'
                : disabled
                ? 'Blocks cannot be placed on top of Video Block'
                : 'Click to add'
            )}
          </Typography>
        }
        placement="top"
        arrow
        slotProps={{
          popper: {
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [0, -28]
                }
              }
            ]
          }
        }}
      >
        <Box>
          <Card
            variant="outlined"
            sx={{
              pointerEvents: disabled ? 'none' : 'auto',
              height: 80,
              borderRadius: 2,
              '&:hover': {
                borderColor: { xs: 'editor.divider', sm: 'primary.main' },
                borderWidth: { xs: '1px', sm: '2px' },
                '.plus2-icon': {
                  color: { xs: 'editor.divider', sm: 'primary.main' }
                }
              }
            }}
          >
            <CardActionArea onClick={handleClick} disabled={disabled}>
              <CardContent
                sx={{
                  height: 80,
                  pl: 6,
                  color: disabled ? 'secondary.light' : 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Stack direction="row" gap={4}>
                  {icon}
                  <Typography>{t(value)}</Typography>
                </Stack>
                <Plus2
                  color="secondary"
                  className="plus2-icon"
                  sx={{
                    display: { xs: 'none', sm: 'flex' },
                    mr: 3.5
                  }}
                />
              </CardContent>
            </CardActionArea>
          </Card>
        </Box>
      </Tooltip>
    </Box>
  )
}
