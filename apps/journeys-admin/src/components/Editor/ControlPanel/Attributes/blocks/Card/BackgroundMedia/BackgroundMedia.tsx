import { ReactElement, useState, MouseEvent } from 'react'
import Box from '@mui/material/Box'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'
import ImageIcon from '@mui/icons-material/Image'
import Videocam from '@mui/icons-material/Videocam'
import { useEditor, TreeBlock } from '@core/journeys/ui'
import { GetJourney_journey_blocks_CardBlock as CardBlock } from '../../../../../../../../__generated__/GetJourney'
import { palette } from '../../../../../../ThemeProvider/admin/tokens/colors'
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

  const [blockType, setBlockType] = useState(
    coverBlock?.__typename.toString() ?? 'VideoBlock'
  )

  const handleTypeChange = (
    event: MouseEvent<HTMLElement>,
    selected: string
  ): void => {
    if (selected != null) setBlockType(selected)
  }

  const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
    '& .MuiToggleButtonGroup-grouped': {
      paddingLeft: 30,
      paddingRight: 30,
      paddingTop: 12,
      paddingBottom: 12,
      borderRadius: 8,
      backgroundColor: theme.palette[0],
      '&.Mui-selected': {
        backgroundColor: theme.palette[100],
        color: palette.error
      }
    }
  }))

  return (
    <>
      <Box sx={{ width: '100%', textAlign: 'center', py: 4 }}>
        <StyledToggleButtonGroup
          value={blockType}
          onChange={handleTypeChange}
          aria-label="block type"
          exclusive
        >
          <ToggleButton
            value="VideoBlock"
            aria-label="video"
            data-testid="bgvideo-video-tab"
          >
            <Stack direction="row" spacing="8px">
              <Videocam />
              <span>Video</span>
            </Stack>
          </ToggleButton>
          <ToggleButton
            value="ImageBlock"
            aria-label="image"
            data-testid="bgvideo-image-tab"
          >
            <Stack direction="row" spacing="8px">
              <ImageIcon />
              <span>Image</span>
            </Stack>
          </ToggleButton>
        </StyledToggleButtonGroup>
      </Box>
      {blockType === 'ImageBlock' && (
        <BackgroundMediaImage cardBlock={cardBlock} />
      )}
      {blockType === 'VideoBlock' && (
        <BackgroundMediaVideo cardBlock={cardBlock} />
      )}
    </>
  )
}
