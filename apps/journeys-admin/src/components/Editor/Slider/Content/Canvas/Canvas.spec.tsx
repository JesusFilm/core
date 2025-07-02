import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { SnackbarProvider } from 'notistack'

import type { TreeBlock } from '@core/journeys/ui/block'
import {
  ActiveCanvasDetailsDrawer,
  ActiveContent,
  ActiveSlide,
  EditorProvider,
  EditorState
} from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { BlockFields_StepBlock as StepBlock } from '../../../../../../__generated__/BlockFields'
import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'
import {
  ThemeMode,
  ThemeName,
  TypographyAlign,
  TypographyColor,
  TypographyVariant
} from '../../../../../../__generated__/globalTypes'
import { TestEditorState } from '../../../../../libs/TestEditorState'
import { ThemeProvider } from '../../../../ThemeProvider'

import { Canvas } from '.'

describe('Canvas', () => {
  const step0: TreeBlock<StepBlock> = {
    id: 'step0.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 0,
    locked: false,
    nextBlockId: null,
    slug: null,
    children: [
      {
        __typename: 'TypographyBlock',
        id: 'heading3',
        parentBlockId: 'question',
        parentOrder: 0,
        content: 'Hello World!',
        variant: TypographyVariant.h3,
        color: TypographyColor.primary,
        align: TypographyAlign.left,
        children: []
      ,
  settings: {
    __typename: 'TypographyBlockSettings',
    color: null
  }
}
    ]
  }
  const step1: TreeBlock<StepBlock> = {
    id: 'step1.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 1,
    locked: false,
    nextBlockId: null,
    slug: null,
    children: []
  }
  const initialState: EditorState = {
    steps: [step0, step1],
    selectedStep: step0,
    activeSlide: ActiveSlide.JourneyFlow,
    activeContent: ActiveContent.Canvas,
    activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties
  }

  it('should show outline around selected step', () => {
    const { getByTestId } = render(
      <MockedProvider>
        <SnackbarProvider>
          <ThemeProvider>
            <JourneyProvider
              value={{
                journey: {
                  id: 'journeyId',
                  themeMode: ThemeMode.dark,
                  themeName: ThemeName.base,
                  language: {
                    __typename: 'Language',
                    id: '529',
                    bcp47: 'en',
                    iso3: 'eng'
                  }
                } as unknown as Journey,
                variant: 'admin'
              }}
            >
              <EditorProvider initialState={initialState}>
                <Canvas />
              </EditorProvider>
            </JourneyProvider>
          </ThemeProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(getByTestId('CanvasContainer')).toHaveStyle({
      outline: '2px solid #C52D3A'
    })
  })

  it('should select step on click', () => {
    const { getByTestId, getByText } = render(
      <MockedProvider>
        <SnackbarProvider>
          <ThemeProvider>
            <JourneyProvider
              value={{
                journey: {
                  id: 'journeyId',
                  themeMode: ThemeMode.dark,
                  themeName: ThemeName.base,
                  language: {
                    __typename: 'Language',
                    id: '529',
                    bcp47: 'en',
                    iso3: 'eng'
                  }
                } as unknown as Journey,
                variant: 'admin'
              }}
            >
              <EditorProvider initialState={initialState}>
                <TestEditorState />
                <Canvas />
              </EditorProvider>
            </JourneyProvider>
          </ThemeProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.click(getByTestId('CanvasContainer'))
    expect(getByText('selectedBlock: step0.id')).toBeInTheDocument()
    expect(
      getByText('selectedAttributeId: step0.id-next-block')
    ).toBeInTheDocument()
  })

  it('should not select step if mouse down target element is not the card', async () => {
    const { queryByText, baseElement } = render(
      <MockedProvider>
        <SnackbarProvider>
          <ThemeProvider>
            <JourneyProvider
              value={{
                journey: {
                  id: 'journeyId',
                  themeMode: ThemeMode.dark,
                  themeName: ThemeName.base,
                  language: {
                    __typename: 'Language',
                    id: '529',
                    bcp47: 'en',
                    iso3: 'eng'
                  }
                } as unknown as Journey,
                variant: 'admin'
              }}
            >
              <EditorProvider initialState={initialState}>
                <TestEditorState />
                <Canvas />
              </EditorProvider>
            </JourneyProvider>
          </ThemeProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    const iframe = baseElement.getElementsByTagName('iframe')[0]
    let typogBlock
    await waitFor(() => {
      typogBlock = iframe.contentDocument?.body.getElementsByTagName('h3')[0]
    })
    await userEvent.pointer([
      // mouse down the screen at typography block
      { keys: '[MouseLeft>]', target: typogBlock },
      // move the pointer onto the card component
      { pointerName: 'mouse', target: iframe },
      // release the pointer at card component
      { keys: '[/MouseLeft]' }
    ])
    expect(
      queryByText('selectedAttributeId: step0.id-next-block')
    ).not.toBeInTheDocument()
  })

  it('should not select step in analytics mode', () => {
    render(
      <MockedProvider>
        <SnackbarProvider>
          <ThemeProvider>
            <JourneyProvider
              value={{
                journey: {
                  id: 'journeyId',
                  themeMode: ThemeMode.dark,
                  themeName: ThemeName.base,
                  language: {
                    __typename: 'Language',
                    id: '529',
                    bcp47: 'en',
                    iso3: 'eng'
                  },
                  chatButtons: []
                } as unknown as Journey,
                variant: 'admin'
              }}
            >
              <EditorProvider
                initialState={{
                  ...initialState,
                  showAnalytics: true
                }}
              >
                <TestEditorState />
                <Canvas />
              </EditorProvider>
            </JourneyProvider>
          </ThemeProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(screen.getByText('activeSlide: 0')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('CanvasContainer'))
    expect(screen.getByText('activeSlide: 0')).toBeInTheDocument()
  })

  // TODO: Add to E2E tests when complete. Can't test in unit test as iframe doesn't render
  it.skip('should selected JourneyAppearance on click', () => {
    render(
      <MockedProvider>
        <ThemeProvider>
          <JourneyProvider
            value={{
              journey: {
                id: 'journeyId',
                themeMode: ThemeMode.dark,
                themeName: ThemeName.base,
                language: {
                  __typename: 'Language',
                  id: '529',
                  bcp47: 'en',
                  iso3: 'eng'
                }
              } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <EditorProvider initialState={initialState}>
              <TestEditorState />
              <Canvas />
            </EditorProvider>
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    expect(screen.getByTestId('JourneysStepFooter')).toHaveStyle({
      outline: 'none'
    })
    fireEvent.click(screen.getByTestId('JourneysStepFooter'))
    expect(screen.getByText('selectedBlock: step0.id')).toBeInTheDocument()
    expect(
      screen.getByText('selectedAttributeId: hosted-by')
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        `activeCanvasDetailsDrawerAction: ${ActiveCanvasDetailsDrawer.JourneyAppearance}`
      )
    ).toBeInTheDocument()
    expect(screen.getByTestId('JourneysStepFooter')).toHaveStyle({
      outline: '2px solid #C52D3A'
    })
    expect(screen.getByTestId('step-step0.id')).toHaveStyle({
      outline: '0px solid'
    })
    expect(screen.getByTestId('JourneysStepHeader')).toHaveStyle({
      outline: '2px solid #C52D3A'
    })
  })

  it('should show canvas footer', () => {
    render(
      <MockedProvider>
        <SnackbarProvider>
          <ThemeProvider>
            <JourneyProvider
              value={{
                journey: {
                  id: 'journeyId',
                  themeMode: ThemeMode.dark,
                  themeName: ThemeName.base,
                  language: {
                    __typename: 'Language',
                    id: '529',
                    bcp47: 'en',
                    iso3: 'eng'
                  }
                } as unknown as Journey,
                variant: 'admin'
              }}
            >
              <EditorProvider initialState={initialState}>
                <Canvas />
              </EditorProvider>
            </JourneyProvider>
          </ThemeProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(screen.getByTestId('CanvasFooter')).toBeInTheDocument()
  })
})
