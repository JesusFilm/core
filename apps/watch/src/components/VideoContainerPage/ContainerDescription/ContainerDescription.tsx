import { ReactElement } from 'react'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import { ShareButton } from '../ShareButton'

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
      <Typography variant="subtitle1" color="text.primary">
        {value}
      </Typography>
      <ShareButton openDialog={openDialog} variant="button" />
    </Stack>
  )
}
