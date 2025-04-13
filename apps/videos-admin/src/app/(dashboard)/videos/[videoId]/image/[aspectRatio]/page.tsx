'use client'

import Typography from '@mui/material/Typography'
import { graphql } from 'gql.tada'
import { useRouter } from 'next/navigation'
import { ReactElement } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

import { ImageAspectRatio } from '../../../constants'
import { VideoImageUpload } from '../_upload'

export const CREATE_CLOUDFLARE_UPLOAD_BY_FILE = graphql(`
  mutation CreateCloudflareUploadByFile($input: ImageInput!) {
    createCloudflareUploadByFile(input: $input) {
      __typename
      uploadUrl
      id
      url
      mobileCinematicHigh
      videoStill
      aspectRatio
    }
  }
`)

interface VideoImageProps {
  params: {
    videoId: string
    aspectRatio: string
  }
}

export default function VideoImage({
  params: { videoId, aspectRatio }
}: VideoImageProps): ReactElement {
  const router = useRouter()
  return (
    <Dialog
      testId="VideoImageUploadDialog-Banner"
      open={true}
      onClose={() => router.push(`/videos/${videoId}`)}
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
  )
}
