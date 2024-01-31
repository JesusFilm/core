import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { MouseEvent, ReactElement, useState } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import Image3Icon from '@core/shared/ui/icons/Image3'
import VideoOnIcon from '@core/shared/ui/icons/VideoOn'

import { GetJourney_journey_blocks_CardBlock as CardBlock } from '../../../../../../../../__generated__/GetJourney'
import { setBeaconPageViewed } from '../../../../../../../libs/setBeaconPageViewed'
import { palette } from '../../../../../../ThemeProvider/admin/tokens/colors'

import { BackgroundMediaVideo } from './Video/BackgroundMediaVideo'

const BackgroundMediaImage = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/ControlPanel/Attributes/blocks/Card/BackgroundMedia/Image/BackgroundMediaImage" */ './Image/BackgroundMediaImage'
    ).then((mod) => mod.BackgroundMediaImage),
  { ssr: false }
)

export function BackgroundMedia(): ReactElement {
  const router = useRouter()
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
    if (selected != null) {
      setBlockType(selected)

      const param =
        selected === 'VideoBlock' ? 'background-video' : 'background-image'

      router.query.param = param
      void router.push(router)
      router.events.on('routeChangeComplete', () => {
        setBeaconPageViewed(
          selected === 'VideoBlock' ? 'Background Video' : 'Background Image'
        )
      })
    }
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
      <Box sx={{ width: '100%', textAlign: 'center', pb: 4 }}>
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
              <VideoOnIcon />
              <span>Video</span>
            </Stack>
          </ToggleButton>
          <ToggleButton
            value="ImageBlock"
            aria-label="image"
            data-testid="bgvideo-image-tab"
          >
            <Stack direction="row" spacing="8px">
              <Image3Icon />
              <span>Image</span>
            </Stack>
          </ToggleButton>
        </StyledToggleButtonGroup>
      </Box>
      {blockType === 'ImageBlock' && (
        <Box sx={{ px: 4, pb: 4 }}>
          <BackgroundMediaImage cardBlock={cardBlock} />
        </Box>
      )}
      {blockType === 'VideoBlock' && (
        <BackgroundMediaVideo cardBlock={cardBlock} />
      )}
    </>
  )
}
