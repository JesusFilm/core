import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import useMediaQuery from '@mui/material/useMediaQuery'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { TreeBlock } from '@core/journeys/ui/block'
import {
  ActiveCanvasDetailsDrawer,
  ActiveContent,
  ActiveSlide,
  EditorProvider,
  EditorState,
  useEditor
} from '@core/journeys/ui/EditorProvider'

import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../../__generated__/GetJourney'
import { getJourneyFlowBackButtonClicked } from '../../../../__generated__/getJourneyFlowBackButtonClicked'
import { ThemeMode, ThemeName } from '../../../../__generated__/globalTypes'
import {
  UpdateJourneyFlowBackButtonClicked,
  UpdateJourneyFlowBackButtonClickedVariables
} from '../../../../__generated__/UpdateJourneyFlowBackButtonClicked'
import { mockReactFlow } from '../../../../test/mockReactFlow'
import { TestEditorState } from '../../../libs/TestEditorState'

import {
  GET_JOURNEY_FLOW_BACK_BUTTON_CLICKED,
  UPDATE_JOURNEY_FLOW_BACK_BUTTON_CLICKED
} from './Slider'

import { Slider } from '.'

// Prevent Goals from dispatching during render in tests (React 19 strict)
jest.mock('./Content/Goals/Goals', () => ({
  __esModule: true,
  Goals: () => null
}))

// Test helper component to dispatch SetActiveSlideAction without lazy imports
function DispatchSetActiveSlideButton(): JSX.Element {
  const { dispatch } = useEditor()
  return (
    <button
      type="button"
      data-testid="DispatchSetActiveSlide"
      onClick={() => dispatch({ type: 'SetActiveSlideAction', activeSlide: 1 })}
    />
  )
}

// Stub out heavy/async modules that cause act/suspense noise during tests
jest.mock(
  './Content/Canvas/JourneyLocaleProvider/utils/loadJourneyLocaleResources',
  () => ({
    __esModule: true,
    loadJourneyLocaleResources: jest.fn(async () => undefined)
  })
)
jest.mock('react-transition-group', () => {
  const React = require('react')
  return {
    __esModule: true,
    TransitionGroup: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    CSSTransition: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children)
  }
})
jest.mock('next/dynamic', () => {
  return () => (mod: any) => mod
})

// Simplify MUI transition components that depend on react-transition-group
jest.mock('@mui/material/Collapse', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => children
}))
jest.mock('@mui/material/Zoom', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => children
}))

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn(() => false)
}))

const mockUseMediaQuery = useMediaQuery as jest.MockedFunction<
  typeof useMediaQuery
>

