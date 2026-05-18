import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import { useTranslation } from 'next-i18next/pages'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'

import { useFlags } from '@core/shared/ui/FlagsProvider'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../../__generated__/BlockFields'
import { CreateAiImage } from '../../../../../../../../__generated__/CreateAiImage'
import {
  ImageBlockUpdateInput,
  SegmindModel
} from '../../../../../../../../__generated__/globalTypes'
import { MediaLibrary } from '../MediaLibrary'
import { MediaLibraryListImage } from '../MediaLibrary/MediaLibraryList'

import { AIPrompt } from './AIPrompt'

export const CREATE_AI_IMAGE = gql`
  mutation CreateAiImage($prompt: String!, $model: SegmindModel!) {
    createImageBySegmindPrompt(prompt: $prompt, model: $model) {
      id
    }
  }
`

interface AIGalleryProps {
  onChange: (input: ImageBlockUpdateInput) => void
  setUploading?: (uploading?: boolean) => void
  loading?: boolean
  selectedBlock?: ImageBlock | null
}

export function AIGallery({
  onChange,
  setUploading,
  loading,
  selectedBlock
}: AIGalleryProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const { mediaLibrary } = useFlags()
  const [createAiImage] = useMutation<CreateAiImage>(CREATE_AI_IMAGE)
  const [localImages, setLocalImages] = useState<MediaLibraryListImage[]>([])

  async function handleSubmit({ prompt }: { prompt: string }): Promise<void> {
    setUploading?.(true)
    try {
      const { data } = await createAiImage({
        variables: {
          prompt,
          model: SegmindModel.sdxl1__0_txt2img
        }
      })

      if (data?.createImageBySegmindPrompt?.id != null) {
        const cloudflareId = data.createImageBySegmindPrompt.id
        const url = `https://imagedelivery.net/${
          process.env.NEXT_PUBLIC_CLOUDFLARE_UPLOAD_KEY ?? ''
        }/${cloudflareId}`
        setLocalImages((prev) =>
          prev.some((image) => image.id === cloudflareId)
            ? prev
            : [
                { id: cloudflareId, src: `${url}/public`, blurhash: null },
                ...prev
              ]
        )
        await onChange({
          src: `${url}/public`,
          alt: `Prompt: ${prompt}`,
          scale: 100,
          focalLeft: 50,
          focalTop: 50,
          customizable: null
        })
      } else {
        enqueueSnackbar(t('Something went wrong, please try again!'), {
          variant: 'error',
          preventDuplicate: true
        })
      }
    } catch (error) {
      if (error instanceof Error) {
        enqueueSnackbar(error.message, {
          variant: 'error',
          preventDuplicate: true
        })
      }
    }
    setUploading?.(false)
  }

  return (
    <Box
      data-testid="AIGallery"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0
      }}
    >
      <AIPrompt
        handleSubmit={handleSubmit}
        loading={loading}
        selectedBlock={selectedBlock}
      />
      {mediaLibrary === true && (
        <MediaLibrary
          title={t('Generations')}
          selectedSrc={selectedBlock?.src}
          onSelect={onChange}
          isAi={true}
          localImages={localImages}
          uploading={loading}
        />
      )}
    </Box>
  )
}
