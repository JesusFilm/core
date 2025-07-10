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
import { ThemeMode, ThemeName, getTheme } from '@core/shared/ui/themes'

import { BlockFields_ButtonBlock as ButtonBlock } from '../../../../../../../../../../__generated__/BlockFields'
import {
  ButtonBlockUpdateColor,
  ButtonBlockUpdateColorVariables
} from '../../../../../../../../../../__generated__/ButtonBlockUpdateColor'
import { ButtonColor } from '../../../../../../../../../../__generated__/globalTypes'
import { TextFieldForm } from '../../../../../../../../TextFieldForm'
import { DebouncedHexColorPicker } from '../../Card/BackgroundColor/DebouncedHexColorPicker'
import { Swatch } from '../../Card/BackgroundColor/Swatch'

export const BUTTON_BLOCK_UPDATE = gql`
  mutation ButtonBlockUpdateColor($id: ID!, $input: ButtonBlockUpdateInput!) {
    buttonBlockUpdate(id: $id, input: $input) {
      id
      settings {
        color
      }
    }
  }
`

export function Color(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [buttonBlockUpdate] = useMutation<
    ButtonBlockUpdateColor,
    ButtonBlockUpdateColorVariables
  >(BUTTON_BLOCK_UPDATE)

  const { state, dispatch } = useEditor()
  const { add } = useCommand()

  const selectedBlock = state.selectedBlock as
    | TreeBlock<ButtonBlock>
    | undefined

  const selectedCard = state.selectedStep?.children.find(
    (block) => block.__typename === 'CardBlock'
  )

  const selectedColor = getEffectiveColor()

  function getEffectiveColor(): string {
    if (selectedBlock?.settings?.color) {
      return selectedBlock.settings.color
    }
    return convertEnumToHex(selectedBlock?.buttonColor ?? ButtonColor.primary)
  }

  function convertEnumToHex(enumColor: ButtonColor): string {
    const theme = getTheme({
      themeName: selectedCard?.themeName ?? ThemeName.base,
      themeMode: selectedCard?.themeMode ?? ThemeMode.light
    })

    switch (enumColor) {
      case ButtonColor.primary:
        return theme.palette.primary.main
      case ButtonColor.secondary:
        return theme.palette.secondary.main
      case ButtonColor.error:
        return theme.palette.error.main
      default:
        return theme.palette.primary.main
    }
  }

  function handleChange(color: string): void {
    if (selectedBlock == null || color == null) return
    add({
      parameters: {
        execute: { color },
        undo: { color: selectedColor }
      },
      execute({ color }) {
        dispatch({
          type: 'SetEditorFocusAction',
          selectedBlock,
          selectedStep: state.selectedStep
        })
        void buttonBlockUpdate({
          variables: {
            id: selectedBlock.id,
            input: {
              settings: {
                color
              }
            }
          },
          optimisticResponse: {
            buttonBlockUpdate: {
              id: selectedBlock.id,
              settings: {
                __typename: 'ButtonBlockSettings',
                color
              },
              __typename: 'ButtonBlock'
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
        (value) => {
          if (isValidHex(value)) {
            void handleChange(value)
            return true
          }
        }
      )
  })

  return (
    <>
      <Box sx={{ p: 4 }}>
        <DebouncedHexColorPicker
          data-testid="bgColorPicker"
          color={selectedColor}
          onChange={handleChange}
          style={{ width: '100%', height: 125 }}
        />
      </Box>
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
          onSubmit={handleChange}
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
