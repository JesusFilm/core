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
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Edit2Icon from '@core/shared/ui/icons/Edit2'
import { getTheme } from '@core/shared/ui/themes'

import {
  BlockFields_CardBlock as CardBlock,
  BlockFields_TypographyBlock as TypographyBlock
} from '../../../../../../../../../../__generated__/BlockFields'
import {
  ThemeMode,
  ThemeName,
  TypographyColor
} from '../../../../../../../../../../__generated__/globalTypes'
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
  const { journey } = useJourney()

  const selectedBlock = stateSelectedBlock as
    | TreeBlock<TypographyBlock>
    | undefined

  const card = selectedStep?.children.find(
    (block) => block.__typename === 'CardBlock'
  ) as TreeBlock<CardBlock> | undefined

  function enumToHex(enumColor: TypographyColor | null): string {
    const theme = getTheme({
      themeName: card?.themeName ?? journey?.themeName ?? ThemeName.base,
      themeMode: card?.themeMode ?? journey?.themeMode ?? ThemeMode.dark
    })

    switch (enumColor) {
      case TypographyColor.primary:
        return theme.palette.primary.main
      case TypographyColor.secondary:
        return theme.palette.secondary.main
      case TypographyColor.error:
        return theme.palette.error.main
      default:
        return theme.palette.primary.main
    }
  }

  // Returns the effective color for display, prioritizing a hex color from settings,
  // then falling back to the legacy enum color, and finally a null if both are missing.
  const getEffectiveColor = (): string | null => {
    if (selectedBlock?.settings?.color) {
      return selectedBlock.settings.color
    }
    if (selectedBlock?.color) {
      return enumToHex(selectedBlock.color)
    }
    return null
  }

  const selectedColor = getEffectiveColor() ?? '#FEFEFE'

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
      .required(t('Use a valid 6-digit hex (e.g #FFFFFF)'))
      .test(
        'valid-hex-color',
        t('Use a valid 6-digit hex (e.g #FFFFFF)'),
        (value) => isValidHex(value)
      )
  })

  return (
    <>
      <Box sx={{ px: 4, pb: 4 }}>
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
