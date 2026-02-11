import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import Edit2Icon from '@core/shared/ui/icons/Edit2'
import GridEmptyIcon from '@core/shared/ui/icons/GridEmpty'
import { NextImage } from '@core/shared/ui/NextImage'

import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../../../../../__generated__/GetJourney'
import { useImageUpload } from '../../../../../../../libs/useImageUpload'

interface ImageSectionItemProps {
  imageBlock: ImageBlock
  onUploadComplete: (blockId: string, url: string) => Promise<void>
}

export function ImageSectionItem({
  imageBlock,
  onUploadComplete
}: ImageSectionItemProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { getRootProps, getInputProps, open, loading } = useImageUpload({
    onUploadComplete: (url) => onUploadComplete(imageBlock.id, url)
  })

  return (
    <Box
      {...getRootProps()}
      sx={{
        position: 'relative',
        width: '100%',
        aspectRatio: '160 / 100',
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: 'background.default'
      }}
    >
      <input
        {...getInputProps()}
        data-testid={`ImagesSection-file-input-${imageBlock.id}`}
      />
      {imageBlock.src ? (
        <NextImage
          src={imageBlock.src}
          alt={imageBlock.alt ?? ''}
          placeholder={imageBlock.blurhash ? 'blur' : 'empty'}
          blurDataURL={imageBlock.blurhash ?? undefined}
          layout="fill"
          objectFit="cover"
        />
      ) : (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <GridEmptyIcon sx={{ fontSize: 48, color: 'action.disabled' }} />
        </Box>
      )}
      <IconButton
        disabled={loading}
        size="small"
        onClick={open}
        sx={{
          position: 'absolute',
          top: 8,
          left: 8,
          bgcolor: 'background.paper',
          color: 'text.secondary',
          boxShadow: 1,
          width: 28,
          height: 28,
          '&:hover': {
            bgcolor: 'action.hover'
          },
          '&.Mui-disabled': {
            bgcolor: 'background.paper'
          }
        }}
        aria-label={t('Edit image')}
      >
        <Edit2Icon data-testid="Edit2Icon" sx={{ fontSize: 16 }} />
      </IconButton>
      {loading && (
        <CircularProgress
          size={32}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            mt: -2,
            ml: -2
          }}
          data-testid="ImagesSection-upload-progress"
        />
      )}
    </Box>
  )
}
