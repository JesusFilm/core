import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import { ReactElement, useState } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'
import Edit2 from '@core/shared/ui/icons/Edit2'
import Upload1 from '@core/shared/ui/icons/Upload1'

import { VideoImageUpload } from './VideoImageUpload'

interface CloudflareImage {
  id: string
  url?: string | null
  mobileCinematicHigh?: string | null
}

interface ImageAlt {
  id: string
  value?: string | null
}

interface VideoData {
  id: string
  images: CloudflareImage[]
  imageAlt: ImageAlt[]
}

function getImageFields(
  video: VideoData,
  aspectRatio: 'banner' | 'hd' = 'banner'
): {
  src: string | null | undefined
  alt: string | null | undefined
} {
  if (video == null) return { src: null, alt: null }

  const image = video.images.find((img) => {
    if (aspectRatio === 'banner') {
      return img.mobileCinematicHigh != null
    }
    return img.url != null && img.mobileCinematicHigh == null
  })

  const src = image?.url != null ? `${image.url}/public` : null
  const alt = video?.imageAlt?.[0]?.value

  return {
    src,
    alt
  }
}

interface ImageDisplayProps {
  src: string | null | undefined
  alt: string | null | undefined
  title: string
  onOpen: () => void
}

function ImageDisplay({
  src,
  alt,
  title,
  onOpen
}: ImageDisplayProps): ReactElement {
  return (
    <Box
      sx={{
        position: 'relative',
        height: 225,
        width: '100%',
        borderRadius: 1,
        overflow: 'hidden'
      }}
    >
      {src != null ? (
        <Image
          src={src}
          alt={alt ?? 'video image'}
          layout="fill"
          style={{ objectFit: 'cover' }}
          priority
        />
      ) : (
        <Stack
          sx={{
            bgcolor: 'background.paper',
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
          onClick={onOpen}
          size="small"
          sx={{ position: 'absolute', top: 4, right: 4 }}
        >
          <Edit2 />
        </IconButton>
      </Tooltip>
    </Box>
  )
}

interface VideoImageProps {
  video: VideoData
}

export function VideoImage({ video }: VideoImageProps): ReactElement {
  const [showBannerDialog, setShowBannerDialog] = useState(false)
  const [showHdDialog, setShowHdDialog] = useState(false)

  function handleOpenBanner(): void {
    setShowBannerDialog(true)
  }

  function handleCloseBanner(): void {
    setShowBannerDialog(false)
  }

  function handleOpenHd(): void {
    setShowHdDialog(true)
  }

  function handleCloseHd(): void {
    setShowHdDialog(false)
  }

  const bannerImage = getImageFields(video, 'banner')
  const hdImage = getImageFields(video, 'hd')

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" gutterBottom>
            Banner Image
          </Typography>
          <ImageDisplay
            src={bannerImage.src}
            alt={bannerImage.alt}
            title="banner image"
            onOpen={handleOpenBanner}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" gutterBottom>
            HD Image
          </Typography>
          <ImageDisplay
            src={hdImage.src}
            alt={hdImage.alt}
            title="HD image"
            onOpen={handleOpenHd}
          />
        </Grid>
      </Grid>

      <Dialog
        testId="VideoImageUploadDialog-Banner"
        open={showBannerDialog}
        onClose={handleCloseBanner}
        dialogTitle={{ title: 'Change Banner Image', closeButton: true }}
        slotProps={{ titleButton: { size: 'small' } }}
        sx={{
          '& .MuiPaper-root': { maxWidth: 400 }
        }}
      >
        <Typography color="error" sx={{ mb: 2 }}>
          Warning: this change will apply immediately
        </Typography>
        <VideoImageUpload
          video={video}
          aspectRatio="banner"
          onUploadComplete={handleCloseBanner}
        />
      </Dialog>

      <Dialog
        testId="VideoImageUploadDialog-HD"
        open={showHdDialog}
        onClose={handleCloseHd}
        dialogTitle={{ title: 'Change HD Image', closeButton: true }}
        slotProps={{ titleButton: { size: 'small' } }}
        sx={{
          '& .MuiPaper-root': { maxWidth: 400 }
        }}
      >
        <Typography color="error" sx={{ mb: 2 }}>
          Warning: this change will apply immediately
        </Typography>
        <VideoImageUpload
          video={video}
          aspectRatio="hd"
          onUploadComplete={handleCloseHd}
        />
      </Dialog>
    </>
  )
}
