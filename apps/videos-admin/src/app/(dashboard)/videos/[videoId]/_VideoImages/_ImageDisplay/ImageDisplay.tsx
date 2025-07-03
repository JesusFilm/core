'use client'

import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ReactElement } from 'react'

import Edit2 from '@core/shared/ui/icons/Edit2'
import Upload1 from '@core/shared/ui/icons/Upload1'

import { ImageAspectRatio } from '../../../constants'

interface ImageDisplayProps {
  src: string | undefined
  alt: string | undefined
  title: string
  aspectRatio: ImageAspectRatio
  videoId: string
}

export function ImageDisplay({
  src,
  alt,
  title,
  aspectRatio,
  videoId
}: ImageDisplayProps): ReactElement {
  const router = useRouter()
  // Define aspect ratio values
  const aspectRatioValue =
    aspectRatio === ImageAspectRatio.banner
      ? '2.13/1' // Banner ratio is 2.13:1
      : '16/9' // HD ratio is 16:9

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        borderRadius: 1,
        overflow: 'hidden',
        aspectRatio: aspectRatioValue,
        bgcolor: 'background.paper'
      }}
    >
      {src ? (
        <Image
          src={src}
          alt={alt ?? 'video image'}
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
      ) : (
        <Stack
          sx={{
            height: '100%',
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Upload1 />
          <Typography variant="subtitle2" fontSize={14}>
            Upload {title}
          </Typography>
        </Stack>
      )}
      <Tooltip title={`Change ${title}`}>
        <IconButton
          onClick={() =>
            router.push(`/videos/${videoId}/image/${aspectRatio}`, {
              scroll: false
            })
          }
          size="small"
          sx={{ position: 'absolute', top: 4, right: 4 }}
        >
          <Edit2 />
        </IconButton>
      </Tooltip>
    </Box>
  )
}
