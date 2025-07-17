import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

interface VideoEditionChipProps {
  editionName: string
}

export function VideoEditionChip({
  editionName
}: VideoEditionChipProps): ReactElement {
  return (
    <Box
      data-testid="VideoEditionChip"
      sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: 1
      }}
    >
      <Typography variant="caption" color="text.secondary">
        Edition:
      </Typography>
      <Chip
        label={editionName}
        variant="outlined"
        disabled
        size="small"
        aria-label="Edition"
        sx={{
          maxWidth: 'fit-content',
          borderColor: 'primary.dark',
          color: 'primary.dark',
          '&.Mui-disabled': {
            borderColor: 'primary.dark',
            color: 'primary.dark',
            opacity: 0.9
          }
        }}
      />
    </Box>
  )
}
