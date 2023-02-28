import { render, fireEvent } from '@testing-library/react'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import {
  useEditor,
  EditorState,
  ActiveTab,
  ActiveFab
} from '@core/journeys/ui/EditorProvider'
import type { TreeBlock } from '@core/journeys/ui/block'
import { MockedProvider } from '@apollo/client/testing'
import {
  GetJourney_journey_blocks_StepBlock as StepBlock,
  GetJourney_journey as Journey
} from '../../../../__generated__/GetJourney'
import { ThemeProvider } from '../../ThemeProvider'
import { ThemeMode, ThemeName } from '../../../../__generated__/globalTypes'
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
    activeTab: ActiveTab.Cards,
    activeFab: ActiveFab.Add
  }

  beforeEach(() => {
    mockUseEditor.mockReturnValue({
      state,
      dispatch
    })
  })

  it('should show border around selected', () => {
    const { getByTestId } = render(
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
              admin: true
            }}
          >
            <Canvas />
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    expect(getByTestId('step-step0.id')).toHaveStyle(
      'border: 2px solid #c52d3a'
    )
  })

  it('should dispatch on click', () => {
    const { getByTestId } = render(
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
              admin: true
            }}
          >
            <Canvas />
          </JourneyProvider>
        </ThemeProvider>
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
  })
})
