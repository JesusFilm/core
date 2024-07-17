import { ApolloCache, gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import debounce from 'lodash/debounce'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useRef, useState } from 'react'
import { HexColorPicker } from 'react-colorful'

import {
  ActiveContent,
  ActiveSlide,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import type { TreeBlock } from '@core/journeys/ui/block'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import { TabPanel, tabA11yProps } from '@core/shared/ui/TabPanel'
import Edit2Icon from '@core/shared/ui/icons/Edit2'
import { ThemeMode, ThemeName, getTheme } from '@core/shared/ui/themes'

import { CardBlockBackgroundColorUpdate } from '../../../../../../../../../../__generated__/CardBlockBackgroundColorUpdate'
import { CardFields } from '../../../../../../../../../../__generated__/CardFields'

import { useCommand } from '@core/journeys/ui/CommandProvider'
import { BlockFields_StepBlock as StepBlock } from '@core/journeys/ui/block/__generated__/BlockFields'
import { PaletteColorPicker } from './PaletteColorPicker'
import { Swatch } from './Swatch'

const palette = [
  { dark: '#C62828', light: '#FFCDD2' },
  { dark: '#AD1457', light: '#F48FB1' },
  { dark: '#6A1B9A', light: '#CE93D8' },
  { dark: '#4527A0', light: '#B39DDB' },
  { dark: '#283593', light: '#9FA8DA' },
  { dark: '#1565C0', light: '#90CAF9' },
  { dark: '#0277BD', light: '#81D4FA' },
  { dark: '#006064', light: '#80DEEA' },
  { dark: '#00695C', light: '#80CBC4' },
  { dark: '#2E7D32', light: '#C8E6C9' },
  { dark: '#33691E', light: '#C5E1A5' },
  { dark: '#4E342E', light: '#D7CCC8' },
  { dark: '#424242', light: '#E0E0E0' },
  { dark: '#37474F', light: '#B0BEC5' },
  { dark: '#30313D', light: '#FEFEFE' }
]

export const CARD_BLOCK_BACKGROUND_COLOR_UPDATE = gql`
  mutation CardBlockBackgroundColorUpdate(
    $id: ID!
    $journeyId: ID!
    $input: CardBlockUpdateInput!
  ) {
    cardBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
      backgroundColor
    }
  }
`

export function BackgroundColor(): ReactElement {
  const [cardBlockUpdate] = useMutation<CardBlockBackgroundColorUpdate>(
    CARD_BLOCK_BACKGROUND_COLOR_UPDATE
  )

  const {
    state: { selectedBlock, selectedStep, activeContent },
    dispatch
  } = useEditor()
  const { add } = useCommand()

  const cardBlock = (
    selectedBlock?.__typename === 'CardBlock'
      ? selectedBlock
      : selectedBlock?.children.find(
          (child) => child.__typename === 'CardBlock'
        )
  ) as TreeBlock<CardFields> | undefined

  const { journey } = useJourney()
  const { rtl, locale } = getJourneyRTL(journey)

  const cardTheme = getTheme({
    themeName: cardBlock?.themeName ?? journey?.themeName ?? ThemeName.base,
    themeMode: cardBlock?.themeMode ?? journey?.themeMode ?? ThemeMode.dark,
    rtl,
    locale
  })

  const [tabValue, setTabValue] = useState(0)
  const prevColor = useRef(
    cardBlock?.backgroundColor ?? cardTheme.palette.background.paper
  )
  const [selectedColor, setSelectedColor] = useState(
    cardBlock?.backgroundColor ?? cardTheme.palette.background.paper
  )

  const handleTabChange = (_event, newValue: number): void => {
    setTabValue(newValue)
  }

  const changeCardColor = async (color: string): Promise<void> => {
    if (journey == null) return
    if (cardBlock != null) {
      const setEditorState = (
        selectedStep: TreeBlock<StepBlock> | undefined
      ): void => {
        dispatch({
          type: 'SetCommandStateAction',
          activeSlide: ActiveSlide.Content,
          selectedStep: selectedStep,
          activeContent: ActiveContent.Canvas
        })
      }
      const cardBlockColorCacheUpdate = (
        // biome-ignore lint/suspicious/noExplicitAny:
        cache: ApolloCache<any>,
        data: CardBlockBackgroundColorUpdate | null | undefined
      ): void => {
        if (data?.cardBlockUpdate != null) {
          cache.modify({
            id: cache.identify({
              __typename: 'CardBlock',
              id: cardBlock.id
            }),
            fields: {
              backgroundColor: () => data.cardBlockUpdate.backgroundColor
            }
          })
        }
      }
      add({
        parameters: {
          execute: {
            selectedStep: selectedStep,
            cardBlock: cardBlock,
            journeyId: journey.id,
            undoColor: selectedColor
          },
          undo: {
            undoColor: selectedColor,
            selectedStep: selectedStep,
            cardBlock: cardBlock,
            journeyId: journey.id
          }
        },
        execute: async ({ selectedStep, cardBlock, journeyId, undoColor }) => {
          setEditorState(selectedStep)
          setSelectedColor(color)
          await cardBlockUpdate({
            variables: {
              id: cardBlock.id,
              journeyId: journeyId,
              input: {
                backgroundColor: color === 'null' ? null : color
              }
            },

            update(cache, { data }) {
              cardBlockColorCacheUpdate(cache, data)
            },
            onError: () => {
              setSelectedColor(undoColor)
            }
          })
        },
        undo: async ({ undoColor, selectedStep, cardBlock, journeyId }) => {
          setEditorState(selectedStep)
          await cardBlockUpdate({
            variables: {
              id: cardBlock.id,
              journeyId: journeyId,
              input: {
                backgroundColor: undoColor
              }
            },
            update(cache, { data }) {
              cardBlockColorCacheUpdate(cache, data)
            }
          })
          setSelectedColor(undoColor)
        }
      })
    }
    prevColor.current = color
  }

  const handleColorChange = async (color: string): Promise<void> => {
    void debouncedColorChange(color.toUpperCase())
    setSelectedColor(color)
  }

  const debouncedColorChange = useRef(
    debounce(async (color: string) => {
      void changeCardColor(color)
    }, 100)
  ).current

  useEffect(() => {
    return () => {
      debouncedColorChange.cancel()
    }
  }, [debouncedColorChange])

  const palettePicker = (
    <PaletteColorPicker
      selectedColor={selectedColor}
      colors={palette}
      mode={cardTheme.palette.mode}
      onChange={handleColorChange}
    />
  )

  // TODO: Test onChange in E2E
  const hexColorPicker = (
    <Box sx={{ p: 4 }}>
      <HexColorPicker
        data-testid="bgColorPicker"
        color={selectedColor}
        onChange={handleColorChange}
        style={{ width: '100%', height: 125 }}
      />
    </Box>
  )

  const { t } = useTranslation('apps-journeys-admin')

  return (
    <>
      <Stack
        sx={{ p: 4, pt: 0 }}
        spacing={3}
        direction="row"
        data-testid="BackgroundColor"
      >
        <Swatch id={`bg-color-${selectedColor}`} color={selectedColor} />
        <TextField
          data-testid="bgColorTextField"
          variant="filled"
          hiddenLabel
          value={selectedColor}
          onChange={async (e) => await handleColorChange(e.target.value)}
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Edit2Icon
                  onClick={(e) => handleTabChange(e, 1)}
                  style={{ cursor: 'pointer' }}
                />
              </InputAdornment>
            )
          }}
        />
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
      <Box sx={{ [cardTheme.breakpoints.down('sm')]: { display: 'none' } }}>
        <Divider />
        <Box sx={{ p: 4, pb: 0 }}>
          <Typography variant="subtitle2">{t('Palette')}</Typography>
        </Box>
        {palettePicker}
        <Divider />
        <Box sx={{ p: 4, pb: 0 }}>
          <Typography variant="subtitle2">{t('Custom')}</Typography>
        </Box>
        {hexColorPicker}
      </Box>
    </>
  )
}
