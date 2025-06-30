import { render } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { getTheme } from '@core/shared/ui/themes'

import { BlockFields_StepBlock as StepBlock } from '../../../../../../../../../__generated__/BlockFields'
import {
  ThemeMode,
  ThemeName,
  TypographyAlign,
  TypographyColor,
  TypographyVariant
} from '../../../../../../../../../__generated__/globalTypes'

import { ColorDisplayIcon } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('ColorDisplayIcon', () => {
  it('should show the selected color primary as default', () => {
    const step: TreeBlock<StepBlock> = {
      id: 'step.id',
      __typename: 'StepBlock',
      parentBlockId: null,
      parentOrder: 0,
      locked: false,
      nextBlockId: null,
      slug: null,
      children: [
        {
          id: 'card1.id',
          __typename: 'CardBlock',
          parentBlockId: 'step1.id',
          coverBlockId: null,
          parentOrder: 0,
          backgroundColor: null,
          themeMode: ThemeMode.dark,
          themeName: ThemeName.base,
          fullscreen: false,
          backdropBlur: null,
          children: [
            {
              __typename: 'TypographyBlock',
              id: '1',
              parentBlockId: 'step.id',
              parentOrder: 0,
              content: 'text block',
              variant: TypographyVariant.subtitle1,
              color: null,
              align: TypographyAlign.left,
              children: []
            }
          ]
        }
      ]
    }
    const { getByTestId } = render(
      <EditorProvider initialState={{ selectedStep: step }}>
        <ColorDisplayIcon color={TypographyColor.primary} />
      </EditorProvider>
    )
    expect(getByTestId('primary-display-icon')).toHaveStyle(
      `background-color: ${
        getTheme({ themeName: ThemeName.base, themeMode: ThemeMode.dark })
          .palette.primary.main
      }`
    )
  })

  it('should show the selected color', () => {
    const step: TreeBlock<StepBlock> = {
      id: 'step.id',
      __typename: 'StepBlock',
      parentBlockId: null,
      parentOrder: 0,
      locked: false,
      nextBlockId: null,
      slug: null,
      children: [
        {
          id: 'card1.id',
          __typename: 'CardBlock',
          parentBlockId: 'step1.id',
          coverBlockId: null,
          parentOrder: 0,
          backgroundColor: null,
          themeMode: ThemeMode.dark,
          themeName: ThemeName.base,
          fullscreen: false,
          backdropBlur: null,
          children: [
            {
              __typename: 'TypographyBlock',
              id: '1',
              parentBlockId: 'step.id',
              parentOrder: 0,
              content: 'text block',
              variant: TypographyVariant.subtitle1,
              color: TypographyColor.secondary,
              align: TypographyAlign.left,
              children: []
            }
          ]
        }
      ]
    }
    const { getByTestId } = render(
      <EditorProvider initialState={{ selectedStep: step }}>
        <ColorDisplayIcon color={TypographyColor.secondary} />
      </EditorProvider>
    )
    expect(getByTestId('secondary-display-icon')).toHaveStyle(
      `background-color: ${
        getTheme({ themeName: ThemeName.base, themeMode: ThemeMode.dark })
          .palette.secondary.main
      }`
    )
  })
})
