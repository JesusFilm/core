import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

import { ShareButton } from '../../ShareButton'
import { TextFormatter } from '../../TextFormatter'

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
      <Box>
        <TextFormatter
          slotProps={{
            typography: {
              variant: 'subtitle1',
              color: 'text.primary'
            }
          }}
        >
          {value}
        </TextFormatter>
      </Box>
      <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
        <ShareButton onClick={openDialog} variant="button" />
      </Box>
    </Stack>
  )
}
