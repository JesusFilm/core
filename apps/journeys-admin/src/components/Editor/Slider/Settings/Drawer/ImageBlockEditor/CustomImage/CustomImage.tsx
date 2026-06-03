import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useState } from 'react'

import { useTeam } from '@core/journeys/ui/TeamProvider'
import { useFlags } from '@core/shared/ui/FlagsProvider'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../../__generated__/BlockFields'
import { ImageBlockUpdateInput } from '../../../../../../../../__generated__/globalTypes'
import { MediaLibrary } from '../MediaLibrary'

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
  const { activeTeam, refetch } = useTeam()
  const [galleryKey, setGalleryKey] = useState(0)

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
        onUploaded={() => setGalleryKey((k) => k + 1)}
        loading={loading}
        selectedBlock={selectedBlock}
        error={error}
      />
      {mediaLibrary === true && (
        <MediaLibrary
          key={galleryKey}
          title={t('Uploads')}
          selectedSrc={selectedBlock?.src}
          onSelect={onChange}
          isAi={false}
          uploading={loading}
          teamId={activeTeam?.id ?? null}
          onForbidden={refetch}
        />
      )}
    </Stack>
  )
}
