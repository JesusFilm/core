import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ReactFlowProvider } from 'reactflow'
import { v4 as uuidv4 } from 'uuid'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../../../../__generated__/GetJourney'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../../../../../__generated__/globalTypes'
import { mockReactFlow } from '../../../../../../../test/mockReactFlow'
import { STEP_AND_CARD_BLOCK_CREATE } from '../../../../../../libs/useStepAndCardBlockCreateMutation/useStepAndCardBlockCreateMutation'

import { BaseNode } from './BaseNode'

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

describe('BaseNode', () => {
  beforeEach(() => {
    mockReactFlow()
  })

  const mockJourney: Journey = {
    __typename: 'Journey',
    id: 'Journey1.id',
    themeName: ThemeName.base,
    themeMode: ThemeMode.dark,
    featuredAt: null,
    title: 'my journey',
    strategySlug: null,
    slug: 'my-journey',
    language: {
      __typename: 'Language',
      id: '529',
      bcp47: 'en',
      iso3: 'eng',
      name: [
        {
          __typename: 'Translation',
          value: 'English',
          primary: true
        }
      ]
    },
    description: 'my cool journey',
    status: JourneyStatus.draft,
    createdAt: '2021-11-19T12:34:56.647Z',
    publishedAt: null,
    blocks: [],
    primaryImageBlock: null,
    creatorDescription: null,
    creatorImageBlock: null,
    userJourneys: [],
    template: null,
    seoTitle: null,
    seoDescription: null,
    chatButtons: [],
    host: null,
    team: null,
    tags: []
  }

  const stepAndCardBlockResult = jest.fn(() => ({
    data: {
      stepBlockCreate: {
        __typename: 'StepBlock',
        id: 'Step1.id',
        parentBlockId: null,
        parentOrder: 1,
        locked: false,
        nextBlockId: null
      },
      cardBlockCreate: {
        id: 'Card1.id',
        parentBlockId: 'Step1.id',
        parentOrder: 0,
        backgroundColor: null,
        coverBlockId: null,
        themeName: ThemeName.base,
        themeMode: ThemeMode.dark,
        fullscreen: false,
        __typename: 'CardBlock'
      }
    }
  }))

  const stepAndCardBlockCreateBlockMock = {
    request: {
      query: STEP_AND_CARD_BLOCK_CREATE,
      variables: {
        stepBlockCreateInput: {
          id: 'Step1.id',
          journeyId: mockJourney.id
        },
        cardBlockCreateInput: {
          id: 'Card1.id',
          journeyId: mockJourney.id,
          parentBlockId: 'Step1.id',
          themeName: ThemeName.base,
          themeMode: ThemeMode.dark
        }
      }
    },
    result: stepAndCardBlockResult
  }

  it('should render with default properties', () => {
    render(
      <MockedProvider>
        <BaseNode />
      </MockedProvider>
    )

    expect(screen.getByTestId('base-node')).toBeInTheDocument()
  })

  it('should render target handles', () => {
    render(
      <ReactFlowProvider>
        <MockedProvider>
          <BaseNode isTargetConnectable />
        </MockedProvider>
      </ReactFlowProvider>
    )

    expect(
      screen.getByTestId('base-node-top-target-handle')
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('base-node-bottom-target-handle')
    ).toBeInTheDocument()
  })

  it('should render source handles', async () => {
    render(
      <ReactFlowProvider>
        <MockedProvider>
          <BaseNode isSourceConnectable />
        </MockedProvider>
      </ReactFlowProvider>
    )

    expect(
      screen.getByTestId('base-node-source-handle-icon')
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('base-node-source-handle-area')
    ).toBeInTheDocument()
  })

  it('should render arrow icon', () => {
    render(
      <ReactFlowProvider>
        <MockedProvider>
          <BaseNode isSourceConnectable="arrow" />
        </MockedProvider>
      </ReactFlowProvider>
    )

    expect(
      screen.getByTestId('base-node-downward-arrow-icon')
    ).toBeInTheDocument()
  })

  it('should create new node when clicking on source handle', async () => {
    const mockSourceConnect = jest.fn()
    mockUuidv4.mockReturnValueOnce('Step1.id').mockReturnValueOnce('Card1.id')

    render(
      <JourneyProvider value={{ journey: mockJourney }}>
        <ReactFlowProvider>
          <MockedProvider mocks={[stepAndCardBlockCreateBlockMock]}>
            <BaseNode
              isSourceConnectable="arrow"
              onSourceConnect={mockSourceConnect}
            />
          </MockedProvider>
        </ReactFlowProvider>
      </JourneyProvider>
    )

    const sourceHandle = screen.getByTestId('base-node-source-handle-area')

    fireEvent.click(sourceHandle)

    await waitFor(() =>
      expect(stepAndCardBlockCreateBlockMock.result).toHaveBeenCalled()
    )
    expect(mockSourceConnect).toHaveBeenCalledTimes(1)
  })
})
