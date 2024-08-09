import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { type ReactElement, useState } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import { TabPanel, tabA11yProps } from '@core/shared/ui/TabPanel'
import { ThemeMode, ThemeName, getTheme } from '@core/shared/ui/themes'

import { BlockFields_CardBlock as CardBlock , BlockFields_TypographyBlock as TypographyBlock } from '../../../../../../../../../../__generated__/BlockFields'
import {
  TypographyBlockUpdateColor,
  TypographyBlockUpdateColorVariables
} from '../../../../../../../../../../__generated__/TypographyBlockUpdateColor'
import { DebouncedHexColorPicker } from '../../Card/BackgroundColor/DebouncedHexColorPicker'
import { PaletteColorPicker } from '../../Card/BackgroundColor/PaletteColorPicker'

export const TYPOGRAPHY_BLOCK_UPDATE_COLOR = gql`
  mutation TypographyBlockUpdateColor($id: ID!, $customColor: String!) {
    typographyBlockUpdate(id: $id, input: { customColor: $customColor }) {
      id
      customColor
    }
  }
`

export function Color(): ReactElement {
  const [typographyBlockUpdate] = useMutation<
    TypographyBlockUpdateColor,
    TypographyBlockUpdateColorVariables
  >(TYPOGRAPHY_BLOCK_UPDATE_COLOR)
  const { add } = useCommand()
  const {
    state: { selectedBlock: stateSelectedBlock, selectedStep },
    dispatch
  } = useEditor()
  const { journey } = useJourney()
  const { rtl, locale } = getJourneyRTL(journey)
  const { t } = useTranslation('apps-journeys-admin')

  const selectedBlock = stateSelectedBlock as
    | TreeBlock<TypographyBlock>
    | undefined

  const card = selectedStep?.children.find(
    (block) => block.__typename === 'CardBlock'
  ) as TreeBlock<CardBlock> | undefined

  const theme = getTheme({
    themeName: card?.themeName ?? journey?.themeName ?? ThemeName.base,
    themeMode: card?.themeMode ?? journey?.themeMode ?? ThemeMode.dark,
    rtl,
    locale
  })

  const [tabValue, setTabValue] = useState(0)
  const selectedColor = selectedBlock?.customColor ?? theme.palette.primary.main

const palette = [
  { light: theme.palette.text.primary, dark: theme.palette.text.primary },
  { light: theme.palette.text.secondary, dark: theme.palette.text.secondary },
  { light: theme.palette.error.main, dark: theme.palette.error.main },
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

  function handleTabChange(_event, newValue: number): void {
    setTabValue(newValue)
  }

  function handleColorChange(color: string): void {
    if (selectedBlock == null || color == null) return

      add({
        parameters: {
          execute: { color },
          undo: {
            customColor: selectedBlock.customColor
          }
        },
        execute({ color }) {
          dispatch({
            type: 'SetEditorFocusAction',
            selectedStep,
            selectedBlock
          })
          void typographyBlockUpdate({
            variables: {
              id: selectedBlock.id,
              customColor: color
            },
            optimisticResponse: {
              typographyBlockUpdate: {
                id: selectedBlock.id,
                customColor: color,
                __typename: 'TypographyBlock'
              }
            }
          })
        }
      })
  }

  const palettePicker = (
    <PaletteColorPicker
        selectedColor={selectedColor}
        colors={palette}
        mode="dark"
        onChange={handleColorChange}
      />
  )

  const hexColorPicker = (
    <Box sx={{ p: 4}}>
      <DebouncedHexColorPicker
        data-testid="TextColorPicker"
        color={selectedColor}
        onChange={handleColorChange}
        style={{ width: '100%', height: 125 }}
      />
    </Box>
  )


  return (
    <>
      <Box
        sx={{
          display: { sm: 'block', md: 'none'}
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="color tabs"
          variant="fullWidth"
          centered
        >
          <Tab label={t('Palette')} {...tabA11yProps('typography-color', 0)} />
          <Tab label={t('Custom')} {...tabA11yProps('typography-color', 1)} />
        </Tabs>
        <Divider />
        <TabPanel name="typography-color" value={tabValue} index={0}>
          {palettePicker}
        </TabPanel>
        <TabPanel name="typography-color" value={tabValue} index={1}>
          {hexColorPicker}
        </TabPanel>
      </Box>
      <Box sx={{ display: { sm: 'none', md: 'block' }}}>
        <Divider />
        <Box sx={{ p: 4, pb: 0}}>
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