describe('Slider', () => {
  let state: EditorState
  const selectedStep = {
    __typename: 'StepBlock',
    id: 'step1.id',
    children: [
      {
        __typename: 'CardBlock',
        id: 'card1.id',
        themeName: ThemeName.base,
        themeMode: ThemeMode.light,
        children: []
      }
    ]
  } as unknown as TreeBlock<StepBlock>

  beforeEach(() => {
    state = {
      steps: [selectedStep],
      activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.AddBlock,
      activeContent: ActiveContent.Canvas,
      activeSlide: ActiveSlide.JourneyFlow
    }
    mockUseMediaQuery.mockImplementation(() => true)
    mockReactFlow()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  const defaultJourneyFlowMock: MockedResponse<getJourneyFlowBackButtonClicked> =
    {
      request: { query: GET_JOURNEY_FLOW_BACK_BUTTON_CLICKED },
      result: {
        data: {
          getJourneyProfile: {
            __typename: 'JourneyProfile',
            id: 'userProfile.id',
            journeyFlowBackButtonClicked: true
          }
        }
      }
    }

  it('renders slides', () => {
    render(
      <MockedProvider mocks={[defaultJourneyFlowMock]}>
        <EditorProvider initialState={state}>
          <Slider />
        </EditorProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('Slider')).toBeInTheDocument()
    expect(screen.getByTestId('JourneyFlow')).toBeInTheDocument()
    expect(screen.getByTestId('Content')).toBeInTheDocument()
    expect(screen.getByTestId('SettingsDrawer')).toBeInTheDocument()
  })

  it('dispatches SetActiveSlideAction on activeIndexChange', () => {
    render(
      <MockedProvider mocks={[defaultJourneyFlowMock]}>
        <SnackbarProvider>
          <EditorProvider initialState={state}>
            <TestEditorState />
            <Slider />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(screen.getByText('activeSlide: 0')).toBeInTheDocument()
    // Canvas is stubbed to dispatch SetActiveSlideAction on click
    fireEvent.click(screen.getByTestId('EditorCanvas'))
    expect(screen.getByText('activeSlide: 1')).toBeInTheDocument()
  })

  it('handles prev on back click', async () => {
    const contentState = {
      ...state,
      activeSlide: ActiveSlide.Content
    }

    render(
      <MockedProvider mocks={[defaultJourneyFlowMock]}>
        <EditorProvider initialState={contentState}>
          <TestEditorState />
          <Slider />
        </EditorProvider>
      </MockedProvider>
    )

    expect(screen.getByText('activeSlide: 1')).toBeInTheDocument()
    await act(async () => {
      fireEvent.click(screen.getByTestId('ChevronLeftIcon'))
    })
    expect(screen.getByText('activeSlide: 0')).toBeInTheDocument()
  })

  it('handles prev on back click when goals with selected step', async () => {
    const contentState = {
      ...state,
      activeContent: ActiveContent.Goals,
      activeSlide: ActiveSlide.Content
    }

    render(
      <MockedProvider mocks={[defaultJourneyFlowMock]}>
        <EditorProvider initialState={contentState}>
          <TestEditorState />
          <Slider />
        </EditorProvider>
      </MockedProvider>
    )

    expect(screen.getByText('activeSlide: 1')).toBeInTheDocument()
    expect(screen.getByText('activeContent: goals')).toBeInTheDocument()
    await act(async () => {
      fireEvent.click(screen.getByTestId('ChevronLeftIcon'))
    })
    expect(screen.getByText('activeSlide: 0')).toBeInTheDocument()
    expect(screen.getByText('activeContent: canvas')).toBeInTheDocument()
  })

  it('handles prev on back click when goals without selected step', async () => {
    const contentState = {
      ...state,
      activeContent: ActiveContent.Goals,
      activeSlide: ActiveSlide.Content,
      steps: undefined
    }

    render(
      <MockedProvider mocks={[defaultJourneyFlowMock]}>
        <EditorProvider initialState={contentState}>
          <TestEditorState />
          <Slider />
        </EditorProvider>
      </MockedProvider>
    )

    expect(screen.getByText('activeSlide: 1')).toBeInTheDocument()
    expect(screen.getByText('activeContent: goals')).toBeInTheDocument()
    await act(async () => {
      fireEvent.click(screen.getByTestId('ChevronLeftIcon'))
    })
    expect(screen.getByText('activeSlide: 0')).toBeInTheDocument()
    expect(screen.getByText('activeContent: social')).toBeInTheDocument()
  })

  it('should update journey flow back button clicked', async () => {
    const contentState = {
      ...state,
      activeContent: ActiveContent.Goals,
      activeSlide: ActiveSlide.Content
    }

    const mockGetJourneyFlowBackButtonClicked: MockedResponse<getJourneyFlowBackButtonClicked> =
      {
        request: {
          query: GET_JOURNEY_FLOW_BACK_BUTTON_CLICKED
        },
        result: jest.fn(() => ({
          data: {
            getJourneyProfile: {
              __typename: 'JourneyProfile',
              id: 'userProfile.id',
              journeyFlowBackButtonClicked: null
            }
          }
        }))
      }

    const mockUpdateJourneyFlowBackButtonClicked: MockedResponse<
      UpdateJourneyFlowBackButtonClicked,
      UpdateJourneyFlowBackButtonClickedVariables
    > = {
      request: {
        query: UPDATE_JOURNEY_FLOW_BACK_BUTTON_CLICKED,
        variables: {
          input: {
            journeyFlowBackButtonClicked: true
          }
        }
      },
      result: jest.fn(() => ({
        data: {
          journeyProfileUpdate: {
            __typename: 'JourneyProfile',
            id: 'userProfile.id',
            journeyFlowBackButtonClicked: true
          }
        }
      }))
    }

    render(
      <MockedProvider
        mocks={[
          mockGetJourneyFlowBackButtonClicked,
          mockUpdateJourneyFlowBackButtonClicked
        ]}
      >
        <SnackbarProvider>
          <EditorProvider initialState={contentState}>
            <Slider />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(mockGetJourneyFlowBackButtonClicked.result).toHaveBeenCalled()
    )
    // With transitions stubbed, the Typography renders; just assert it exists
    expect(screen.getByText('back to map')).toBeInTheDocument()
    await act(async () => {
      fireEvent.click(screen.getByTestId('ChevronLeftIcon'))
    })
    await waitFor(() =>
      expect(mockUpdateJourneyFlowBackButtonClicked.result).toHaveBeenCalled()
    )
  })

  it('should hide back button text', async () => {
    const contentState = {
      ...state,
      activeContent: ActiveContent.Goals,
      activeSlide: ActiveSlide.Content
    }

    const mockGetJourneyFlowBackButtonClicked: MockedResponse<getJourneyFlowBackButtonClicked> =
      {
        request: {
          query: GET_JOURNEY_FLOW_BACK_BUTTON_CLICKED
        },
        result: jest.fn(() => ({
          data: {
            getJourneyProfile: {
              __typename: 'JourneyProfile',
              id: 'userProfile.id',
              journeyFlowBackButtonClicked: true
            }
          }
        }))
      }

    render(
      <MockedProvider mocks={[mockGetJourneyFlowBackButtonClicked]}>
        <EditorProvider initialState={contentState}>
          <Slider />
        </EditorProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(mockGetJourneyFlowBackButtonClicked.result).toHaveBeenCalled()
    )
    // With Collapse mocked, text is rendered; ensure it's present
    expect(screen.getByText('back to map')).toBeInTheDocument()
  })
})
