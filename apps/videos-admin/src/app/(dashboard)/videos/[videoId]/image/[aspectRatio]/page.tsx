'use client'

import { useMutation, useSuspenseQuery } from '@apollo/client'
import Typography from '@mui/material/Typography'
import type FormDataType from 'form-data'
import { graphql } from 'gql.tada'
import { useRouter } from 'next/navigation'
import fetch from 'node-fetch'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

import { FileUpload } from '../../../../../../components/FileUpload'
import { ImageAspectRatio } from '../../../constants'

const GET_EXISTING_IMAGE = graphql(`
  query GetExistingImage($videoId: ID!, $aspectRatio: ImageAspectRatio!) {
    adminVideo(id: $videoId) {
      id
      images(aspectRatio: $aspectRatio) {
        id
      }
    }
  }
`)

const CREATE_CLOUDFLARE_UPLOAD_BY_FILE = graphql(`
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

const CLOUDFLARE_UPLOAD_COMPLETE = graphql(`
  mutation CloudflareUploadComplete($id: ID!) {
    cloudflareUploadComplete(id: $id)
  }
`)

const DELETE_VIDEO_CLOUDFLARE_IMAGE = graphql(`
  mutation DeleteVideoCloudflareImage($id: ID!) {
    deleteCloudflareImage(id: $id)
  }
`)

interface VideoImageProps {
  params: {
    videoId: string
    aspectRatio: string
  }
}

export default function VideoImage({
  params: { videoId, aspectRatio: aspectRatioParam }
}: VideoImageProps): ReactElement {
  const aspectRatio = ImageAspectRatio[aspectRatioParam]
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(false)
  const {
    data: { adminVideo }
  } = useSuspenseQuery(GET_EXISTING_IMAGE, {
    variables: {
      videoId,
      aspectRatio
    }
  })
  const [createCloudflareUploadByFile] = useMutation(
    CREATE_CLOUDFLARE_UPLOAD_BY_FILE
  )
  const [uploadComplete] = useMutation(CLOUDFLARE_UPLOAD_COMPLETE)
  const [deleteImage] = useMutation(DELETE_VIDEO_CLOUDFLARE_IMAGE)

  function handleError() {
    setLoading(false)
    enqueueSnackbar('Uploading failed, please try again', {
      variant: 'error',
      preventDuplicate: false
    })
  }

  const handleDrop = async (file: File): Promise<void> => {
    if (file == null) return
    setLoading(true)
    const { data } = await createCloudflareUploadByFile({
      variables: {
        input: {
          videoId: videoId,
          aspectRatio
        }
      },
      onError: () => {
        setLoading(false)
        handleError()
      }
    })

    if (data == null) {
      setLoading(false)
      handleError()
      return
    }

    const { id, uploadUrl } = data.createCloudflareUploadByFile

    if (uploadUrl != null) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        const response = await (
          await fetch(uploadUrl, {
            method: 'POST',
            body: formData as unknown as FormDataType
          })
        ).json()

        if (response.errors.length !== 0)
          throw new Error('Uploading failed, please try again')

        await uploadComplete({
          variables: {
            id
          }
        })

        // Find and delete the existing image of the same aspect ratio if exists
        const existingImage = adminVideo.images[0] ?? null
        if (existingImage) {
          await deleteImage({
            variables: {
              id: existingImage.id
            }
          })
        }
      } catch {
        handleError()
      } finally {
        setLoading(false)
      }
    }
    setLoading(false)
  }
  return (
    <Dialog
      testId="VideoImageUploadDialog-Banner"
      open={true}
      onClose={() =>
        router.push(`/videos/${videoId}`, {
          scroll: false
        })
      }
      dialogTitle={{ title: 'Edit Image', closeButton: true }}
      slotProps={{ titleButton: { size: 'small' } }}
      sx={{
        '& .MuiPaper-root': { maxWidth: 400 }
      }}
    >
      <Typography color="error" sx={{ mb: 2 }}>
        Warning: this change will apply immediately
      </Typography>
      <FileUpload
        onDrop={handleDrop}
        accept={{
          'image/png': [],
          'image/jpg': [],
          'image/jpeg': [],
          'image/webp': []
        }}
        onUploadComplete={() => {
          router.push(`/videos/${videoId}`, {
            scroll: false
          })
        }}
        loading={loading}
      />
    </Dialog>
  )
}
