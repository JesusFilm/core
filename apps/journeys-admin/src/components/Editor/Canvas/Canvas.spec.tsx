import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import type { TreeBlock } from '@core/journeys/ui/block'
import {
  ActiveFab,
  ActiveJourneyEditContent,
  ActiveTab,
  EditorProvider,
  EditorState
} from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_StepBlock as StepBlock
} from '../../../../__generated__/GetJourney'
import { ThemeMode, ThemeName } from '../../../../__generated__/globalTypes'
import { TestEditorState } from '../../../libs/TestEditorState'
import { ThemeProvider } from '../../ThemeProvider'

import { Canvas } from '.'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

describe('Canvas', () => {
  const step0: TreeBlock<StepBlock> = {
    id: 'step0.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 0,
    locked: false,
    nextBlockId: null,
    children: []
  }
  const step1: TreeBlock<StepBlock> = {
    id: 'step1.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 1,
    locked: false,
    nextBlockId: null,
    children: []
  }
  const initialState: EditorState = {
    steps: [step0, step1],
    selectedStep: step0,
    selectedBlock: step0,
    drawerMobileOpen: false,
    activeTab: ActiveTab.Journey,
    activeFab: ActiveFab.Add,
    journeyEditContentComponent: ActiveJourneyEditContent.Canvas
  }

  it('should show border around selected step', () => {
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

    expect(getByTestId('step-step0.id')).toHaveStyle({
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
    fireEvent.click(getByTestId('step-step0.id'))
    expect(getByText('selectedBlock: step0.id')).toBeInTheDocument()
    expect(getByText(`activeFab: Add`)).toBeInTheDocument()
    expect(getByText('activeTab: Properties')).toBeInTheDocument()
    expect(getByText('drawerTitle: Next Card Properties')).toBeInTheDocument()
    expect(getByText('drawerMobileOpen: true')).toBeInTheDocument()
    expect(
      getByText('selectedAttributeId: step0.id-next-block')
    ).toBeInTheDocument()
  })

  // TODO: Add to E2E tests when complete. Can't test in unit test as iframe doesn't render
  it.skip('should selected footer on click', () => {
    const { getByTestId, getByText } = render(
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
    expect(getByTestId('stepFooter')).toHaveStyle({
      outline: 'none'
    })
    fireEvent.click(getByTestId('stepFooter'))
    expect(getByText('selectedBlock: step0.id')).toBeInTheDocument()
    expect(getByText('activeFab: Add')).toBeInTheDocument()
    expect(getByText('activeTab: Properties')).toBeInTheDocument()
    expect(getByText('drawerTitle: Hosted By')).toBeInTheDocument()
    expect(getByText('drawerMobileOpen: true')).toBeInTheDocument()
    expect(getByText('selectedAttributeId: hosted-by')).toBeInTheDocument()
    expect(getByText('selectedComponent: Footer')).toBeInTheDocument()
    expect(getByTestId('stepFooter')).toHaveStyle({
      outline: '2px solid #C52D3A'
    })
    expect(getByTestId('step-step0.id')).toHaveStyle({
      outline: '0px solid'
    })
  })
})
