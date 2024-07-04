import ChevronDown from '@core/shared/ui/icons/ChevronDown'
import { FacebookIcon } from '@core/shared/ui/icons/FacebookIcon'
import LinkAngled from '@core/shared/ui/icons/LinkAngled'
import Box from '@mui/material/Box'
import { SxProps } from '@mui/system'
import { ReferrerValue } from '../ReferrerValue'

const iconStyles = { fontSize: '18px' }

interface BaseReferrerProps {
  property: string
  visitors: number | null
  style?: SxProps
}

export function BaseReferrer({ property, visitors, style }: BaseReferrerProps) {
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
        display: 'flex',
        //         display: 'grid',
        //         gridTemplateColumns: 'min-content auto 1fr',
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
      {/* <Tooltip
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
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          alignItems: 'inherit',
          gap: 2
        }}
      >
        {visitors}
      </Typography> */}

      {/* <Tooltip
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
      </Box> */}
    </Box>
  )
}
