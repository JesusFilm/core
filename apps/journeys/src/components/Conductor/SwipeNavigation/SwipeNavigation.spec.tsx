import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { ComponentProps, ReactNode } from 'react'
import TagManager from 'react-gtm-module'
import { v4 as uuidv4 } from 'uuid'

import {
  TreeBlock,
  blockHistoryVar,
  treeBlocksVar
} from '@core/journeys/ui/block'
import {
  STEP_NEXT_EVENT_CREATE,
  STEP_PREVIOUS_EVENT_CREATE
} from '@core/journeys/ui/Card/Card'

import { BlockFields_StepBlock as StepBlock } from '../../../../__generated__/BlockFields'
import { StepNextEventCreate } from '../../../../__generated__/StepNextEventCreate'
import { StepPreviousEventCreate } from '../../../../__generated__/StepPreviousEventCreate'

import { swipeSensitivity } from './SwipeNavigation'

import { SwipeNavigation } from '.'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

jest.mock('react-gtm-module', () => ({
  __esModule: true,
  default: {
    dataLayer: jest.fn()
  }
}))

const mockedDataLayer = TagManager.dataLayer as jest.MockedFunction<
  typeof TagManager.dataLayer
>

describe('SwipeNavigation', () => {
  mockUuidv4.mockReturnValue('uuid')
  const swipeStart = 100
  const swipeLeft = swipeStart - (swipeSensitivity + 1)
  const swipeRight = swipeStart + (swipeSensitivity + 1)

  const SwipeTestComponent = (
    props: ComponentProps<typeof SwipeNavigation>
  ): ReactNode => (
    <SwipeNavigation {...props}>
      <Box data-testid="swipe-test-box" />
    </SwipeNavigation>
  )

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

  const mockStepNextEventCreate: MockedResponse<StepNextEventCreate> = {
    request: {
      query: STEP_NEXT_EVENT_CREATE,
      variables: {
        input: {
          id: 'uuid',
          blockId: 'step1.id',
          nextStepId: 'step2.id',
          label: 'Step {{number}}',
          value: 'Step {{number}}'
        }
      }
    },
    result: jest.fn(() => ({
      data: {
        stepNextEventCreate: {
          id: 'uuid',
          __typename: 'StepNextEvent'
        }
      }
    }))
  }

  const mockStepPreviousEventCreate: MockedResponse<StepPreviousEventCreate> = {
    request: {
      query: STEP_PREVIOUS_EVENT_CREATE,
      variables: {
        input: {
          id: 'uuid',
          blockId: 'step2.id',
          previousStepId: 'step1.id',
          label: 'Step {{number}}',
          value: 'Step {{number}}'
        }
      }
    },
    result: jest.fn(() => ({
      data: {
        stepPreviousEventCreate: {
          id: 'uuid',
          __typename: 'StepPreviousEvent'
        }
      }
    }))
  }

  it('should navigate to next card on swipe', () => {
    treeBlocksVar([step1, step2, step3])
    blockHistoryVar([step1])

    const { getByTestId } = render(
      <MockedProvider mocks={[mockStepNextEventCreate]}>
        <SwipeTestComponent activeBlock={step1} rtl={false} />
      </MockedProvider>
    )
    const swipeElement = getByTestId('swipe-test-box')

    fireEvent.touchStart(swipeElement, {
      changedTouches: [{ screenX: swipeStart }]
    })
    fireEvent.touchEnd(swipeElement, {
      changedTouches: [{ screenX: swipeLeft }]
    })

    expect(blockHistoryVar()).toHaveLength(2)
    expect(blockHistoryVar()[1].id).toBe('step2.id')
  })

  it('should navigate to previous card on swipe', () => {
    treeBlocksVar([step1, step2, step3])
    blockHistoryVar([step1, step2])

    const { getByTestId } = render(
      <MockedProvider mocks={[mockStepPreviousEventCreate]}>
        <SwipeTestComponent activeBlock={step2} rtl={false} />
      </MockedProvider>
    )
    const swipeElement = getByTestId('swipe-test-box')

    fireEvent.touchStart(swipeElement, {
      changedTouches: [{ screenX: swipeStart }]
    })
    fireEvent.touchEnd(swipeElement, {
      changedTouches: [{ screenX: swipeRight }]
    })

    expect(blockHistoryVar()).toHaveLength(1)
    expect(blockHistoryVar()[0].id).toBe('step1.id')
  })

  it('should block swiping forward on a locked card', async () => {
    const lockedStep1 = { ...step1, locked: true }
    treeBlocksVar([lockedStep1, step2, step3])
    blockHistoryVar([lockedStep1])

    const { getByTestId } = render(
      <MockedProvider>
        <SwipeTestComponent activeBlock={lockedStep1} rtl={false} />
      </MockedProvider>
    )
    const swipeElement = getByTestId('swipe-test-box')

    fireEvent.touchStart(swipeElement, {
      changedTouches: [{ screenX: swipeStart }]
    })
    fireEvent.touchEnd(swipeElement, {
      changedTouches: [{ screenX: swipeLeft }]
    })

    expect(blockHistoryVar()).toHaveLength(1)
  })

  it('should block previous swipe on first card', () => {
    treeBlocksVar([step1, step2, step3])
    blockHistoryVar([step1])

    const { getByTestId } = render(
      <MockedProvider>
        <SwipeTestComponent activeBlock={step1} rtl={false} />
      </MockedProvider>
    )
    const swipeElement = getByTestId('swipe-test-box')

    fireEvent.touchStart(swipeElement, {
      changedTouches: [{ screenX: swipeStart }]
    })
    fireEvent.touchEnd(swipeElement, {
      changedTouches: [{ screenX: swipeRight }]
    })

    expect(blockHistoryVar()).toHaveLength(1)
  })

  it('should block next swipe on last card', () => {
    treeBlocksVar([step1, step2, step3])
    blockHistoryVar([step1, step2, step3])

    const { getByTestId } = render(
      <MockedProvider>
        <SwipeTestComponent activeBlock={step3} rtl={false} />
      </MockedProvider>
    )
    const swipeElement = getByTestId('swipe-test-box')

    fireEvent.touchStart(swipeElement, {
      changedTouches: [{ screenX: swipeStart }]
    })
    fireEvent.touchEnd(swipeElement, {
      changedTouches: [{ screenX: swipeLeft }]
    })

    expect(blockHistoryVar()).toHaveLength(3)
  })

  it('should swipe next on rtl', () => {
    treeBlocksVar([step1, step2, step3])
    blockHistoryVar([step1])

    const { getByTestId } = render(
      <MockedProvider mocks={[mockStepNextEventCreate]}>
        <SwipeTestComponent activeBlock={step1} rtl />
      </MockedProvider>
    )
    const swipeElement = getByTestId('swipe-test-box')

    fireEvent.touchStart(swipeElement, {
      changedTouches: [{ screenX: swipeStart }]
    })
    fireEvent.touchEnd(swipeElement, {
      changedTouches: [{ screenX: swipeRight }]
    })

    expect(blockHistoryVar()).toHaveLength(2)
    expect(blockHistoryVar()[1].id).toBe('step2.id')
  })

  it('should swipe previous on rtl', () => {
    treeBlocksVar([step1, step2, step3])
    blockHistoryVar([step1, step2])

    const { getByTestId } = render(
      <MockedProvider mocks={[mockStepPreviousEventCreate]}>
        <SwipeTestComponent activeBlock={step2} rtl />
      </MockedProvider>
    )
    const swipeElement = getByTestId('swipe-test-box')

    fireEvent.touchStart(swipeElement, {
      changedTouches: [{ screenX: swipeStart }]
    })
    fireEvent.touchEnd(swipeElement, {
      changedTouches: [{ screenX: swipeLeft }]
    })

    expect(blockHistoryVar()).toHaveLength(1)
    expect(blockHistoryVar()[0].id).toBe('step1.id')
  })

  it('should create navigateNextEvent', async () => {
    treeBlocksVar([step1, step2, step3])
    blockHistoryVar([step1])

    const { getByTestId } = render(
      <MockedProvider mocks={[mockStepNextEventCreate]}>
        <SwipeTestComponent activeBlock={step1} rtl={false} />
      </MockedProvider>
    )
    const swipeElement = getByTestId('swipe-test-box')

    fireEvent.touchStart(swipeElement, {
      changedTouches: [{ screenX: swipeStart }]
    })
    fireEvent.touchEnd(swipeElement, {
      changedTouches: [{ screenX: swipeLeft }]
    })

    await waitFor(() =>
      expect(mockStepNextEventCreate.result).toHaveBeenCalled()
    )
  })

  it('should create navigatePreviousEvent', async () => {
    treeBlocksVar([step1, step2, step3])
    blockHistoryVar([step1, step2])

    const { getByTestId } = render(
      <MockedProvider mocks={[mockStepPreviousEventCreate]}>
        <SwipeTestComponent activeBlock={step2} rtl={false} />
      </MockedProvider>
    )
    const swipeElement = getByTestId('swipe-test-box')

    fireEvent.touchStart(swipeElement, {
      changedTouches: [{ screenX: swipeStart }]
    })
    fireEvent.touchEnd(swipeElement, {
      changedTouches: [{ screenX: swipeRight }]
    })

    await waitFor(() =>
      expect(mockStepPreviousEventCreate.result).toHaveBeenCalled()
    )
  })

  it('should add navigateNextEvent to datalayer', async () => {
    treeBlocksVar([step1, step2, step3])
    blockHistoryVar([step1])

    const { getByTestId } = render(
      <MockedProvider mocks={[mockStepNextEventCreate]}>
        <SwipeTestComponent activeBlock={step1} rtl={false} />
      </MockedProvider>
    )
    const swipeElement = getByTestId('swipe-test-box')

    fireEvent.touchStart(swipeElement, {
      changedTouches: [{ screenX: swipeStart }]
    })
    fireEvent.touchEnd(swipeElement, {
      changedTouches: [{ screenX: swipeLeft }]
    })

    await waitFor(() =>
      expect(mockedDataLayer).toHaveBeenCalledWith({
        dataLayer: {
          event: 'step_next',
          eventId: 'uuid',
          blockId: 'step1.id',
          stepName: 'Step {{number}}',
          targetStepId: 'step2.id',
          targetStepName: 'Step {{number}}'
        }
      })
    )
  })

  it('should add navigatePreviousEvent to datalayer', async () => {
    treeBlocksVar([step1, step2, step3])
    blockHistoryVar([step1, step2])

    const { getByTestId } = render(
      <MockedProvider mocks={[mockStepPreviousEventCreate]}>
        <SwipeTestComponent activeBlock={step2} rtl={false} />
      </MockedProvider>
    )
    const swipeElement = getByTestId('swipe-test-box')

    fireEvent.touchStart(swipeElement, {
      changedTouches: [{ screenX: swipeStart }]
    })
    fireEvent.touchEnd(swipeElement, {
      changedTouches: [{ screenX: swipeRight }]
    })

    await waitFor(() =>
      expect(mockedDataLayer).toHaveBeenCalledWith({
        dataLayer: {
          event: 'step_prev',
          eventId: 'uuid',
          blockId: 'step2.id',
          stepName: 'Step {{number}}',
          targetStepId: 'step1.id',
          targetStepName: 'Step {{number}}'
        }
      })
    )
  })
})
