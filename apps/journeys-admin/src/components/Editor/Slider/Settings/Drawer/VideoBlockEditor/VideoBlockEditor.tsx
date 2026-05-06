import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import dynamic from 'next/dynamic'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useEffect, useState } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useFlags } from '@core/shared/ui/FlagsProvider'

import {
  BlockFields_ImageBlock as ImageBlock,
  BlockFields_VideoBlock as VideoBlock
} from '../../../../../../../__generated__/BlockFields'
import { VideoBlockUpdateInput } from '../../../../../../../__generated__/globalTypes'
import { BlockCustomizationToggle } from '../../CanvasDetails/Properties/controls/BlockCustomizationToggle'

import { Source } from './Source'

const VideoBlockEditorSettings = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/VideoBlockEditor/Settings/VideoBlockEditorSettings" */ './Settings/VideoBlockEditorSettings'
    ).then((mod) => mod.VideoBlockEditorSettings),
  { ssr: false }
)

interface VideoBlockEditorProps {
  selectedBlock: TreeBlock<VideoBlock> | null
  onChange: (
    input: VideoBlockUpdateInput,
    shouldFocus?: boolean
  ) => Promise<void>
}

export function VideoBlockEditor({
  selectedBlock,
  onChange
}: VideoBlockEditorProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { customizableMedia } = useFlags()
  const { journey } = useJourney()
  const posterBlock = selectedBlock?.children.find(
    (child) => child.id === (selectedBlock as VideoBlock).posterBlockId
  ) as ImageBlock | null

  const videoBlock = selectedBlock as VideoBlock
  const [notesInputValue, setNotesInputValue] = useState(
    videoBlock?.notes ?? ''
  )

  useEffect(() => {
    setNotesInputValue(videoBlock?.notes ?? '')
  }, [videoBlock?.notes])

  function handleNotesBlur(): void {
    const trimmed = notesInputValue.trim()
    if (videoBlock != null && trimmed !== (videoBlock.notes ?? '').trim()) {
      void onChange({ notes: trimmed || null })
    }
  }

  return (
    <>
      <Stack sx={{ p: 4, pt: 0 }} gap={4} data-testid="VideoBlockEditor">
        <Source
          key={selectedBlock?.videoId}
          selectedBlock={selectedBlock}
          onChange={onChange}
        />
        {journey?.template && (customizableMedia ?? false) && (
          <>
            <BlockCustomizationToggle
              block={selectedBlock ?? undefined}
              mediaTypeWhenEmpty="video"
            />
            <Collapse in={videoBlock?.customizable ?? false} unmountOnExit>
              <TextField
                fullWidth
                size="small"
                label={t('Template Adapter Notes (opt.)')}
                placeholder={t('e.g. trailer, intro')}
                value={notesInputValue}
                onChange={(e) => setNotesInputValue(e.target.value)}
                onBlur={handleNotesBlur}
                inputProps={{
                  'aria-label': t('Template Adapter Notes'),
                  maxLength: 100
                }}
                helperText={
                  notesInputValue.length >= 100
                    ? t('Maximum 100 characters')
                    : undefined
                }
              />
            </Collapse>
          </>
        )}
      </Stack>

      {videoBlock?.videoId != null && (
        <Box pb={4}>
          <VideoBlockEditorSettings
            selectedBlock={selectedBlock}
            posterBlock={posterBlock}
            onChange={onChange}
          />
        </Box>
      )}
    </>
  )
}
