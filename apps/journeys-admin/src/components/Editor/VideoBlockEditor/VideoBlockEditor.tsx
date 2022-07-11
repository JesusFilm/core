import { ReactElement, useEffect, useState } from 'react'
import type { TreeBlock } from '@core/journeys/ui/block'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import { VideoBlockUpdateInput } from '../../../../__generated__/globalTypes'
import {
  GetJourney_journey_blocks_ImageBlock as ImageBlock,
  GetJourney_journey_blocks_VideoBlock as VideoBlock
} from '../../../../__generated__/GetJourney'
import { ImageBlockHeader } from '../ImageBlockHeader'
import { Source } from './Source'
import { VideoBlockEditorSettings } from './Settings'

interface VideoBlockEditorProps {
  selectedBlock: TreeBlock<VideoBlock> | null
  onChange: (input: VideoBlockUpdateInput) => Promise<void>
  showDelete?: boolean
  onDelete?: () => Promise<void>
}

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

  const [language, setLanguage] = useState<string | undefined>()

  useEffect(() => {
    const localLanguage = selectedBlock?.video?.variantLanguages
      .find((variant) => variant.id === selectedBlock?.videoVariantLanguageId)
      ?.name.find(({ primary }) => !primary)?.value
    const nativeLanguage = selectedBlock?.video?.variantLanguages
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
  }, [
    selectedBlock?.video?.variantLanguages,
    selectedBlock?.videoVariantLanguageId
  ])
  return (
    <>
      <Box sx={{ px: 6, pt: 4 }}>
        <ImageBlockHeader
          selectedBlock={
            selectedBlock?.video?.image != null
              ? {
                  src: selectedBlock.video.image,
                  alt: selectedBlock?.video?.title?.[0]?.value
                }
              : null
          }
          header={
            selectedBlock?.video?.title?.[0]?.value == null
              ? 'Select Video File'
              : selectedBlock.video.title[0].value
          }
          caption={language ?? undefined}
          showDelete={showDelete && selectedBlock?.video != null}
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
