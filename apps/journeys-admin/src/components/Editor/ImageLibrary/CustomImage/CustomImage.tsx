import Box from '@mui/material/Box'
import { ReactElement } from 'react'
import { ImageUpload } from './ImageUpload'

interface CustomImageProps {
  onChange?: (id: string) => void
}

export function CustomImage({ onChange }: CustomImageProps): ReactElement {
  return (
    <Box sx={{ bgcolor: 'background.paper' }}>
      <ImageUpload onChange={onChange} />
    </Box>
  )
}
