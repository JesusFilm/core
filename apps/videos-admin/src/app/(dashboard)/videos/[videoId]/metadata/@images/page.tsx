import { useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { graphql } from 'gql.tada'
import Image from 'next/image'
import { ReactElement, useState } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'
import Edit2 from '@core/shared/ui/icons/Edit2'
import Upload1 from '@core/shared/ui/icons/Upload1'

import { VideoImageUpload } from './VideoImageUpload'

// Aligned with ImageAspectRatio enum from Prisma schema
export enum ImageAspectRatio {
  hd = 'hd', // 16:9
  banner = 'banner' // 2.13:1
}

interface CloudflareImage {
  id: string
  url?: string | null
  mobileCinematicHigh?: string | null
  videoStill?: string | null
  aspectRatio?: string
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

// Define standalone query for fetching video image data
const GET_VIDEO_IMAGES = graphql(`
  query GetVideoImages($id: ID!, $languageId: ID!) {
    adminVideo(id: $id) {
      id
      images {
        id
        url
        mobileCinematicHigh
        videoStill
        aspectRatio
      }
      imageAlt(languageId: $languageId) {
        id
        value
      }
    }
  }
`)

function getImageFields(
  video: VideoData,
  aspectRatio: ImageAspectRatio = ImageAspectRatio.banner
): {
  src: string | undefined
  alt: string | undefined
} {
  if (video == null) return { src: undefined, alt: undefined }

  const image = video.images.find((img) => {
    // First check if the image has the aspectRatio property
    if (img.aspectRatio != null) {
      return img.aspectRatio === aspectRatio
    }

    // Fallback for images without aspectRatio property
    if (aspectRatio === ImageAspectRatio.banner) {
      return img.mobileCinematicHigh != null
    }
    return (
      img.videoStill != null ||
      (img.url != null && img.mobileCinematicHigh == null)
    )
  })

  // Extract the src from the image URL
  let src: string | undefined = undefined
  if (image?.url) {
    src = `${image.url}/public`
  }

  // Handle alt text, ensuring it's either string or undefined (not null)
  let alt: string | undefined = undefined
  if (video?.imageAlt?.[0]?.value) {
    alt = video.imageAlt[0].value
  }

  return {
    src,
    alt
  }
}

interface ImageDisplayProps {
  src: string | undefined
  alt: string | undefined
  title: string
  onOpen: () => void
  aspectRatio: ImageAspectRatio
}

function ImageDisplay({
  src,
  alt,
  title,
  onOpen,
  aspectRatio
}: ImageDisplayProps): ReactElement {
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
  videoId: string
}

export default function VideoImage({ videoId }: VideoImageProps): ReactElement {
  const [showBannerDialog, setShowBannerDialog] = useState(false)
  const [showHdDialog, setShowHdDialog] = useState(false)

  // Use the query to fetch video image data
  const { data, loading, error } = useQuery(GET_VIDEO_IMAGES, {
    variables: { id: videoId },
    fetchPolicy: 'cache-and-network'
  })

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

  // Show loading state while data is fetching
  if (loading && !data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  // Show error state if query fails
  if (error) {
    return (
      <Typography color="error">
        Error loading video images: {error.message}
      </Typography>
    )
  }

  // If no data, show a message
  if (!data?.video) {
    return <Typography>No image data available</Typography>
  }

  const video = data.video

  const bannerImage = getImageFields(video, ImageAspectRatio.banner)
  const hdImage = getImageFields(video, ImageAspectRatio.hd)

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
            aspectRatio={ImageAspectRatio.banner}
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
            aspectRatio={ImageAspectRatio.hd}
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
          aspectRatio={ImageAspectRatio.banner}
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
          aspectRatio={ImageAspectRatio.hd}
          onUploadComplete={handleCloseHd}
        />
      </Dialog>
    </>
  )
}
