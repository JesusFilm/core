import { ReactElement } from 'react'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import { ShareButton } from '../../ShareButton'

export interface Props {
  value: string
  openDialog: () => void
}

export function ContainerDescription({
  value,
  openDialog
}: Props): ReactElement {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="flex-start"
      spacing={4}
    >
      <Typography
        variant="subtitle1"
        component="h2"
        color="text.primary"
        sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
      >
        {value}
      </Typography>
      <ShareButton onClick={openDialog} variant="button" />
    </Stack>
  )
}
