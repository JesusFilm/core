import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import {
  ActiveContent,
  ActiveSlide,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import { TabPanel, tabA11yProps } from '@core/shared/ui/TabPanel'
import { ThemeMode, ThemeName, getTheme } from '@core/shared/ui/themes'

import { CardBlockBackgroundColorUpdate } from '../../../../../../../../../../__generated__/CardBlockBackgroundColorUpdate'
import { CardFields } from '../../../../../../../../../../__generated__/CardFields'

import { ColorOpacityField } from './ColorOpacityField'
import { DebouncedHexColorPicker } from './DebouncedHexColorPicker'
import { PaletteColorPicker } from './PaletteColorPicker'
import { Swatch } from './Swatch'

const palette = [
  '#FFFFFF',
  '#F2F3F6',
  '#D1D5DB',
  '#6B7280',
  '#1F2937',
  '#DC2626',
  '#C7E834',
  '#10B981',
  '#8B5CF6',
  '#6B21A8',
  '#F97316',
  '#84CC16',
  '#14B8A6',
  '#6366F1',
  '#EC4899',
  '#F59E0B',
  '#6C7A36',
  '#06B6D4',
  '#2563EB',
  '#F43F5E',
  '#EAB308',
  '#4B3E2A',
  '#3B82F6',
  '#1E3A8A',
  '#991B1B'
]

export const CARD_BLOCK_BACKGROUND_COLOR_UPDATE = gql`
  mutation CardBlockBackgroundColorUpdate(
    $id: ID!
    $input: CardBlockUpdateInput!
  ) {
    cardBlockUpdate(id: $id, input: $input) {
      id
      backgroundColor
    }
  }
`

export function BackgroundColor(): ReactElement {
  const {
    state: { selectedBlock, selectedStep },
    dispatch
  } = useEditor()
  const { journey } = useJourney()
  const { rtl, locale } = getJourneyRTL(journey)
  const { add } = useCommand()
  const [cardBlockUpdate] = useMutation<CardBlockBackgroundColorUpdate>(
    CARD_BLOCK_BACKGROUND_COLOR_UPDATE
  )
  const { t } = useTranslation('apps-journeys-admin')

  const cardBlock = (
    selectedBlock?.__typename === 'CardBlock'
      ? selectedBlock
      : selectedBlock?.children.find(
          (child) => child.__typename === 'CardBlock'
        )
  ) as TreeBlock<CardFields> | undefined

  const cardTheme = getTheme({
    themeName: cardBlock?.themeName ?? journey?.themeName ?? ThemeName.base,
    themeMode: cardBlock?.themeMode ?? journey?.themeMode ?? ThemeMode.dark,
    rtl,
    locale
  })
  const [tabValue, setTabValue] = useState(0)
  const selectedColor =
    cardBlock?.backgroundColor ?? cardTheme.palette.background.paper

  function handleTabChange(_event, newValue: number): void {
    setTabValue(newValue)
  }

  async function handleColorChange(color: string): Promise<void> {
    if (cardBlock != null) {
      await add({
        parameters: {
          execute: {
            color: color.toUpperCase()
          },
          undo: {
            color: selectedColor
          }
        },
        execute: async ({ color }) => {
          dispatch({
            type: 'SetEditorFocusAction',
            activeSlide: ActiveSlide.Content,
            selectedStep,
            activeContent: ActiveContent.Canvas
          })
          await cardBlockUpdate({
            variables: {
              id: cardBlock.id,
              input: {
                backgroundColor: color === 'null' ? null : color
              }
            },
            optimisticResponse: {
              cardBlockUpdate: {
                id: cardBlock.id,
                __typename: 'CardBlock',
                backgroundColor: color === 'null' ? null : color
              }
            }
          })
        }
      })
    }
  }

  const palettePicker = (
    <PaletteColorPicker
      selectedColor={selectedColor}
      colors={palette}
      onChange={handleColorChange}
    />
  )

  // TODO: Test onChange in E2E
  const hexColorPicker = (
    <Stack sx={{ p: 4 }} spacing={4}>
      <DebouncedHexColorPicker
        data-testid="bgColorPicker"
        color={selectedColor}
        onChange={handleColorChange}
        style={{ width: '100%', height: 125 }}
      />
    </Stack>
  )

  return (
    <>
      {hexColorPicker}
      <Stack
        sx={{ p: 4, pt: 0 }}
        spacing={3}
        direction="row"
        data-testid="BackgroundColor"
      >
        <Swatch id={`bg-color-${selectedColor}`} color={selectedColor} />
        <ColorOpacityField
          color={selectedColor}
          onColorChange={handleColorChange}
          onEditClick={() => handleTabChange({}, 1)}
          data-testid="BackgroundColorOpacityField"
        />
      </Stack>
      <Stack
        sx={{
          [cardTheme.breakpoints.down('sm')]: { display: 'none' },
          alignItems: 'center'
        }}
      >
        <Box sx={{ width: '100%' }}>{palettePicker}</Box>
      </Stack>
      <Box
        sx={{
          [cardTheme.breakpoints.up('sm')]: {
            display: 'none'
          }
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="background tabs"
          variant="fullWidth"
          centered
        >
          <Tab label={t('Palette')} {...tabA11yProps('background-color', 0)} />
          <Tab label={t('Custom')} {...tabA11yProps('background-color', 1)} />
        </Tabs>
        <Divider />
        <TabPanel name="background-color" value={tabValue} index={0}>
          {palettePicker}
        </TabPanel>
        <TabPanel name="background-color" value={tabValue} index={1}>
          {hexColorPicker}
        </TabPanel>
      </Box>
    </>
  )
}
