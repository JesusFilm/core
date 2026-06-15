import { gql, useApolloClient, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import { useTranslation } from 'next-i18next/pages'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'

import { useTeam } from '@core/journeys/ui/TeamProvider'
import { useFlags } from '@core/shared/ui/FlagsProvider'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../../__generated__/BlockFields'
import { CreateAiImage } from '../../../../../../../../__generated__/CreateAiImage'
import {
  ImageBlockUpdateInput,
  SegmindModel
} from '../../../../../../../../__generated__/globalTypes'
import { useAuth } from '../../../../../../../libs/auth'
import { MediaLibrary } from '../MediaLibrary'
import { prependCloudflareImage } from '../MediaLibrary/prependCloudflareImage'

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
  const { activeTeam } = useTeam()
  const { cache } = useApolloClient()
  const { user } = useAuth()
  const [createAiImage] = useMutation<CreateAiImage>(CREATE_AI_IMAGE)
  const [galleryKey, setGalleryKey] = useState(0)

  async function handleSubmit({ prompt }: { prompt: string }): Promise<void> {
    setUploading?.(true)
    try {
      const { data } = await createAiImage({
        variables: {
          prompt,
          model: SegmindModel.sdxl1__0_txt2img
        }
      })

      const cloudflareId = data?.createImageBySegmindPrompt?.id
      const cloudflareUploadKey = process.env.NEXT_PUBLIC_CLOUDFLARE_UPLOAD_KEY
      if (
        cloudflareId != null &&
        cloudflareUploadKey != null &&
        cloudflareUploadKey !== ''
      ) {
        const url = `https://imagedelivery.net/${cloudflareUploadKey}/${cloudflareId}`
        // Only prepend optimistically when the uploader is known. Writing a
        // placeholder userId would later compare unequal to the resolved user
        // id and mislabel the caller's own upload as a teammate's "Team" tile.
        if (user?.id != null) {
          prependCloudflareImage(
            cache,
            { id: cloudflareId, url, blurhash: null, userId: user.id },
            true
          )
        }
        setGalleryKey((k) => k + 1)
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
          key={galleryKey}
          title={t('Generations')}
          selectedSrc={selectedBlock?.src}
          onSelect={onChange}
          isAi={true}
          uploading={loading}
          teamId={activeTeam?.id ?? null}
        />
      )}
    </Box>
  )
}
