import { ReactElement, useEffect, useState, MouseEvent } from 'react'
import Box from '@mui/material/Box'
import {
  ToggleButton,
  ToggleButtonGroup,
  useMediaQuery,
  Theme,
  Divider
} from '@mui/material'
import { Image as ImageIcon, Videocam } from '@mui/icons-material'
import { useEditor, TreeBlock } from '@core/journeys/ui'
import { GetJourney_journey_blocks_CardBlock as CardBlock } from '../../../../../../../../__generated__/GetJourney'
import { BackgroundMediaImage } from './Image/BackgroundMediaImage'
import { BackgroundMediaVideo } from './Video/BackgroundMediaVideo'

export function BackgroundMedia(): ReactElement {
  const {
    state: { selectedBlock }
  } = useEditor()

  const cardBlock = (
    selectedBlock?.__typename === 'CardBlock'
      ? selectedBlock
      : selectedBlock?.children.find(
          (child) => child.__typename === 'CardBlock'
        )
  ) as TreeBlock<CardBlock>

  const coverBlock =
    cardBlock?.children.find((child) => child.id === cardBlock?.coverBlockId) ??
    null

  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  const [blockType, setBlockType] = useState(
    coverBlock?.__typename.toString() ?? 'VideoBlock'
  )
  useEffect(() => {
    setBlockType(coverBlock?.__typename.toString() ?? 'VideoBlock')
  }, [setBlockType, coverBlock])

  const handleTypeChange = (
    event: MouseEvent<HTMLElement>,
    selected: string
  ): void => {
    setBlockType(selected)
  }

  return (
    <>
      <Box sx={{ width: '100%', textAlign: 'center', py: 4 }}>
        <ToggleButtonGroup
          value={blockType}
          onChange={handleTypeChange}
          aria-label="block type"
          exclusive
          color="primary"
        >
          <ToggleButton
            value="VideoBlock"
            aria-label="video"
            data-testid="bgvideo-video-tab"
          >
            <Videocam></Videocam> Video
          </ToggleButton>
          <ToggleButton
            value="ImageBlock"
            aria-label="image"
            data-testid="bgvideo-image-tab"
          >
            <ImageIcon></ImageIcon> Image
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      {smUp && <Divider />}
      {blockType === 'ImageBlock' && (
        <BackgroundMediaImage cardBlock={cardBlock} />
      )}
      {blockType === 'VideoBlock' && <BackgroundMediaVideo />}
    </>
  )
}
