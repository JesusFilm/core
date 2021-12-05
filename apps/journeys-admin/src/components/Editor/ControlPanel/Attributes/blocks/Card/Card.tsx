import { TreeBlock } from '@core/journeys/ui'
import { ReactElement } from 'react'
import {
  GetJourneyForEdit_journey_blocks_CardBlock as CardBlock,
  GetJourneyForEdit_journey_blocks_ImageBlock as ImageBlock,
  GetJourneyForEdit_journey_blocks_VideoBlock as VideoBlock
} from '../../../../../../../__generated__/GetJourneyForEdit'
import { Attribute } from '../..'
import {
  Image as ImageIcon,
  Palette,
  VerticalSplit,
  Videocam
} from '@mui/icons-material'
import { ThemeMode } from '../../../../../../../__generated__/globalTypes'
import { Paper, Box } from '@mui/material'

export function Card({
  backgroundColor,
  fullscreen,
  themeMode,
  coverBlockId,
  children
}: TreeBlock<CardBlock>): ReactElement {
  const coverBlock = children.find((block) => block.id === coverBlockId) as
    | TreeBlock<ImageBlock | VideoBlock>
    | undefined

  return (
    <>
      <Attribute
        icon={
          <Paper sx={{ borderRadius: 1000, overflow: 'hidden' }}>
            <Box
              data-testid="backgroundColorIcon"
              sx={{
                width: 25,
                height: 25,
                m: 1,
                borderRadius: 1000,
                backgroundColor: (theme) =>
                  backgroundColor ?? theme.palette.text.primary
              }}
            />
          </Paper>
        }
        name="Color"
        value={backgroundColor?.toUpperCase() ?? 'None'}
        description="Background Color"
      />
      {coverBlock?.__typename === 'ImageBlock' && (
        <Attribute
          icon={<ImageIcon />}
          name="Cover"
          value={coverBlock.src.substring(
            coverBlock.src.lastIndexOf('/') + 1,
            coverBlock.src.length
          )}
          description="Background Image"
        />
      )}
      {coverBlock?.__typename === 'VideoBlock' && (
        <Attribute
          icon={<Videocam />}
          name="Cover"
          value={coverBlock.title}
          description="Background Video"
        />
      )}
      <Attribute
        icon={<Palette />}
        name="Style"
        value={
          themeMode == null
            ? 'Default'
            : themeMode === ThemeMode.light
            ? 'Light'
            : 'Dark'
        }
        description="Card Styling"
      />
      <Attribute
        icon={<VerticalSplit />}
        name="Layout"
        value={fullscreen ? 'Expanded' : 'Contained'}
        description="Content Appearance"
      />
    </>
  )
}
