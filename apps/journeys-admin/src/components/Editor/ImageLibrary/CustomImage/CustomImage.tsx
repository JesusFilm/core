import { ReactElement } from 'react'
import Stack from '@mui/material/Box'
import { CustomUrl } from './CustomUrl'

interface CustomImageProps {
  onChange: (src: string) => void
}

export function CustomImage({ onChange }: CustomImageProps): ReactElement {
  return (
    <Stack sx={{ bgcolor: 'background.paper' }}>
      <CustomUrl onChange={onChange} />
    </Stack>
  )
}
