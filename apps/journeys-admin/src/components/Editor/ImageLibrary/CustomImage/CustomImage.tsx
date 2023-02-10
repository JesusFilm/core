import Box from '@mui/material/Box'
import { ReactElement } from 'react'
import { ImageUpload } from './ImageUpload'

interface CustomImageProps {
  onChange: (src: string) => void
  loading?: boolean
}

export function CustomImage({
  onChange,
  loading = false
}: CustomImageProps): ReactElement {
  return (
    <Box sx={{ bgcolor: 'background.paper' }}>
      <ImageUpload onChange={onChange} loading={loading} />
    </Box>
  )
}
