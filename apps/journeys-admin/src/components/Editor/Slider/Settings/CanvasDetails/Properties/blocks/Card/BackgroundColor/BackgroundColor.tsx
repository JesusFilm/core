import { gql, useApolloClient, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'
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
import BlurIcon from '@core/shared/ui/icons/Blur'
import Edit2Icon from '@core/shared/ui/icons/Edit2'
import { TabPanel, tabA11yProps } from '@core/shared/ui/TabPanel'
import { ThemeMode, ThemeName, getTheme } from '@core/shared/ui/themes'

import { CardBlockBackgroundColorUpdate } from '../../../../../../../../../../__generated__/CardBlockBackgroundColorUpdate'
import { CardFields } from '../../../../../../../../../../__generated__/CardFields'
import { TextFieldForm } from '../../../../../../../../TextFieldForm'
import { PropertiesSlider } from '../BackgroundMedia/Image/controls/PropertiesSlider'

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

export const CARD_BLOCK_BACKDROP_BLUR_UPDATE = gql`
  mutation CardBlockBackdropBlurUpdate(
    $id: ID!
    $input: CardBlockUpdateInput!
  ) {
    cardBlockUpdate(id: $id, input: $input) {
      id
      backdropBlur
    }
  }
`

const UPDATE_BACKDROP_BLUR_FRAGMENT = gql`
  fragment UpdateBackdropBlur on CardBlock {
    backdropBlur
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
  const client = useApolloClient()
  const [cardBlockUpdate] = useMutation<CardBlockBackgroundColorUpdate>(
    CARD_BLOCK_BACKGROUND_COLOR_UPDATE
  )
  const [cardBlockBackdropBlurUpdate] = useMutation(
    CARD_BLOCK_BACKDROP_BLUR_UPDATE
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
  // Store blur as percentage (0-100%), convert to pixels when needed
  const [blurPercentage, setBlurPercentage] = useState(
    Math.round(((cardBlock?.backdropBlur ?? 20) / 25) * 100)
  )

  // Local state for input field value (separate from slider percentage)
  const [inputValue, setInputValue] = useState(`${blurPercentage}%`)

  const selectedColor =
    cardBlock?.backgroundColor ?? cardTheme.palette.background.paper

  // Update blur percentage when cardBlock changes
  useEffect(() => {
    const pixelValue = cardBlock?.backdropBlur ?? 20
    const percentageValue = Math.round((pixelValue / 25) * 100)
    setBlurPercentage(percentageValue)
    setInputValue(`${percentageValue}%`)
  }, [cardBlock?.backdropBlur])

  function handleTabChange(_event, newValue: number): void {
    setTabValue(newValue)
  }

  function handleBlurSliderChange(_: Event, newValue: number): void {
    setBlurPercentage(newValue)
    setInputValue(`${newValue}%`) // Update input field to match slider

    // Convert percentage to pixels for cache update
    const pixelValue = Math.round((newValue / 100) * 25)

    // Update Apollo cache directly for real-time visual feedback (no API call)
    if (cardBlock != null) {
      client.writeFragment({
        id: client.cache.identify(cardBlock as any),
        fragment: UPDATE_BACKDROP_BLUR_FRAGMENT,
        data: {
          backdropBlur: pixelValue
        }
      })
    }
  }

  async function handleBlurSliderCommitted(
    _: Event,
    newValue: number
  ): Promise<void> {
    // Convert percentage (0-100) to pixels (0-25)
    const pixelValue = Math.round((newValue / 100) * 25)
    // Only trigger command for undo/redo functionality
    // The visual update was already handled in handleBlurSliderChange
    await handleBlurChange(pixelValue)
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

  async function handleInputValueUpdate(value: string): Promise<void> {
    const numericValue = value.replace('%', '').trim()

    // Default to 0 if empty or invalid
    let numValue = parseInt(numericValue, 10)
    if (isNaN(numValue) || numericValue === '') {
      numValue = 0
    }

    // Constrained to valid range (0-100)
    numValue = Math.max(0, Math.min(100, numValue))

    setBlurPercentage(numValue)
    setInputValue(`${numValue}%`) // Update input to show the constrained value
    const pixelValue = Math.round((numValue / 100) * 25)

    // For input: Make single API call with command pattern for undo/redo + UI update
    if (cardBlock != null) {
      await handleBlurChange(pixelValue)
    }
  }

  async function handleBlurChange(blur: number): Promise<void> {
    if (cardBlock != null) {
      await add({
        parameters: {
          execute: {
            blur
          },
          undo: {
            blur: cardBlock.backdropBlur ?? 20
          }
        },
        execute: async ({ blur }) => {
          dispatch({
            type: 'SetEditorFocusAction',
            activeSlide: ActiveSlide.Content,
            selectedStep,
            activeContent: ActiveContent.Canvas
          })
          await cardBlockBackdropBlurUpdate({
            variables: {
              id: cardBlock.id,
              input: {
                backdropBlur: blur
              }
            },
            optimisticResponse: {
              cardBlockUpdate: {
                id: cardBlock.id,
                __typename: 'CardBlock',
                backdropBlur: blur
              }
            }
          })
        }
      })
    }
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>): void {
    // Filter out non-numeric characters (except %)
    const value = event.target.value
    const filteredValue = value.replace(/[^0-9%]/g, '')

    // Ensure only one % at the end
    const parts = filteredValue.split('%')
    const cleanValue = parts[0] + (parts.length > 1 ? '%' : '')

    setInputValue(cleanValue)
  }

  async function handleInputBlur(): Promise<void> {
    // Apply changes when user finishes typing
    await handleInputValueUpdate(inputValue)
  }

  async function handleInputKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ): Promise<void> {
    // Apply changes when user presses Enter
    if (event.key === 'Enter') {
      event.preventDefault()
      await handleInputValueUpdate(inputValue)
    }
  }

  function isValidHex(color: string): boolean {
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/
    return hexColorRegex.test(color)
  }

  const validationSchema = object({
    color: string()
      .required(
        t(
          'Invalid format. Use a 6-digit hex code starting with # (eg., #FFFFFF)'
        )
      )
      .test(
        'valid-hex-color',
        t(
          'Invalid format. Use a 6-digit hex code starting with # (eg., #FFFFFF)'
        ),
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

      {cardBlock?.fullscreen && (
        <>
          <Divider />
          <Stack sx={{ p: 4, pt: 2 }} data-testid="BackdropBlurSlider">
            <Stack direction="row" alignItems="center" spacing={3}>
              <Tooltip
                title={t('Adjust the blur level of your background image.')}
                slotProps={{
                  tooltip: {
                    sx: {
                      textAlign: 'center',
                      lineHeight: 1.4,
                      maxWidth: 165,
                      py: 2
                    }
                  }
                }}
              >
                <BlurIcon
                  sx={{ color: 'text.secondary', fontSize: 24, opacity: 0.8 }}
                  aria-label="Backdrop blur"
                />
              </Tooltip>
              <PropertiesSlider
                value={blurPercentage}
                min={0}
                max={100}
                step={1}
                onChange={handleBlurSliderChange}
                onChangeCommitted={handleBlurSliderCommitted}
                ariaLabel="Backdrop blur slider"
              />
              <TextField
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onKeyDown={handleInputKeyDown}
                variant="outlined"
                size="small"
                slotProps={{
                  htmlInput: {
                    inputMode: 'numeric',
                    pattern: '[0-9]*',
                    style: {
                      textAlign: 'center',
                      fontSize: 14,
                      padding: '6px 8px',
                      width: 36,
                      height: 20
                    }
                  }
                }}
                sx={{
                  width: 52,
                  height: 32,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'background.paper',
                    '& fieldset': {
                      border: 'none'
                    },
                    '&:hover fieldset': {
                      border: 'none'
                    },
                    '&.Mui-focused fieldset': {
                      border: '1px solid',
                      borderColor: 'primary.main'
                    }
                  }
                }}
                aria-label="Blur amount as percentage"
              />
            </Stack>
          </Stack>
        </>
      )}
    </>
  )
}
