import { TreeBlock, EditorContext } from '@core/journeys/ui'
import { ReactElement, useContext } from 'react'
import ImageIcon from '@mui/icons-material/Image'
import Palette from '@mui/icons-material/Palette'
import VerticalSplit from '@mui/icons-material/VerticalSplit'
import Videocam from '@mui/icons-material/Videocam'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import { ThemeMode } from '../../../../../../../__generated__/globalTypes'
import { Attribute } from '../..'
import {
  GetJourney_journey_blocks_CardBlock as CardBlock,
  GetJourney_journey_blocks_ImageBlock as ImageBlock,
  GetJourney_journey_blocks_VideoBlock as VideoBlock
} from '../../../../../../../__generated__/GetJourney'
import { BackgroundColor } from './BackgroundColor'
import { CardStyling } from './CardStyling'
import { CardLayout } from './CardLayout'
import { BackgroundMedia } from './BackgroundMedia'

export function Card({
  id,
  backgroundColor,
  fullscreen,
  themeMode,
  coverBlockId,
  children
}: TreeBlock<CardBlock>): ReactElement {
  const coverBlock = children.find((block) => block.id === coverBlockId) as
    | TreeBlock<ImageBlock | VideoBlock>
    | undefined
  const { dispatch } = useContext(EditorContext)

  const handleBackgroundMediaClick = (): void => {
    dispatch({
      type: 'SetDrawerPropsAction',
      title: 'Background Media Properties',
      mobileOpen: true,
      children: <BackgroundMedia id={id} coverBlock={coverBlock} />
    })
  }

  return (
    <>
      <Attribute
        id={`${id}-background-color`}
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
        onClick={() => {
          dispatch({
            type: 'SetDrawerPropsAction',
            title: 'Background Color Properties',
            mobileOpen: true,
            children: (
              <BackgroundColor id={id} backgroundColor={backgroundColor} />
            )
          })
        }}
      />
      {coverBlock?.__typename === 'ImageBlock' && (
        <Attribute
          id={`${id}-cover-block`}
          icon={<ImageIcon />}
          name="Background"
          value={coverBlock.src.substring(
            coverBlock.src.lastIndexOf('/') + 1,
            coverBlock.src.length
          )}
          description="Background Image"
          onClick={handleBackgroundMediaClick}
        />
      )}
      {coverBlock?.__typename === 'VideoBlock' && (
        <Attribute
          id={`${id}-cover-block`}
          icon={<Videocam />}
          name="Background"
          value={coverBlock.title}
          description="Background Video"
          onClick={handleBackgroundMediaClick}
        />
      )}
      {coverBlock == null && (
        <Attribute
          id={`${id}-cover-block`}
          icon={<ImageIcon />}
          name="Background"
          value="None"
          description="Background Media"
          onClick={handleBackgroundMediaClick}
        />
      )}
      <Attribute
        icon={<Palette />}
        id={`${id}-theme-mode`}
        name="Style"
        value={
          themeMode == null
            ? 'Default'
            : themeMode === ThemeMode.light
            ? 'Light'
            : 'Dark'
        }
        description="Card Styling"
        onClick={() => {
          dispatch({
            type: 'SetDrawerPropsAction',
            title: 'Card Style Property',
            mobileOpen: true,
            children: <CardStyling id={id} themeMode={themeMode} />
          })
        }}
      />
      <Attribute
        icon={<VerticalSplit />}
        id={`${id}-fullscreen`}
        name="Layout"
        value={fullscreen ? 'Expanded' : 'Contained'}
        description="Content Appearance"
        onClick={() => {
          dispatch({
            type: 'SetDrawerPropsAction',
            title: 'Card Layout Property',
            mobileOpen: true,
            children: <CardLayout id={id} fullscreen={fullscreen} />
          })
        }}
      />
    </>
  )
}
