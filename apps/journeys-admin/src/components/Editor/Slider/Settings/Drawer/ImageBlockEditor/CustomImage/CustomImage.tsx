import Stack from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { useFlags } from '@core/shared/ui/FlagsProvider'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../../__generated__/BlockFields'
import { ImageBlockUpdateInput } from '../../../../../../../../__generated__/globalTypes'
import { MediaLibraryImagesGrid } from '../MediaLibraryImagesGrid'

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
  const { mediaLibrary } = useFlags()

  return (
    <Stack
      sx={{
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0
      }}
      data-testid="CustomImage"
    >
      <ImageUpload
        onChange={onChange}
        setUploading={setUploading}
        loading={loading}
        selectedBlock={selectedBlock}
        error={error}
      />
      <Divider sx={{ my: 4 }} />
      <CustomUrl onChange={onChange} />
      {mediaLibrary === true && (
        <>
          <Divider sx={{ my: 4 }} />
          <MediaLibraryImagesGrid
            title={t('Your uploads')}
            selectedSrc={selectedBlock?.src}
            onSelect={onChange}
            isAi={false}
            uploading={loading}
          />
        </>
      )}
    </Stack>
  )
}
