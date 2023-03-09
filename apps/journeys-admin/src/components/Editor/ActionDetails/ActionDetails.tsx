import { ReactElement } from 'react'
import Stack from '@mui/material/Stack'
import { ActionCards } from './ActionCards'
import { ActionEditor } from './ActionEditor'

export function ActionDetails(): ReactElement {
  return (
    <Stack gap={2} sx={{ p: 6 }}>
      <ActionEditor url="https://www.google.com/" />
      <ActionCards
        url="https://www.google.com/"
        parentBlockId="84d742c8-9905-4b77-8987-99c08c04cde3"
      />
    </Stack>
  )
}
