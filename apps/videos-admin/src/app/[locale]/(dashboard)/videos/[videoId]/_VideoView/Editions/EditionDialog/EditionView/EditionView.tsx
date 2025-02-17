import Box from '@mui/material/Box'
import { ReactElement } from 'react'

export function EditionView({ edition }: { edition: any }): ReactElement {
  return (
    <Box>
      <pre>{JSON.stringify(edition, null, 2)}</pre>
    </Box>
  )
}
