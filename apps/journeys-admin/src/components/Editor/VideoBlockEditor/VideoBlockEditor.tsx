import { ReactElement, useEffect, useState } from 'react'
import type { TreeBlock } from '@core/journeys/ui/block'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import { gql, useQuery } from '@apollo/client'
import {
  VideoBlockSource,
  VideoBlockUpdateInput
} from '../../../../__generated__/globalTypes'
import {
  GetJourney_journey_blocks_ImageBlock as ImageBlock,
  GetJourney_journey_blocks_VideoBlock as VideoBlock
} from '../../../../__generated__/GetJourney'
import { GetVideoVariantLanguages } from '../../../../__generated__/GetVideoVariantLanguages'
import { ImageBlockHeader } from '../ImageBlockHeader'
import { Source } from './Source'
import { VideoBlockEditorSettings } from './Settings'

interface VideoBlockEditorProps {
  selectedBlock: TreeBlock<VideoBlock> | null
  onChange: (input: VideoBlockUpdateInput) => Promise<void>
  showDelete?: boolean
  onDelete?: () => Promise<void>
}

export const GET_VIDEO_VARIANT_LANGUAGES = gql`
  query GetVideoVariantLanguages($id: ID!) {
    video(id: $id) {
      id
      variantLanguages {
        id
        name(languageId: "529", primary: true) {
          value
          primary
        }
      }
    }
  }
`

export function VideoBlockEditor({
  selectedBlock,
  showDelete = true,
  onChange,
  onDelete
}: VideoBlockEditorProps): ReactElement {
  const posterBlock = selectedBlock?.children.find(
    (child) => child.id === (selectedBlock as VideoBlock).posterBlockId
  ) as ImageBlock | null

  const handleVideoDelete = async (): Promise<void> => {
    await onDelete?.()
  }

  const { data } = useQuery<GetVideoVariantLanguages>(
    GET_VIDEO_VARIANT_LANGUAGES,
    {
      variables: {
        id: selectedBlock?.video?.id
      },
      skip: selectedBlock?.video?.id == null
    }
  )
  const [language, setLanguage] = useState<string | undefined>()

  useEffect(() => {
    const localLanguage = data?.video?.variantLanguages
      .find((variant) => variant.id === selectedBlock?.videoVariantLanguageId)
      ?.name.find(({ primary }) => !primary)?.value
    const nativeLanguage = data?.video?.variantLanguages
      .find((variant) => variant.id === selectedBlock?.videoVariantLanguageId)
      ?.name.find(({ primary }) => primary)?.value
    let language = localLanguage ?? nativeLanguage
    if (
      language != null &&
      nativeLanguage != null &&
      nativeLanguage !== language
    )
      language = `${language} (${nativeLanguage})`
    setLanguage(language)
  }, [data?.video?.variantLanguages, selectedBlock?.videoVariantLanguageId])

  return (
    <>
      <Box sx={{ px: 6, pt: 4 }}>
        <ImageBlockHeader
          selectedBlock={
            selectedBlock?.video?.image != null || selectedBlock?.image != null
              ? {
                  src: selectedBlock?.video?.image ?? selectedBlock.image,
                  alt:
                    selectedBlock?.video?.title?.[0]?.value ??
                    selectedBlock?.title ??
                    ''
                }
              : null
          }
          header={
            selectedBlock?.video?.title?.[0]?.value == null &&
            selectedBlock?.title == null
              ? 'Select Video File'
              : selectedBlock?.video?.title?.[0]?.value ??
                selectedBlock?.title ??
                ''
          }
          caption={language}
          showDelete={
            showDelete &&
            ((selectedBlock?.source === VideoBlockSource.internal &&
              selectedBlock?.video != null) ||
              (selectedBlock?.source === VideoBlockSource.youTube &&
                selectedBlock?.videoId != null))
          }
          onDelete={handleVideoDelete}
        />
      </Box>
      <Box>
        <Source onChange={onChange} />
        <Divider />
        <VideoBlockEditorSettings
          selectedBlock={selectedBlock}
          posterBlock={posterBlock}
          onChange={onChange}
        />
      </Box>
    </>
  )
}
