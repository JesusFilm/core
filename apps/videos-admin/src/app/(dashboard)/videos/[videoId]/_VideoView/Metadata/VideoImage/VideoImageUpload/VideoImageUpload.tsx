import { gql, useApolloClient, useMutation } from '@apollo/client'
import type FormDataType from 'form-data'
import { ResultOf, VariablesOf, graphql } from 'gql.tada'
import fetch from 'node-fetch'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'

import { GetAdminVideo } from '../../../../../../../../libs/useAdminVideo'
import { FileUpload } from '../FileUpload'

export const CREATE_CLOUDFLARE_UPLOAD_BY_FILE = graphql(`
  mutation CreateCloudflareUploadByFile($input: ImageInput!) {
    createCloudflareUploadByFile(input: $input) {
      __typename
      uploadUrl
      id
      url
      mobileCinematicHigh
    }
  }
`)

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

interface VideoImageUpload {
  video: GetAdminVideo['adminVideo']
  onUploadComplete?: () => void
}

export function VideoImageUpload({
  video,
  onUploadComplete
}: VideoImageUpload): ReactElement {
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(false)
  const { cache } = useApolloClient()
  const [createCloudflareUploadByFile] =
    useMutation<CreateCloudflareUploadByFile>(CREATE_CLOUDFLARE_UPLOAD_BY_FILE)
  const [uploadComplete] = useMutation<CloudflareUploadComplete>(
    CLOUDFLARE_UPLOAD_COMPLETE
  )

  const [deleteImage] = useMutation(DELETE_VIDEO_CLOUDFLARE_IMAGE)

  const handleDrop = async (file: File): Promise<void> => {
    if (file == null) return
    setLoading(true)
    const { data } = await createCloudflareUploadByFile({
      variables: {
        input: {
          videoId: video.id,
          aspectRatio: 'banner'
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
        if (video.images.length > 0) {
          await deleteImage({
            variables: {
              id: video.images[0].id
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
                    }
                  `
                })
                return [...refs, newRef]
              }
            }
          })
          cache.modify({
            id: cache.identify({ id: video.id, __typename: 'Video' }),
            fields: {
              images(refs, { readField }) {
                if (video.images.length === 0) return refs
                return refs.filter(
                  (ref) => video.images[0].id !== readField('id', ref)
                )
              }
            }
          })
          enqueueSnackbar('Image uploaded successfully', {
            variant: 'success',
            preventDuplicate: false
          })
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
