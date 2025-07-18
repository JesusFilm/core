import { gql, useApolloClient, useMutation } from '@apollo/client'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { applyDefaultAlpha } from '@core/journeys/ui/Card/utils/colorOpacityUtils'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import {
  ActiveContent,
  ActiveSlide,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import BlurIcon from '@core/shared/ui/icons/Blur'
import { ThemeMode, ThemeName, getTheme } from '@core/shared/ui/themes'

import { CardBlockBackgroundColorUpdate } from '../../../../../../../../../../__generated__/CardBlockBackgroundColorUpdate'
import { CardFields } from '../../../../../../../../../../__generated__/CardFields'
import { PropertiesSlider } from '../BackgroundMedia/Image/controls/PropertiesSlider'

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
  const [selectedColor, setSelectedColor] = useState(
    cardBlock?.backgroundColor
      ? applyDefaultAlpha(cardBlock.backgroundColor)
      : `${cardTheme.palette.background.paper}4D`
  )
  useEffect(() => {
    if (cardBlock?.backgroundColor != null) {
      setSelectedColor(cardBlock.backgroundColor)
    }
  }, [cardBlock?.backgroundColor])

  // Store blur as percentage (0-100%), convert to pixels when needed
  const [blurPercentage, setBlurPercentage] = useState(
    Math.round(((cardBlock?.backdropBlur ?? 20) / 25) * 100)
  )

  // Local state for input field value (separate from slider percentage)
  const [inputValue, setInputValue] = useState(`${blurPercentage}%`)

  // Update blur percentage when cardBlock changes
  useEffect(() => {
    const pixelValue = cardBlock?.backdropBlur ?? 20
    const percentageValue = Math.round((pixelValue / 25) * 100)
    setBlurPercentage(percentageValue)
    setInputValue(`${percentageValue}%`)
  }, [cardBlock?.backdropBlur])

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
      setSelectedColor(color)
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
        enableAlpha={true}
      />
    </Stack>
  )

  return (
    <>
      {hexColorPicker}
      <Stack
        sx={{ p: 4, pt: 0, justifyContent: 'center' }}
        spacing={3}
        direction="row"
        data-testid="BackgroundColor"
      >
        <Swatch id={`bg-color-${selectedColor}`} color={selectedColor} />
        <ColorOpacityField
          color={selectedColor}
          onColorChange={handleColorChange}
        />
      </Stack>
      {palettePicker}
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
