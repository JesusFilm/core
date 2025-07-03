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
            settings: {
              __typename: 'TypographyBlockSettings',
              color: null
            },
            children: []
          }
        ]
      }
    ]
  }

  it('should show hex color directly', () => {
    const { container } = render(
      <EditorProvider initialState={{ selectedStep: step }}>
        <ColorDisplayIcon color="#C52D3A" />
      </EditorProvider>
    )
    const span = container.querySelector('span')
    expect(span).toHaveStyle('background-color: rgb(197, 45, 58)')
    expect(span).toHaveStyle('width: 24px')
    expect(span).toHaveStyle('height: 24px')
    expect(span).toHaveStyle('border-radius: 50%')
  })

  it('should show secondary hex color directly', () => {
    const { container } = render(
      <EditorProvider initialState={{ selectedStep: step }}>
        <ColorDisplayIcon color="#444451" />
      </EditorProvider>
    )
    const span = container.querySelector('span')
    expect(span).toHaveStyle('background-color: rgb(68, 68, 81)')
  })

  it('should show error hex color directly', () => {
    const { container } = render(
      <EditorProvider initialState={{ selectedStep: step }}>
        <ColorDisplayIcon color="#B62D1C" />
      </EditorProvider>
    )
    const span = container.querySelector('span')
    expect(span).toHaveStyle('background-color: rgb(182, 45, 28)')
  })

  it('should show theme primary color for enum value', () => {
    const { container } = render(
      <EditorProvider initialState={{ selectedStep: step }}>
        <ColorDisplayIcon color={TypographyColor.primary} />
      </EditorProvider>
    )
    const span = container.querySelector('span')
    expect(span).toHaveStyle('background-color: rgb(25, 118, 210)')
  })

  it('should show theme secondary color for enum value', () => {
    const { container } = render(
      <EditorProvider initialState={{ selectedStep: step }}>
        <ColorDisplayIcon color={TypographyColor.secondary} />
      </EditorProvider>
    )
    const span = container.querySelector('span')
    expect(span).toHaveStyle('background-color: rgb(156, 39, 176)')
  })

  it('should show theme error color for enum value', () => {
    const { container } = render(
      <EditorProvider initialState={{ selectedStep: step }}>
        <ColorDisplayIcon color={TypographyColor.error} />
      </EditorProvider>
    )
    const span = container.querySelector('span')
    expect(span).toHaveStyle('background-color: rgb(211, 47, 47)')
  })

  it('should default to primary color when color is null', () => {
    const { container } = render(
      <EditorProvider initialState={{ selectedStep: step }}>
        <ColorDisplayIcon color={null} />
      </EditorProvider>
    )
    const span = container.querySelector('span')
    expect(span).toHaveStyle('background-color: rgb(25, 118, 210)')
  })
})
