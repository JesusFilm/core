import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import { ReactElement, useState } from 'react'

import { CreateAiImage } from '../../../../../__generated__/CreateAiImage'
import { SegmindModel } from '../../../../../__generated__/globalTypes'

import { AIPrompt } from './AIPrompt'

export const CREATE_AI_IMAGE = gql`
  mutation CreateAiImage($prompt: String!, $model: SegmindModel!) {
    createImageBySegmindPrompt(prompt: $prompt, model: $model) {
      id
    }
  }
`

interface AIGalleryProps {
  onChange: (src: string) => void
  setUploading?: (uploading?: boolean) => void
  loading?: boolean
}

export function AIGallery({
  onChange,
  setUploading,
  loading
}: AIGalleryProps): ReactElement {
  const somePrompt =
    'picture of a Maori man with glasses and a beard and he is wearing a shirt that says Jesus Film. Make him be sitting in front of a computer like a really cool nerd'
  const [textValue, setTextvalue] = useState<string | null>(somePrompt)

  const [createAiImage] = useMutation<CreateAiImage>(CREATE_AI_IMAGE)

  const handleSubmit = async (): Promise<void> => {
    setUploading?.(true)
    try {
      const { data } = await createAiImage({
        variables: {
          prompt: textValue,
          model: SegmindModel.sdxl1__0_txt2img
        }
      })
      if (data?.createImageBySegmindPrompt?.id != null) {
        const src = `https://imagedelivery.net/${
          process.env.NEXT_PUBLIC_CLOUDFLARE_UPLOAD_KEY ?? ''
        }/${data?.createImageBySegmindPrompt?.id}/public`
        onChange(src)
      }
      setUploading?.(false)
    } catch {
      setUploading?.(false)
    }
  }

  const handleChange = (e): void => {
    setTextvalue(e.target.value)
  }
  return (
    <Box>
      <AIPrompt
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        textValue={textValue}
        loading={loading}
      />
    </Box>
  )
}
