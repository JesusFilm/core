import Stack from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../../__generated__/BlockFields'
import { ImageBlockUpdateInput } from '../../../../../../../../__generated__/globalTypes'
import { MyCloudflareImagesGrid } from '../MyCloudflareImagesGrid'

import { CustomUrl } from './CustomUrl'
import { ImageUpload } from './ImageUpload'

interface CustomImageProps {
  onChange: (input: ImageBlockUpdateInput) => void
  setUploading?: (uploading?: boolean) => void
  selectedBlock?: ImageBlock | null
  loading?: boolean
  error?: boolean
}

export function CustomImage({
  onChange,
  selectedBlock,
  setUploading,
  loading,
  error
}: CustomImageProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <Stack sx={{ bgcolor: 'background.paper' }} data-testid="CustomImage">
      <ImageUpload
        onChange={onChange}
        setUploading={setUploading}
        loading={loading}
        selectedBlock={selectedBlock}
        error={error}
      />
      <Divider sx={{ my: 4 }} />
      <CustomUrl onChange={onChange} />
      <Divider sx={{ my: 4 }} />
      <MyCloudflareImagesGrid
        title={t('Your uploads')}
        selectedSrc={selectedBlock?.src}
        onSelect={onChange}
        isAi={false}
        uploading={loading}
      />
    </Stack>
  )
}
