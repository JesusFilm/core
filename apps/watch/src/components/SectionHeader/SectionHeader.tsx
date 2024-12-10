import Typography from '@mui/material/Typography'
import { Box } from '@mui/system'
import { type ReactElement } from 'react'

interface SectionHeaderProps {
  primaryText: string
  secondaryText: string
  disableTopSpacing?: boolean
  sx?: object
}

export function SectionHeader({
  primaryText,
  secondaryText,
  disableTopSpacing,
  sx
}: SectionHeaderProps): ReactElement {
  return (
    <Box sx={{ ...sx }}>
      <Typography
        variant="h4"
        sx={{
          mt: disableTopSpacing ? 0 : 16,
          mb: 0,
          color: 'text.primary'
        }}
      >
        {primaryText}
      </Typography>
      <Typography
        variant="subtitle1"
        sx={{
          mt: 0,
          mb: 6,
          opacity: 0.5,
          color: 'text.primary'
        }}
      >
        {secondaryText}
      </Typography>
    </Box>
  )
}
