import { ReactElement, useContext, useState } from 'react'
import { TreeBlock, EditorContext } from '@core/journeys/ui'
import ImageIcon from '@mui/icons-material/Image'
import Palette from '@mui/icons-material/Palette'
import VerticalSplit from '@mui/icons-material/VerticalSplit'
import Videocam from '@mui/icons-material/Videocam'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import { gql, useMutation } from '@apollo/client'
import {
  CardBlockUpdateInput,
  ThemeMode
} from '../../../../../../../__generated__/globalTypes'
import { Attribute } from '../..'
import {
  GetJourneyForEdit_journey_blocks_CardBlock as CardBlock,
  GetJourneyForEdit_journey_blocks_ImageBlock as ImageBlock,
  GetJourneyForEdit_journey_blocks_VideoBlock as VideoBlock
} from '../../../../../../../__generated__/GetJourneyForEdit'
import { BackgroundColor } from './BackgroundColor'
import { CardStyling } from './CardStyling'
import { CardLayout } from './CardLayout'
import { BackgroundMedia } from './BackgroundMedia'

export const CARD_BLOCK_UPDATE = gql`
  mutation CardBlockUpdate(
    $id: ID!
    $journeyId: ID!
    $input: CardBlockUpdateInput!
  ) {
    cardBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
    }
  }
`

export function Card({
  id,
  journeyId,
  backgroundColor,
  fullscreen,
  themeMode,
  coverBlockId,
  children
}: TreeBlock<CardBlock>): ReactElement {
  const [cardBlockUpdate] = useMutation<CardBlockUpdateInput>(CARD_BLOCK_UPDATE)
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

  const [selectedThemeMode, setThemeMode] = useState(themeMode)
  const [selectedBgColor, setBgColor] = useState(backgroundColor)

  const handleStyleChange = async (selected: ThemeMode): Promise<void> => {
    setThemeMode(selected)
    await cardBlockUpdate({
      variables: {
        id: id,
        journeyId: journeyId,
        input: {
          themeMode: selected
        }
      }
    })
  }

  const handleBgColorChange = async (selected: string): Promise<void> => {
    setBgColor(selected)
    await cardBlockUpdate({
      variables: {
        id: id,
        journeyId: journeyId,
        input: {
          backgroundColor: selected
        }
      }
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
                  selectedBgColor ?? theme.palette.text.primary
              }}
            />
          </Paper>
        }
        name="Color"
        value={selectedBgColor?.toUpperCase() ?? 'None'}
        description="Background Color"
        onClick={() => {
          dispatch({
            type: 'SetDrawerPropsAction',
            title: 'Background Color Properties',
            mobileOpen: true,
            children: (
              <BackgroundColor
                id={id}
                backgroundColor={selectedBgColor}
                journeyId={journeyId}
                onSubmit={handleBgColorChange}
              />
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
          selectedThemeMode == null
            ? 'Default'
            : selectedThemeMode === ThemeMode.dark
            ? 'Dark'
            : 'Light'
        }
        description="Card Styling"
        onClick={() => {
          dispatch({
            type: 'SetDrawerPropsAction',
            title: 'Card Style Property',
            mobileOpen: true,
            children: (
              <CardStyling
                id={id}
                journeyId={journeyId}
                themeMode={selectedThemeMode}
                onSelect={handleStyleChange}
              />
            )
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
