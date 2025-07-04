import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'
import { object, string } from 'yup'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import Edit2Icon from '@core/shared/ui/icons/Edit2'

import { BlockFields_TypographyBlock as TypographyBlock } from '../../../../../../../../../../__generated__/BlockFields'
import { TypographyColor } from '../../../../../../../../../../__generated__/globalTypes'
import {
  TypographyBlockUpdateColor,
  TypographyBlockUpdateColorVariables
} from '../../../../../../../../../../__generated__/TypographyBlockUpdateColor'
import { TextFieldForm } from '../../../../../../../../TextFieldForm'
import { DebouncedHexColorPicker } from '../../Card/BackgroundColor/DebouncedHexColorPicker'
import { Swatch } from '../../Card/BackgroundColor/Swatch'

export const TYPOGRAPHY_BLOCK_UPDATE_COLOR = gql`
  mutation TypographyBlockUpdateColor(
    $id: ID!
    $settings: TypographyBlockSettingsInput!
  ) {
    typographyBlockUpdate(id: $id, input: { settings: $settings }) {
      id
      settings {
        color
      }
    }
  }
`

export function Color(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [typographyBlockUpdate] = useMutation<
    TypographyBlockUpdateColor,
    TypographyBlockUpdateColorVariables
  >(TYPOGRAPHY_BLOCK_UPDATE_COLOR)
  const { add } = useCommand()
  const {
    state: { selectedBlock: stateSelectedBlock, selectedStep },
    dispatch
  } = useEditor()

  const selectedBlock = stateSelectedBlock as
    | TreeBlock<TypographyBlock>
    | undefined

  // Convert TypographyColor enum to hex color
  function enumToHex(enumColor: TypographyColor | null): string {
    switch (enumColor) {
      case TypographyColor.primary:
        return '#C52D3A'
      case TypographyColor.secondary:
        return '#444451'
      case TypographyColor.error:
        return '#B62D1C'
      default:
        return '#C52D3A'
    }
  }

  // Get effective color: prioritize settings.color (hex), then fall back to legacy color (enum), then null for default
  const getEffectiveColor = (): string | null => {
    // First check if there's a valid hex color in settings
    if (
      selectedBlock?.settings?.color &&
      selectedBlock.settings.color.trim() !== ''
    ) {
      return selectedBlock.settings.color
    }
    // If settings is empty {} or settings.color is empty/null, fall back to legacy enum color
    if (selectedBlock?.color) {
      return enumToHex(selectedBlock.color)
    }
    // When both are null (new blocks), return null to indicate default browser behavior
    return null
  }

  const selectedColor = getEffectiveColor() ?? '#FEFEFE' // Fallback for color picker display only

  function handleChange(color: string): void {
    if (selectedBlock == null || color == null) return

    add({
      parameters: {
        execute: { color },
        undo: {
          color: selectedBlock.settings?.color
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
            settings: { color }
          },
          optimisticResponse: {
            typographyBlockUpdate: {
              id: selectedBlock.id,
              settings: {
                color,
                __typename: 'TypographyBlockSettings'
              },
              __typename: 'TypographyBlock'
            }
          }
        })
      }
    })
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
        (value) => isValidHex(value)
      )
  })

  return (
    <>
      <Box sx={{ p: 4 }}>
        <DebouncedHexColorPicker
          data-testid="typographyColorPicker"
          color={selectedColor}
          onChange={handleChange}
          style={{ width: '100%', height: 125 }}
        />
      </Box>
      <Stack
        sx={{ p: 4, pt: 0 }}
        spacing={3}
        direction="row"
        data-testid="TypographyColor"
      >
        <Swatch
          id={`typography-color-${selectedColor}`}
          color={selectedColor}
        />
        <TextFieldForm
          id="color"
          data-testid="typographyColorTextField"
          hiddenLabel
          initialValue={selectedColor}
          validationSchema={validationSchema}
          onSubmit={(value) => value && handleChange(value)}
          startIcon={
            <InputAdornment position="start">
              <Edit2Icon style={{ cursor: 'pointer' }} />
            </InputAdornment>
          }
        />
      </Stack>
    </>
  )
}
