import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { ReactElement, useReducer, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import Upload1Icon from '@core/shared/ui/icons/Upload1'
import type FormDataType from 'form-data'
import { graphql, ResultOf, VariablesOf } from 'gql.tada'
import { useMutation } from '@apollo/client'
import { FileUpload } from '../FileUpload'
import { GetAdminVideo } from '../../../../../../../../../libs/useAdminVideo'

export const CREATE_CLOUDFLARE_UPLOAD_BY_FILE = graphql(`
  mutation CreateCloudflareUploadByFile($input: ImageInput!) {
    createCloudflareUploadByFile(input: $input) {
      uploadUrl
      id
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

function getFileExtension(path: string): string | null {
  const regex = /(?:\.([^.]+))?$/

  const match = path.match(regex)

  return match != null ? match[1] : null
}

function getFileName(path: string): string | null {
  const fileName = path.match(/[^/]+$/)

  return fileName != null ? fileName[0] : null
}

interface VideoImageUpload {
  video: GetAdminVideo['adminVideo']
}

export function VideoImageUpload({ video }: VideoImageUpload): ReactElement {
  const [createCloudflareUploadByFile] =
    useMutation<CreateCloudflareUploadByFile>(CREATE_CLOUDFLARE_UPLOAD_BY_FILE)
  const [uploadComplete] = useMutation<CloudflareUploadComplete>(
    CLOUDFLARE_UPLOAD_COMPLETE
  )

  console.log({video})

  const [deleteImage] = useMutation(DELETE_VIDEO_CLOUDFLARE_IMAGE)

  const handleDrop = async (file: File): Promise<void> => {
    if (file == null) null

    const { data } = await createCloudflareUploadByFile({
      variables: {
        input: {
          videoId: video.id,
          aspectRatio: 'banner'
        }
      }
    })

    console.log({ data })

    if (data?.createCloudflareUploadByFile == null) {
      // dispatch('Error')
      return
    }

    const { id, uploadUrl } = data?.createCloudflareUploadByFile

    if (uploadUrl != null) {
      const formData = new FormData()
      formData.append('file', file)

      try {
        const response = await (
          await fetch(uploadUrl, {
            method: 'POST',
            body: formData as unknown as FormDataType
          })
        ).json()
        console.log({ response })

        // response.success === true ? d
        const src = `https://imagedelivery.net/${
          process.env.NEXT_PUBLIC_CLOUDFLARE_UPLOAD_KEY ?? ''
        }/${id}/public`

        const completeResponse = await uploadComplete({
          variables: {
            id
          }
        })
        console.log({ completeResponse })

        const deleteResponse = await deleteImage({
          variables: {
            id: video.images[0].id
          }
        })
        console.log({ deleteResponse })
      } catch {
        // dispatch('Error')
      }
    }

    // const fileName = file.name.split('.')[0]
    // const ext = getFileExtension(file.name)

    // handleDrop({ file, fileName: file.name, fileExtension: ext })
  }

  return <FileUpload onDrop={handleDrop} accept={{ 'image/*': [] }} />
}
