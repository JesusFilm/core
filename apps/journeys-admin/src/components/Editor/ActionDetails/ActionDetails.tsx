import { ReactElement } from 'react'
import Stack from '@mui/material/Stack'
import { ActionCards } from './ActionCards'
import { ActionEditor } from './ActionEditor'

interface ActionDetailsProps {
  url: string
}

export function ActionDetails({ url }: ActionDetailsProps): ReactElement {
  return (
    <Stack gap={2} sx={{ p: 6 }}>
      <ActionEditor url={url} />
      <ActionCards url={url} />
    </Stack>
  )
}
