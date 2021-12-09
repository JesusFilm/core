import { TreeBlock } from '@core/journeys/ui'
import { ReactElement, useContext } from 'react'
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
import { EditorContext } from '../../../../Context'
import { BackgroundColor } from './BackgroundColor'
import { CardStyling } from './CardStyling'
import { ContentAppearance } from './ContentAppearance'
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
      title: 'Background Media Property',
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
            children: <ContentAppearance id={id} fullscreen={fullscreen} />
          })
        }}
      />
    </>
  )
}
