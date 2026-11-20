import { MockLink } from '@apollo/client/testing'
import { MockedProvider } from '@apollo/client/testing/react'
import { fireEvent, render, waitFor } from '@testing-library/react'

import {
  TreeBlock,
  blockHistoryVar,
  treeBlocksVar
} from '@core/journeys/ui/block'
import {
  showHeaderFooterVar,
  showNavigationVar
} from '@core/journeys/ui/block/block'
import { STEP_VIEW_EVENT_CREATE } from '@core/journeys/ui/Step/Step'

import { BlockFields_StepBlock as StepBlock } from '../../../../__generated__/BlockFields'
import { StepViewEventCreate } from '../../../../__generated__/StepViewEventCreate'

import { DynamicCardList } from './DynamicCardList'

vi.mock('uuid', () => ({
  __esModule: true,
  v4: () => 'uuid'
}))

describe('DynamicCardList', () => {
  const step1: TreeBlock<StepBlock> = {
    id: 'step1.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 0,
    locked: false,
    nextBlockId: null,
    slug: null,
    children: []
  }
  const step2: TreeBlock<StepBlock> = {
    id: 'step2.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 1,
    locked: false,
    nextBlockId: 'step3.id',
    slug: null,
    children: []
  }
  const step3: TreeBlock<StepBlock> = {
    id: 'step3.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 2,
    locked: false,
    nextBlockId: null,
    slug: null,
    children: []
  }
  const step4: TreeBlock<StepBlock> = {
    id: 'step4.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 2,
    locked: false,
    nextBlockId: null,
    slug: null,
    children: []
  }

  const mockStepViewEventCreate: MockLink.MockedResponse<StepViewEventCreate> =
    {
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
  const blocks = [step1, step2, step3, step4]

  beforeEach(() => {
    treeBlocksVar(blocks)
    blockHistoryVar([step1, step2])
    showNavigationVar(false)
    showHeaderFooterVar(false)
  })

  afterEach(() => {
    blockHistoryVar([])
    treeBlocksVar([])
    vi.clearAllMocks()
  })

  it('should prerender cards', () => {
    const { getByTestId, queryByTestId } = render(
      <MockedProvider mocks={[mockStepViewEventCreate]}>
        <DynamicCardList blocks={blocks} />
      </MockedProvider>
    )

    expect(getByTestId('journey-card-step2.id')).toBeVisible()
    expect(getByTestId('journey-card-step1.id')).not.toBeVisible()
    expect(getByTestId('journey-card-step3.id')).not.toBeVisible()
    expect(queryByTestId('journey-card-step4.id')).not.toBeInTheDocument()
  })

  it('should show navigation arrows on click', () => {
    const { getByTestId } = render(
      <MockedProvider mocks={[mockStepViewEventCreate]}>
        <DynamicCardList blocks={blocks} />
      </MockedProvider>
    )

    fireEvent.click(getByTestId('journey-card-step2.id'))
    expect(showNavigationVar()).toBe(true)
  })

  it('should set showHeaderAndFooter to true', async () => {
    render(
      <MockedProvider mocks={[mockStepViewEventCreate]}>
        <DynamicCardList blocks={blocks} />
      </MockedProvider>
    )

    await waitFor(() => expect(showHeaderFooterVar()).toBe(true))
  })

  it('should show first block if useBlocks has not finished running', () => {
    treeBlocksVar([])
    blockHistoryVar([])

    const { getByTestId } = render(
      <MockedProvider mocks={[]}>
        <DynamicCardList blocks={blocks} />
      </MockedProvider>
    )

    expect(getByTestId('journey-card-step1.id')).toBeVisible()
  })
})
