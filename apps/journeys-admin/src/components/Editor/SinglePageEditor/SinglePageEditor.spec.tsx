import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { TreeBlock } from '@core/journeys/ui/block'
import {
  ActiveContent,
  ActiveSlide,
  EditorProvider
} from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { BlockFields_StepBlock as StepBlock } from '../../../../__generated__/BlockFields'
import { GetJourney_journey as Journey } from '../../../../__generated__/GetJourney'
import { getJourneyFlowBackButtonClicked } from '../../../../__generated__/getJourneyFlowBackButtonClicked'
import {
  UpdateJourneyFlowBackButtonClicked,
  UpdateJourneyFlowBackButtonClickedVariables
} from '../../../../__generated__/UpdateJourneyFlowBackButtonClicked'
import { TestEditorState } from '../../../libs/TestEditorState'
import {
  GET_JOURNEY_FLOW_BACK_BUTTON_CLICKED,
  UPDATE_JOURNEY_FLOW_BACK_BUTTON_CLICKED
} from '../Slider/Slider'

import { SinglePageEditor } from './SinglePageEditor'

jest.mock('../Slider/JourneyFlow', () => ({
  JourneyFlow: () => <div data-testid="JourneyFlow">JourneyFlow</div>
}))

jest.mock('../Slider/Content', () => ({
  Content: () => <div data-testid="Content">Content</div>
}))

jest.mock('../Slider/Settings', () => ({
  Settings: () => <div data-testid="Settings">Settings</div>
}))

describe('SinglePageEditor', () => {
  const journey = {
    __typename: 'Journey',
    id: 'journey-id',
    title: 'Journey Title',
    description: 'Journey Description',
    slug: 'journey-slug',
    createdAt: '2021-11-19T12:34:56.647Z',
    publishedAt: null,
    status: null,
    language: null,
    themeMode: null,
    themeName: null,
    blocks: []
  } as unknown as Journey

  const mockGetJourneyFlowBackButtonClicked: MockedResponse<getJourneyFlowBackButtonClicked> =
    {
      request: {
        query: GET_JOURNEY_FLOW_BACK_BUTTON_CLICKED
      },
      result: {
        data: {
          getJourneyProfile: {
            __typename: 'JourneyProfile',
            id: 'userProfile.id',
            journeyFlowBackButtonClicked: false
          }
        }
      }
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
    result: {
      data: {
        journeyProfileUpdate: {
          __typename: 'JourneyProfile',
          id: 'userProfile.id',
          journeyFlowBackButtonClicked: true
        }
      }
    }
  }

  it('renders JourneyFlow and Content components in initial state', () => {
    render(
      <MockedProvider>
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <EditorProvider initialState={{}}>
            <SinglePageEditor />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('JourneyFlow')).toBeInTheDocument()
    expect(screen.getByTestId('Content')).toBeInTheDocument()
  })

  it('shows Settings when activeSlide is Content', () => {
    render(
      <MockedProvider>
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <EditorProvider initialState={{ activeSlide: ActiveSlide.Content }}>
            <SinglePageEditor />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('Settings')).toBeInTheDocument()
  })

  it('shows Close details text when back button help is enabled', async () => {
    const mockGetJourneyFlowBackButtonClicked: MockedResponse<getJourneyFlowBackButtonClicked> =
      {
        request: {
          query: GET_JOURNEY_FLOW_BACK_BUTTON_CLICKED
        },
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

    render(
      <MockedProvider mocks={[mockGetJourneyFlowBackButtonClicked]}>
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <EditorProvider initialState={{ activeSlide: ActiveSlide.Content }}>
            <SinglePageEditor />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText('Close details')).not.toBeVisible()
    })
  })

  it('updates back button clicked on handleBack', async () => {
    const result = jest.fn(() => ({
      ...mockUpdateJourneyFlowBackButtonClicked.result
    }))

    render(
      <MockedProvider
        mocks={[
          mockGetJourneyFlowBackButtonClicked,
          { ...mockUpdateJourneyFlowBackButtonClicked, result }
        ]}
      >
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <EditorProvider initialState={{ activeSlide: ActiveSlide.Content }}>
            <TestEditorState />
            <SinglePageEditor />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    expect(screen.getByText('activeSlide: 1')).toBeInTheDocument()

    expect(screen.getByText('Close details')).toBeInTheDocument()
    const backButton = screen.getByRole('button')
    fireEvent.click(backButton)

    await waitFor(() => {
      expect(result).toHaveBeenCalled()
    })
    expect(screen.getByText('activeSlide: 0')).toBeInTheDocument()
  })

  it('sets editor focus when in non-Canvas content on handleBack', async () => {
    const step: TreeBlock<StepBlock> = {
      id: 'step1.id',
      __typename: 'StepBlock',
      parentBlockId: null,
      parentOrder: 0,
      locked: false,
      nextBlockId: null,
      slug: null,
      children: []
    } as unknown as TreeBlock<StepBlock>

    render(
      <MockedProvider
        mocks={[
          mockGetJourneyFlowBackButtonClicked,
          mockUpdateJourneyFlowBackButtonClicked
        ]}
      >
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <EditorProvider
            initialState={{
              steps: [step],
              selectedStep: step,
              activeSlide: ActiveSlide.Content,
              activeContent: ActiveContent.Social
            }}
          >
            <TestEditorState />
            <SinglePageEditor />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    expect(screen.getByText('activeSlide: 1')).toBeInTheDocument()
    expect(screen.getByText('activeContent: social')).toBeInTheDocument()

    const backButton = screen.getByRole('button')
    fireEvent.click(backButton)

    expect(screen.getByText('activeContent: canvas')).toBeInTheDocument()
    expect(screen.getByText('activeSlide: 0')).toBeInTheDocument()
    expect(screen.getByText('selectedStep: step1.id')).toBeInTheDocument()
  })

  it('only updates slide when in Canvas content on handleBack', async () => {
    const step: TreeBlock<StepBlock> = {
      id: 'step1.id',
      __typename: 'StepBlock',
      parentBlockId: null,
      parentOrder: 0,
      locked: false,
      nextBlockId: null,
      slug: null,
      children: []
    } as unknown as TreeBlock<StepBlock>

    render(
      <MockedProvider
        mocks={[
          mockGetJourneyFlowBackButtonClicked,
          mockUpdateJourneyFlowBackButtonClicked
        ]}
      >
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <EditorProvider
            initialState={{
              steps: [step],
              selectedStep: step,
              activeSlide: ActiveSlide.Content,
              activeContent: ActiveContent.Canvas
            }}
          >
            <TestEditorState />
            <SinglePageEditor />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    expect(screen.getByText('activeSlide: 1')).toBeInTheDocument()
    expect(screen.getByText('activeContent: canvas')).toBeInTheDocument()

    const backButton = screen.getByRole('button')
    fireEvent.click(backButton)

    expect(screen.getByText('activeContent: canvas')).toBeInTheDocument()
    expect(screen.getByText('activeSlide: 0')).toBeInTheDocument()
  })
})
