import { render } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { getTheme } from '@core/shared/ui/themes'

import { BlockFields_StepBlock as StepBlock } from '../../../../../../../../../__generated__/BlockFields'
import { GetJourney_journey as Journey } from '../../../../../../../../../__generated__/GetJourney'
import {
  ThemeMode,
  ThemeName,
  TypographyColor
} from '../../../../../../../../../__generated__/globalTypes'

import { ColorDisplayIcon } from '.'

describe('ColorDisplayIcon', () => {
  const createMockStep = (
    themeMode: ThemeMode = ThemeMode.dark
  ): TreeBlock<StepBlock> => ({
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
        themeMode,
        themeName: ThemeName.base,
        fullscreen: false,
        backdropBlur: null,
        children: []
      }
    ]
  })

  it('should display hex colors directly', () => {
    const step = createMockStep()
    const { getByTestId } = render(
      <EditorProvider initialState={{ selectedStep: step }}>
        <ColorDisplayIcon color="#C52D3A" />
      </EditorProvider>
    )
    expect(getByTestId('#C52D3A-display-icon')).toHaveStyle(
      'background-color: #C52D3A'
    )
  })

  it('should use dark theme mapping for non-hex colors', () => {
    const step = createMockStep()
    const { getByTestId } = render(
      <JourneyProvider
        value={{
          journey: {
            id: 'journey.id',
            themeMode: ThemeMode.dark
          } as unknown as Journey,
          variant: 'admin'
        }}
      >
        <EditorProvider initialState={{ selectedStep: step }}>
          <ColorDisplayIcon color={TypographyColor.secondary} />
        </EditorProvider>
      </JourneyProvider>
    )
    expect(getByTestId('secondary-display-icon')).toHaveStyle(
      `background-color: ${
        getTheme({ themeName: ThemeName.base, themeMode: ThemeMode.dark })
          .palette.secondary.main
      }`
    )
  })

  it('should use light theme mapping for non-hex colors', () => {
    const step = createMockStep(ThemeMode.light)
    const { getByTestId } = render(
      <JourneyProvider
        value={{
          journey: {
            id: 'journey.id',
            themeMode: ThemeMode.light
          } as unknown as Journey,
          variant: 'admin'
        }}
      >
        <EditorProvider initialState={{ selectedStep: step }}>
          <ColorDisplayIcon color={TypographyColor.primary} />
        </EditorProvider>
      </JourneyProvider>
    )
    expect(getByTestId('primary-display-icon')).toHaveStyle(
      `background-color: ${
        getTheme({ themeName: ThemeName.base, themeMode: ThemeMode.light })
          .palette.primary.main
      }`
    )
  })

  it('should default to primary when color is null', () => {
    const step = createMockStep()
    const { getByTestId } = render(
      <EditorProvider initialState={{ selectedStep: step }}>
        <ColorDisplayIcon color={null} />
      </EditorProvider>
    )
    expect(getByTestId('primary-display-icon')).toHaveStyle(
      `background-color: ${
        getTheme({ themeName: ThemeName.base, themeMode: ThemeMode.dark })
          .palette.primary.main
      }`
    )
  })
})
