import { useMutation } from '@apollo/client'
import axios from 'axios'
import { graphql } from 'gql.tada'
import { useState } from 'react'

import { File } from '../../../../../../../../../../components/File'
import { useVideo } from '../../../../../../../../../../libs/VideoProvider'
import { FileUpload } from '../../../../Metadata/VideoImage/FileUpload'

export const CREATE_CLOUDFLARE_R2_ASSET = graphql(`
  mutation CreateCloudflareR2Asset($input: CloudflareR2CreateInput!) {
    cloudflareR2Create(input: $input) {
      id
      uploadUrl
    }
  }
`)

const getFileName = (video, edition, languageId, file) => {
  const extension = file.name.split('.').pop()
  return `${video.id}/editions/${edition.id}/subtitles/${video.id}_${edition.id}_${languageId}.${extension}`
}

export function SubtitleUpload({ edition }) {
  const video = useVideo()
  const [file, setFile] = useState<File | null>(null)

  const uploadFile = async (url: string, file: File) => {
    const response = await axios.put(url, file, {
      headers: {
        'Content-Type': 'text/vtt'
      }
    })

    console.log({ response })
  }

  const handleDrop = async (file: File) => {
    setFile(file)
    const fileName = getFileName(video, edition, '529', file)
    await createCloudflareR2Asset({
      variables: {
        input: {
          videoId: video.id,
          fileName
        }
      },
      onCompleted: async (data) => {
        if (data?.cloudflareR2Create?.uploadUrl == null) {
          return
        }

        await uploadFile(data.cloudflareR2Create.uploadUrl, file)
      }
    })
  }

  const handleDelete = () => {
    setFile(null)
  }

  const [createCloudflareR2Asset] = useMutation(CREATE_CLOUDFLARE_R2_ASSET)

  return (
    <>
      <FileUpload
        onDrop={handleDrop}
        accept={{ 'text/vtt': [] }}
        loading={false}
        noClick={false}
      />
      {file && <File file={file} actions={{ onDelete: handleDelete }} />}
    </>
  )
}
