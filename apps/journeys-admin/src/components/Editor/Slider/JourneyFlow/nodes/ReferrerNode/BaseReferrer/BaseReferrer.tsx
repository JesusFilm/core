import ChevronDown from '@core/shared/ui/icons/ChevronDown'
import { FacebookIcon } from '@core/shared/ui/icons/FacebookIcon'
import LinkAngled from '@core/shared/ui/icons/LinkAngled'
import { Tooltip } from '@mui/material'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

const iconStyles = { fontSize: '18px' }
const textStyles = { fontSize: '12px', lineHeight: '20px' }

export function BaseReferrer({ property, visitors }) {
  let Icon

  switch (property) {
    case 'Facebook':
      Icon = <FacebookIcon />
      break
    case 'Direct / None':
      Icon = <LinkAngled sx={iconStyles} />
      break
    case 'Other sources':
      Icon = <ChevronDown sx={iconStyles} />
      break
    default:
      Icon = <LinkAngled sx={iconStyles} />
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'min-content auto 1fr',
        alignItems: 'center',
        padding: '8px 12px',
        gap: 2,
        ':hover': {
          cursor: 'default'
        }
      }}
      data-testid="BaseReferrer"
    >
      {Icon}
      <Tooltip
        title={property}
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
    </Box>
  )
}
