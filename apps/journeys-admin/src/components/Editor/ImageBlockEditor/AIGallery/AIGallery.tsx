import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import { useSnackbar } from 'notistack'
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
  const [textValue, setTextvalue] = useState<string | null>()
  const { enqueueSnackbar } = useSnackbar()
  const [createAiImage] = useMutation<CreateAiImage>(CREATE_AI_IMAGE)

  const handleSubmit = async ({ prompt }): Promise<void> => {
    setUploading?.(true)
    try {
      const { data } = await createAiImage({
        variables: {
          prompt,
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
    } catch (error) {
      setUploading?.(false)
      enqueueSnackbar(error.message, {
        variant: 'error',
        preventDuplicate: true
      })
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
