import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import useMediaQuery from '@mui/material/useMediaQuery'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { TreeBlock } from '@core/journeys/ui/block'
import {
  ActiveCanvasDetailsDrawer,
  ActiveContent,
  ActiveSlide,
  EditorProvider,
  EditorState
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

  it('renders slides', () => {
    render(
      <MockedProvider>
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
      <MockedProvider>
        <SnackbarProvider>
          <EditorProvider initialState={state}>
            <TestEditorState />
            <Slider />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(screen.getByText('activeSlide: 0')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('EditorCanvas'))
    expect(screen.getByText('activeSlide: 1')).toBeInTheDocument()
  })

  it('handles prev on back click', async () => {
    const contentState = {
      ...state,
      activeSlide: ActiveSlide.Content
    }

    render(
      <MockedProvider>
        <EditorProvider initialState={contentState}>
          <TestEditorState />
          <Slider />
        </EditorProvider>
      </MockedProvider>
    )

    expect(screen.getByText('activeSlide: 1')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('ChevronLeftIcon'))
    expect(screen.getByText('activeSlide: 0')).toBeInTheDocument()
  })

  it('handles prev on back click when goals with selected step', async () => {
    const contentState = {
      ...state,
      activeContent: ActiveContent.Goals,
      activeSlide: ActiveSlide.Content
    }

    render(
      <MockedProvider>
        <EditorProvider initialState={contentState}>
          <TestEditorState />
          <Slider />
        </EditorProvider>
      </MockedProvider>
    )

    expect(screen.getByText('activeSlide: 1')).toBeInTheDocument()
    expect(screen.getByText('activeContent: goals')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('ChevronLeftIcon'))
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
      <MockedProvider>
        <EditorProvider initialState={contentState}>
          <TestEditorState />
          <Slider />
        </EditorProvider>
      </MockedProvider>
    )

    expect(screen.getByText('activeSlide: 1')).toBeInTheDocument()
    expect(screen.getByText('activeContent: goals')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('ChevronLeftIcon'))
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
    expect(screen.getByText('back to map')).toBeVisible()
    fireEvent.click(screen.getByTestId('ChevronLeftIcon'))
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
    expect(screen.getByText('back to map')).not.toBeVisible()
  })
})
