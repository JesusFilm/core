import { gql, useApolloClient, useMutation } from '@apollo/client'
import type FormDataType from 'form-data'
import { ResultOf, VariablesOf, graphql } from 'gql.tada'
import fetch from 'node-fetch'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'

import { FileUpload } from '../../../../../../components/FileUpload'

// Aligned with ImageAspectRatio enum from Prisma schema
export enum ImageAspectRatio {
  hd = 'hd', // 16:9
  banner = 'banner' // 2.13:1
}

export type CreateCloudflareUploadByFile = ResultOf<
  typeof CREATE_CLOUDFLARE_UPLOAD_BY_FILE
>
export type CreateCloudflareUploadByFileVariables = VariablesOf<
  typeof CREATE_CLOUDFLARE_UPLOAD_BY_FILE
>

export const CLOUDFLARE_UPLOAD_COMPLETE = graphql(`
  mutation CloudflareUploadComplete($id: ID!) {
    cloudflareUploadComplete(id: $id)
  }
`)
export type CloudflareUploadComplete = ResultOf<
  typeof CLOUDFLARE_UPLOAD_COMPLETE
>
export type CloudflareUploadCompleteVariables = VariablesOf<
  typeof CLOUDFLARE_UPLOAD_COMPLETE
>

export const DELETE_VIDEO_CLOUDFLARE_IMAGE = graphql(`
  mutation DeleteVideoCloudflareImage($id: ID!) {
    deleteCloudflareImage(id: $id)
  }
`)

export type DeleteVideoCloudflareImage = ResultOf<
  typeof DELETE_VIDEO_CLOUDFLARE_IMAGE
>

export type DeleteVideoCloudflareImageVariables = VariablesOf<
  typeof DELETE_VIDEO_CLOUDFLARE_IMAGE
>

interface CloudflareImage {
  id: string
  url: string | null
  mobileCinematicHigh: string | null
  aspectRatio: string | null
}

interface VideoImageUploadProps {
  video: {
    id: string
    images: CloudflareImage[]
  }
  aspectRatio?: ImageAspectRatio
  onUploadComplete?: () => void
}

export function VideoImageUpload({
  video,
  aspectRatio = ImageAspectRatio.banner,
  onUploadComplete
}: VideoImageUploadProps): ReactElement {
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(false)
  const { cache } = useApolloClient()
  const [createCloudflareUploadByFile] =
    useMutation<CreateCloudflareUploadByFile>(CREATE_CLOUDFLARE_UPLOAD_BY_FILE)
  const [uploadComplete] = useMutation<CloudflareUploadComplete>(
    CLOUDFLARE_UPLOAD_COMPLETE
  )

  const [deleteImage] = useMutation(DELETE_VIDEO_CLOUDFLARE_IMAGE)

  // Helper to find the existing image of the specified aspect ratio
  const findExistingImage = (): CloudflareImage | undefined => {
    return video.images.find((img) => {
      // First check if the image has the aspectRatio property
      if (img.aspectRatio != null) {
        return img.aspectRatio === aspectRatio
      }

      // Fallback for images without aspectRatio property based on simple logic
      if (aspectRatio === ImageAspectRatio.banner) {
        return img.mobileCinematicHigh != null
      }
      // For HD images, look for ones without mobileCinematicHigh
      return img.url != null && img.mobileCinematicHigh == null
    })
  }

  const handleDrop = async (file: File): Promise<void> => {
    if (file == null) return
    setLoading(true)
    const { data } = await createCloudflareUploadByFile({
      variables: {
        input: {
          videoId: video.id,
          aspectRatio
        }
      },
      onError() {
        setLoading(false)
      }
    })

    if (data?.createCloudflareUploadByFile == null) {
      setLoading(false)
      enqueueSnackbar('Uploading failed, please try again', {
        variant: 'error',
        preventDuplicate: false
      })
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
        const existingImage = findExistingImage()
        if (existingImage) {
          await deleteImage({
            variables: {
              id: existingImage.id
            }
          })
        }

        if (response.success) {
          cache.modify({
            id: cache.identify({ id: video.id, __typename: 'Video' }),
            fields: {
              images(refs = []) {
                const newRef = cache.writeFragment({
                  data: data.createCloudflareUploadByFile,
                  fragment: gql`
                    fragment NewCloudflareImage on CloudflareImage {
                      id
                      url
                      uploadUrl
                      mobileCinematicHigh
                      videoStill
                      aspectRatio
                    }
                  `
                })
                return [...refs, newRef]
              }
            }
          })

          // Remove the old image from the cache if it exists
          if (existingImage) {
            cache.modify({
              id: cache.identify({ id: video.id, __typename: 'Video' }),
              fields: {
                images(refs, { readField }) {
                  return refs.filter(
                    (ref) => existingImage.id !== readField('id', ref)
                  )
                }
              }
            })
          }

          enqueueSnackbar(
            `${aspectRatio.toUpperCase()} image uploaded successfully`,
            {
              variant: 'success',
              preventDuplicate: false
            }
          )
        }
      } catch {
        enqueueSnackbar('Uploading failed, please try again', {
          variant: 'error',
          preventDuplicate: false
        })
      } finally {
        setLoading(false)
      }
    }
    setLoading(false)
  }

  return (
    <FileUpload
      onDrop={handleDrop}
      accept={{
        'image/png': [],
        'image/jpg': [],
        'image/jpeg': [],
        'image/webp': []
      }}
      onUploadComplete={onUploadComplete}
      loading={loading}
    />
  )
}
