import ChevronDown from '@core/shared/ui/icons/ChevronDown'
import { FacebookIcon } from '@core/shared/ui/icons/FacebookIcon'
import LinkAngled from '@core/shared/ui/icons/LinkAngled'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

export function BaseReferrer({ property, visitors }) {
  let Icon

  switch (property) {
    case 'Facebook':
      Icon = <FacebookIcon />
      break
    case 'Direct / None':
      Icon = <LinkAngled fontSize="small" />
      break
    case 'Other sources':
      Icon = <ChevronDown />
      break
    default:
      Icon = <LinkAngled fontSize="small" />
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 2,
        padding: '3px 6px'
      }}
      data-testid="BaseReferrer"
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {Icon}
        <Typography variant="body2">{property}</Typography>
      </Box>
      <Typography variant="body2">{visitors}</Typography>
    </Box>
  )
}
