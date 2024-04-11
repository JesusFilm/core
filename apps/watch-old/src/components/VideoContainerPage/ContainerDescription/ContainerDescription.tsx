import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import { ShareButton } from '../../ShareButton'

export interface ContainerDescriptionProps {
  value: string
  openDialog: () => void
}

export function ContainerDescription({
  value,
  openDialog
}: ContainerDescriptionProps): ReactElement {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="flex-start"
      spacing={4}
      data-testid="ContainerDescription"
    >
      <Typography
        variant="subtitle1"
        component="h2"
        color="text.primary"
        sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
      >
        {value}
      </Typography>
      <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
        <ShareButton onClick={openDialog} variant="button" />
      </Box>
    </Stack>
  )
}
