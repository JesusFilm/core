import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'
import { object, string } from 'yup'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import {
  ActiveContent,
  ActiveSlide,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import Edit2Icon from '@core/shared/ui/icons/Edit2'
import { TabPanel, tabA11yProps } from '@core/shared/ui/TabPanel'
import { ThemeMode, ThemeName, getTheme } from '@core/shared/ui/themes'

import { CardBlockBackgroundColorUpdate } from '../../../../../../../../../../__generated__/CardBlockBackgroundColorUpdate'
import { CardFields } from '../../../../../../../../../../__generated__/CardFields'
import { journeyUpdatedAtCacheUpdate } from '../../../../../../../../../libs/journeyUpdatedAtCacheUpdate'
import { TextFieldForm } from '../../../../../../../../TextFieldForm'

import { DebouncedHexColorPicker } from './DebouncedHexColorPicker'
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
    if (cardBlock != null && journey != null) {
      add({
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
            },
            update(cache) {
              journeyUpdatedAtCacheUpdate(cache, journey.id)
            }
          })
        }
      })
    }
  }

  function isValidHex(color: string): boolean {
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/
    return hexColorRegex.test(color)
  }

  const validationSchema = object({
    color: string()
      .required(t('Invalid {{ HEX }} color code', { HEX: 'HEX' }))
      .test(
        'valid-hex-color',
        t('Invalid {{ HEX }} color code', { HEX: 'HEX' }),
        (value) => {
          if (isValidHex(value)) {
            void handleColorChange(value)
            return true
          }
        }
      )
  })

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
      <DebouncedHexColorPicker
        data-testid="bgColorPicker"
        color={selectedColor}
        onChange={handleColorChange}
        style={{ width: '100%', height: 125 }}
      />
    </Box>
  )

  return (
    <>
      <Stack
        sx={{ p: 4, pt: 0 }}
        spacing={3}
        direction="row"
        data-testid="BackgroundColor"
      >
        <Swatch id={`bg-color-${selectedColor}`} color={selectedColor} />
        <TextFieldForm
          id="color"
          data-testid="bgColorTextField"
          hiddenLabel
          initialValue={selectedColor}
          validationSchema={validationSchema}
          onSubmit={handleColorChange}
          startIcon={
            <InputAdornment position="start">
              <Edit2Icon
                onClick={(e) => handleTabChange(e, 1)}
                style={{ cursor: 'pointer' }}
              />
            </InputAdornment>
          }
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
