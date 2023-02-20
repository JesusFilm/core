import { ReactElement } from 'react'
import Stack from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import { CustomUrl } from './CustomUrl'
import { ImageUpload } from './ImageUpload'

interface CustomImageProps {
  onChange: (src: string) => void
  loading?: boolean
}

export function CustomImage({
  onChange,
  loading
}: CustomImageProps): ReactElement {
  return (
    <Stack sx={{ bgcolor: 'background.paper' }}>
      <ImageUpload onChange={onChange} loading={loading} />
      <Divider sx={{ mt: 8, mb: 4 }} />
      <CustomUrl onChange={onChange} />
    </Stack>
  )
}
