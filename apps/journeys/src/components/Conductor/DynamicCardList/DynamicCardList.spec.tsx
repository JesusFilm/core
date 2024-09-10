import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { TreeBlock, useBlocks } from '@core/journeys/ui/block'
import { STEP_VIEW_EVENT_CREATE } from '@core/journeys/ui/Step/Step'

import { BlockFields_StepBlock as StepBlock } from '../../../../__generated__/BlockFields'
import { StepViewEventCreate } from '../../../../__generated__/StepViewEventCreate'

import { DynamicCardList } from './DynamicCardList'

jest.mock('@core/journeys/ui/block', () => ({
  __esModule: true,
  ...jest.requireActual('@core/journeys/ui/block'),
  useBlocks: jest.fn()
}))

jest.mock('uuid', () => ({
  __esModule: true,
  v4: () => 'uuid'
}))

const mockUseBlocks = useBlocks as jest.MockedFunction<typeof useBlocks>

describe('DynamicCardList', () => {
  const step1: TreeBlock<StepBlock> = {
    id: 'step1.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 0,
    locked: false,
    nextBlockId: null,
    children: []
  }
  const step2: TreeBlock<StepBlock> = {
    id: 'step2.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 1,
    locked: false,
    nextBlockId: null,
    children: []
  }
  const step3: TreeBlock<StepBlock> = {
    id: 'step3.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 2,
    locked: false,
    nextBlockId: null,
    children: []
  }
  const step4: TreeBlock<StepBlock> = {
    id: 'step4.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 2,
    locked: false,
    nextBlockId: null,
    children: []
  }

  const mockStepViewEventCreate: MockedResponse<StepViewEventCreate> = {
    request: {
      query: STEP_VIEW_EVENT_CREATE,
      variables: {
        input: {
          id: 'uuid',
          blockId: 'step2.id',
          value: 'Step {{number}}'
        }
      }
    },
    result: {
      data: {
        stepViewEventCreate: {
          id: 'uuid',
          __typename: 'StepViewEvent'
        }
      }
    }
  }
  const defaultUseBlockMocks = {
    blockHistory: [step1, step2],
    treeBlocks: [step1, step2, step3, step4],
    getNextBlock: () => step3,
    setShowNavigation: jest.fn(),
    setShowHeaderFooter: jest.fn(),
    previousActiveBlock: jest.fn(),
    nextActiveBlock: jest.fn(),
    setTreeBlocks: jest.fn(),
    showHeaderFooter: true,
    showNavigation: true
  }

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should prerender cards', () => {
    mockUseBlocks.mockReturnValue({ ...defaultUseBlockMocks })

    const { getByTestId, queryByTestId } = render(
      <MockedProvider mocks={[mockStepViewEventCreate]}>
        <DynamicCardList blocks={defaultUseBlockMocks.treeBlocks} />
      </MockedProvider>
    )

    expect(getByTestId('journey-card-step2.id')).toBeVisible()
    expect(getByTestId('journey-card-step1.id')).not.toBeVisible()
    expect(getByTestId('journey-card-step3.id')).not.toBeVisible()
    expect(queryByTestId('journey-card-step4.id')).not.toBeInTheDocument()
  })

  it('should show navigation arrows on click', () => {
    const mockSetShowNavigation = jest.fn()
    mockUseBlocks.mockReturnValue({
      ...defaultUseBlockMocks,
      setShowNavigation: mockSetShowNavigation
    })

    const { getByTestId } = render(
      <MockedProvider mocks={[mockStepViewEventCreate]}>
        <DynamicCardList blocks={defaultUseBlockMocks.treeBlocks} />
      </MockedProvider>
    )

    fireEvent.click(getByTestId('journey-card-step2.id'))
    expect(mockSetShowNavigation).toHaveBeenCalledWith(true)
  })

  it('should set showHeaderAndFooter to true', async () => {
    const mockSetShowHeaderFooter = jest.fn()
    mockUseBlocks.mockReturnValue({
      ...defaultUseBlockMocks,
      setShowHeaderFooter: mockSetShowHeaderFooter
    })

    render(
      <MockedProvider mocks={[mockStepViewEventCreate]}>
        <DynamicCardList blocks={defaultUseBlockMocks.treeBlocks} />
      </MockedProvider>
    )

    await waitFor(() =>
      expect(mockSetShowHeaderFooter).toHaveBeenCalledWith(true)
    )
  })

  it('should show first block if useBlocks has not finished running', () => {
    mockUseBlocks.mockReturnValue({
      ...defaultUseBlockMocks,
      treeBlocks: [],
      blockHistory: []
    })

    const { getByTestId } = render(
      <MockedProvider mocks={[]}>
        <DynamicCardList blocks={defaultUseBlockMocks.treeBlocks} />
      </MockedProvider>
    )

    expect(getByTestId('journey-card-step1.id')).toBeVisible()
  })
})
