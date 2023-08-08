import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import type { TreeBlock } from '@core/journeys/ui/block'
import {
  ActiveFab,
  ActiveJourneyEditContent,
  ActiveTab,
  EditorState,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'

import {
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_StepBlock as StepBlock
} from '../../../../__generated__/GetJourney'
import { ThemeMode, ThemeName } from '../../../../__generated__/globalTypes'
import { ThemeProvider } from '../../ThemeProvider'
import { HostSidePanel } from '../ControlPanel/Attributes/blocks/Footer/HostSidePanel'
import { NextCard } from '../ControlPanel/Attributes/blocks/Step/NextCard'

import { Canvas } from '.'

jest.mock('@core/journeys/ui/EditorProvider', () => {
  const originalModule = jest.requireActual('@core/journeys/ui/EditorProvider')
  return {
    __esModule: true,
    ...originalModule,
    useEditor: jest.fn()
  }
})

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

const mockUseEditor = useEditor as jest.MockedFunction<typeof useEditor>

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
  const dispatch = jest.fn()

  const state: EditorState = {
    steps: [step0, step1],
    selectedStep: step0,
    selectedBlock: step0,
    drawerMobileOpen: false,
    activeTab: ActiveTab.Journey,
    activeFab: ActiveFab.Add,
    journeyEditContentComponent: ActiveJourneyEditContent.Canvas
  }

  beforeEach(() => {
    mockUseEditor.mockReturnValue({
      state,
      dispatch
    })
  })

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
              <Canvas />
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
              <Canvas />
            </JourneyProvider>
          </ThemeProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.click(getByTestId('step-step0.id'))

    expect(dispatch).toHaveBeenCalledWith({
      type: 'SetSelectedBlockAction',
      block: step0
    })
    expect(dispatch).toHaveBeenCalledWith({
      type: 'SetActiveFabAction',
      activeFab: ActiveFab.Add
    })
    expect(dispatch).toHaveBeenCalledWith({
      type: 'SetActiveTabAction',
      activeTab: ActiveTab.Properties
    })
    expect(dispatch).toHaveBeenCalledWith({
      type: 'SetDrawerPropsAction',
      title: 'Next Card Properties',
      mobileOpen: true,
      children: <NextCard />
    })
    expect(dispatch).toHaveBeenCalledWith({
      type: 'SetSelectedAttributeIdAction',
      id: 'step0.id-next-block'
    })
  })

  // TODO: Add to E2E tests when complete. Can't test in unit test as iframe doesn't render
  it.skip('should selected footer on click', () => {
    const { getByTestId } = render(
      <MockedProvider>
        <FlagsProvider flags={{ editableStepFooter: true }}>
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
              <Canvas />
            </JourneyProvider>
          </ThemeProvider>
        </FlagsProvider>
      </MockedProvider>
    )

    expect(getByTestId('stepFooter')).toHaveStyle({
      outline: 'none'
    })

    fireEvent.click(getByTestId('stepFooter'))

    expect(dispatch).toHaveBeenCalledWith({
      type: 'SetSelectedComponentAction',
      component: 'Footer'
    })
    expect(dispatch).toHaveBeenCalledWith({
      type: 'SetActiveFabAction',
      activeFab: ActiveFab.Add
    })
    expect(dispatch).toHaveBeenCalledWith({
      type: 'SetActiveTabAction',
      activeTab: ActiveTab.Properties
    })
    expect(dispatch).toHaveBeenCalledWith({
      type: 'SetDrawerPropsAction',
      title: 'Hosted By',
      mobileOpen: true,
      children: <HostSidePanel />
    })
    expect(dispatch).toHaveBeenCalledWith({
      type: 'SetSelectedAttributeIdAction',
      id: 'hosted-by'
    })

    expect(getByTestId('stepFooter')).toHaveStyle({
      outline: '3px solid #C52D3A'
    })

    expect(getByTestId('step-step0.id')).toHaveStyle({
      outline: '0px solid'
    })
  })
})
