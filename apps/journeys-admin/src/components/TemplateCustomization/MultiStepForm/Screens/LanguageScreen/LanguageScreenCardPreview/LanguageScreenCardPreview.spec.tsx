import { render, screen } from '@testing-library/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  ThemeMode,
  ThemeName
} from '../../../../../../../__generated__/globalTypes'

import { LanguageScreenCardPreview } from './LanguageScreenCardPreview'

describe('LanguageScreenCardPreview', () => {
  const journey = {
    id: 'journeyId',
    blocks: [],
    journeyTheme: {
      headerFont: 'Header Font',
      bodyFont: 'Body Font',
      labelFont: 'Label Font'
    }
  } as any

  const firstStep = {
    id: 'stepId1',
    __typename: 'StepBlock',
    parentOrder: 0,
    children: [
      {
        id: 'cardId1',
        __typename: 'CardBlock',
        themeName: ThemeName.base,
        themeMode: ThemeMode.dark
      }
    ]
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders BlockRenderer with first step and passes wrappers', () => {
    render(
      <JourneyProvider value={{ journey, variant: 'admin' }}>
        <LanguageScreenCardPreview />
      </JourneyProvider>
    )

    expect(BlockRendererMock).toHaveBeenCalled()
    const call = BlockRendererMock.mock.calls[0][0]
    expect(call.block.id).toBe('stepId1')
    expect(call.wrappers.CardWrapper).toBeDefined()
    expect(call.wrappers.VideoWrapper).toBeDefined()
  })

  it('uses rtl and locale on FramePortal and ThemeProvider', () => {
    getJourneyRTLMok.mockReturnValue({ rtl: true, locale: 'ar' })

    render(
      <JourneyProvider value={{ journey, variant: 'admin' }}>
        <LanguageScreenCardPreview />
      </JourneyProvider>
    )

    expect(screen.getByTestId('FramePortal')).toHaveAttribute('data-dir', 'rtl')
    expect(screen.getByTestId('ThemeProvider')).toHaveAttribute(
      'data-rtl',
      'true'
    )
    expect(screen.getByTestId('ThemeProvider')).toHaveAttribute(
      'data-locale',
      'ar'
    )
  })

  it('passes card theme to ThemeProvider', () => {
    render(
      <JourneyProvider value={{ journey, variant: 'admin' }}>
        <LanguageScreenCardPreview />
      </JourneyProvider>
    )

    const tp = screen.getByTestId('ThemeProvider')
    expect(tp).toHaveAttribute('data-theme-name', ThemeName.base)
    expect(tp).toHaveAttribute('data-theme-mode', ThemeMode.dark)
  })

  it('falls back to step theme when card theme is undefined', () => {
    const noThemeFirstStep = {
      ...firstStep,
      children: [
        {
          id: 'cardId1',
          __typename: 'CardBlock',
          themeName: null,
          themeMode: null
        }
      ]
    }
    transformerMock.mockReturnValue([noThemeFirstStep])
    getStepThemeMock.mockReturnValue({
      themeName: ThemeName.base,
      themeMode: ThemeMode.light
    })

    render(
      <JourneyProvider value={{ journey, variant: 'admin' }}>
        <LanguageScreenCardPreview />
      </JourneyProvider>
    )

    const tp = screen.getByTestId('ThemeProvider')
    expect(tp).toHaveAttribute('data-theme-name', ThemeName.base)
    expect(tp).toHaveAttribute('data-theme-mode', ThemeMode.light)
  })

  it('provides font families from journey theme', () => {
    render(
      <JourneyProvider value={{ journey, variant: 'admin' }}>
        <LanguageScreenCardPreview />
      </JourneyProvider>
    )

    const tp = screen.getByTestId('ThemeProvider')
    expect(tp).toHaveAttribute('data-header-font', 'Header Font')
    expect(tp).toHaveAttribute('data-body-font', 'Body Font')
    expect(tp).toHaveAttribute('data-label-font', 'Label Font')
  })
})
