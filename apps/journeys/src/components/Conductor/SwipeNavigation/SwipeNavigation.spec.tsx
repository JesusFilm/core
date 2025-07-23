import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { sendGTMEvent } from '@next/third-parties/google'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { usePlausible } from 'next-plausible'
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
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { keyify } from '@core/journeys/ui/plausibleHelpers'

import { BlockFields_StepBlock as StepBlock } from '../../../../__generated__/BlockFields'
import { GetJourney_journey as Journey } from '../../../../__generated__/GetJourney'
import { StepNextEventCreate } from '../../../../__generated__/StepNextEventCreate'
import { StepPreviousEventCreate } from '../../../../__generated__/StepPreviousEventCreate'

import { SwipeNavigation } from '.'

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

jest.mock('@next/third-parties/google', () => ({
  sendGTMEvent: jest.fn()
}))

const mockedSendGTMEvent = sendGTMEvent as jest.MockedFunction<
  typeof sendGTMEvent
>

jest.mock('next-plausible', () => ({
  __esModule: true,
  usePlausible: jest.fn()
}))

const mockUsePlausible = usePlausible as jest.MockedFunction<
  typeof usePlausible
>

describe('SwipeNavigation', () => {
  mockUuidv4.mockReturnValue('uuid')
  const swipeLeft = -100
  const swipeRight = 100

  const mockOrigin = 'https://example.com'

  beforeAll(() => {
    // Jest v30 compatible way to mock window.location
    delete (window as any).location
    window.location = { ...window.location, origin: mockOrigin } as any
  })

  afterAll(() => {
    // Reset is handled by Jest automatically in v30
  })

  const step1: TreeBlock<StepBlock> = {
    id: 'step1.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 0,
    locked: false,
    nextBlockId: 'step2.id',
    slug: null,
    children: []
  }
  const step2: TreeBlock<StepBlock> = {
    id: 'step2.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 1,
    locked: false,
    nextBlockId: null,
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

  const journey = {
    id: 'journey.id'
  } as unknown as Journey

  it('should navigate to next card on swipe', () => {
    treeBlocksVar([step1, step2, step3])
    blockHistoryVar([step1])

    const { getByTestId } = render(
      <MockedProvider mocks={[mockStepNextEventCreate]}>
        <SwipeNavigation activeBlock={step1} rtl={false}>
          <Box data-testid="swipe-test-box" />
        </SwipeNavigation>
      </MockedProvider>
    )
    const swipeElement = getByTestId('swipe-test-box')

    fireEvent.touchStart(swipeElement, {
      touches: [{ clientX: 0, clientY: 0 }]
    })
    fireEvent.touchMove(swipeElement, {
      touches: [{ clientX: swipeLeft, clientY: 0 }]
    })
    fireEvent.touchEnd(swipeElement)

    expect(blockHistoryVar()).toHaveLength(2)
    expect(blockHistoryVar()[1].id).toBe('step2.id')
  })

  it('should navigate to previous card on swipe', () => {
    treeBlocksVar([step1, step2, step3])
    blockHistoryVar([step1, step2])

    const { getByTestId } = render(
      <MockedProvider mocks={[mockStepPreviousEventCreate]}>
        <SwipeNavigation activeBlock={step2} rtl={false}>
          <Box data-testid="swipe-test-box" />
        </SwipeNavigation>
      </MockedProvider>
    )
    const swipeElement = getByTestId('swipe-test-box')

    fireEvent.touchStart(swipeElement, {
      touches: [{ clientX: 0, clientY: 0 }]
    })
    fireEvent.touchMove(swipeElement, {
      touches: [{ clientX: swipeRight, clientY: 0 }]
    })
    fireEvent.touchEnd(swipeElement)

    expect(blockHistoryVar()).toHaveLength(1)
    expect(blockHistoryVar()[0].id).toBe('step1.id')
  })

  it('should block swiping forward on a locked card', async () => {
    const lockedStep1 = { ...step1, locked: true }
    treeBlocksVar([lockedStep1, step2, step3])
    blockHistoryVar([lockedStep1])

    const { getByTestId } = render(
      <MockedProvider>
        <SwipeNavigation activeBlock={lockedStep1} rtl={false}>
          <Box data-testid="swipe-test-box" />
        </SwipeNavigation>
      </MockedProvider>
    )
    const swipeElement = getByTestId('swipe-test-box')

    fireEvent.touchStart(swipeElement, {
      touches: [{ clientX: 0, clientY: 0 }]
    })
    fireEvent.touchMove(swipeElement, {
      touches: [{ clientX: swipeLeft, clientY: 0 }]
    })
    fireEvent.touchEnd(swipeElement)

    expect(blockHistoryVar()).toHaveLength(1)
  })

  it('should block previous swipe on first card', () => {
    treeBlocksVar([step1, step2, step3])
    blockHistoryVar([step1])

    const { getByTestId } = render(
      <MockedProvider>
        <SwipeNavigation activeBlock={step1} rtl={false}>
          <Box data-testid="swipe-test-box" />
        </SwipeNavigation>
      </MockedProvider>
    )
    const swipeElement = getByTestId('swipe-test-box')

    fireEvent.touchStart(swipeElement, {
      touches: [{ clientX: 0, clientY: 0 }]
    })
    fireEvent.touchMove(swipeElement, {
      touches: [{ clientX: swipeRight, clientY: 0 }]
    })
    fireEvent.touchEnd(swipeElement)

    expect(blockHistoryVar()).toHaveLength(1)
  })

  it('should block next swipe on last card', () => {
    treeBlocksVar([step1, step2, step3])
    blockHistoryVar([step1, step2, step3])

    const { getByTestId } = render(
      <MockedProvider>
        <SwipeNavigation activeBlock={step3} rtl={false}>
          <Box data-testid="swipe-test-box" />
        </SwipeNavigation>
      </MockedProvider>
    )
    const swipeElement = getByTestId('swipe-test-box')

    fireEvent.touchStart(swipeElement, {
      touches: [{ clientX: 0, clientY: 0 }]
    })
    fireEvent.touchMove(swipeElement, {
      touches: [{ clientX: swipeLeft, clientY: 0 }]
    })
    fireEvent.touchEnd(swipeElement)

    expect(blockHistoryVar()).toHaveLength(3)
  })

  it('should block swipe left on mui slider', () => {
    treeBlocksVar([step1, step2, step3])
    blockHistoryVar([step1])

    const { getByTestId } = render(
      <MockedProvider>
        <SwipeNavigation activeBlock={step1} rtl={false}>
          <Box data-testid="swipe-test-box-root" className="MuiSlider-root" />
          <Box data-testid="swipe-test-box-rail" className="MuiSlider-rail" />
          <Box data-testid="swipe-test-box-track" className="MuiSlider-track" />
          <Box data-testid="swipe-test-box-thumb" className="MuiSlider-thumb" />
        </SwipeNavigation>
      </MockedProvider>
    )
    const swipeElementRoot = getByTestId('swipe-test-box-root')
    const swipeElementRail = getByTestId('swipe-test-box-rail')
    const swipeElementTrack = getByTestId('swipe-test-box-track')
    const swipeElementThumb = getByTestId('swipe-test-box-thumb')

    fireEvent.touchStart(swipeElementRoot, {
      touches: [{ clientX: 0, clientY: 0 }]
    })
    fireEvent.touchMove(swipeElementRoot, {
      touches: [{ clientX: swipeLeft, clientY: 0 }]
    })
    fireEvent.touchEnd(swipeElementRoot)

    fireEvent.touchStart(swipeElementRail, {
      touches: [{ clientX: 0, clientY: 0 }]
    })
    fireEvent.touchMove(swipeElementRail, {
      touches: [{ clientX: swipeLeft, clientY: 0 }]
    })
    fireEvent.touchEnd(swipeElementRail)

    fireEvent.touchStart(swipeElementTrack, {
      touches: [{ clientX: 0, clientY: 0 }]
    })
    fireEvent.touchMove(swipeElementTrack, {
      touches: [{ clientX: swipeLeft, clientY: 0 }]
    })
    fireEvent.touchEnd(swipeElementTrack)

    fireEvent.touchStart(swipeElementThumb, {
      touches: [{ clientX: 0, clientY: 0 }]
    })
    fireEvent.touchMove(swipeElementThumb, {
      touches: [{ clientX: swipeLeft, clientY: 0 }]
    })
    fireEvent.touchEnd(swipeElementThumb)

    expect(blockHistoryVar()).toHaveLength(1)
  })

  it('should block swipe right on mui slider', () => {
    treeBlocksVar([step1, step2, step3])
    blockHistoryVar([step1, step2])

    const { getByTestId } = render(
      <MockedProvider>
        <SwipeNavigation activeBlock={step2} rtl={false}>
          <Box data-testid="swipe-test-box-root" className="MuiSlider-root" />
          <Box data-testid="swipe-test-box-rail" className="MuiSlider-rail" />
          <Box data-testid="swipe-test-box-track" className="MuiSlider-track" />
          <Box data-testid="swipe-test-box-thumb" className="MuiSlider-thumb" />
        </SwipeNavigation>
      </MockedProvider>
    )
    const swipeElementRoot = getByTestId('swipe-test-box-root')
    const swipeElementRail = getByTestId('swipe-test-box-rail')
    const swipeElementTrack = getByTestId('swipe-test-box-track')
    const swipeElementThumb = getByTestId('swipe-test-box-thumb')

    fireEvent.touchStart(swipeElementRoot, {
      touches: [{ clientX: 0, clientY: 0 }]
    })
    fireEvent.touchMove(swipeElementRoot, {
      touches: [{ clientX: swipeLeft, clientY: 0 }]
    })
    fireEvent.touchEnd(swipeElementRoot)

    fireEvent.touchStart(swipeElementRail, {
      touches: [{ clientX: 0, clientY: 0 }]
    })
    fireEvent.touchMove(swipeElementRail, {
      touches: [{ clientX: swipeLeft, clientY: 0 }]
    })
    fireEvent.touchEnd(swipeElementRail)

    fireEvent.touchStart(swipeElementTrack, {
      touches: [{ clientX: 0, clientY: 0 }]
    })
    fireEvent.touchMove(swipeElementTrack, {
      touches: [{ clientX: swipeLeft, clientY: 0 }]
    })
    fireEvent.touchEnd(swipeElementTrack)

    fireEvent.touchStart(swipeElementThumb, {
      touches: [{ clientX: 0, clientY: 0 }]
    })
    fireEvent.touchMove(swipeElementThumb, {
      touches: [{ clientX: swipeLeft, clientY: 0 }]
    })
    fireEvent.touchEnd(swipeElementThumb)

    expect(blockHistoryVar()).toHaveLength(2)
  })

  it('should swipe next on rtl', () => {
    treeBlocksVar([step1, step2, step3])
    blockHistoryVar([step1])

    const { getByTestId } = render(
      <MockedProvider mocks={[mockStepNextEventCreate]}>
        <SwipeNavigation activeBlock={step1} rtl>
          <Box data-testid="swipe-test-box" />
        </SwipeNavigation>
      </MockedProvider>
    )
    const swipeElement = getByTestId('swipe-test-box')

    fireEvent.touchStart(swipeElement, {
      touches: [{ clientX: 0, clientY: 0 }]
    })
    fireEvent.touchMove(swipeElement, {
      touches: [{ clientX: swipeRight, clientY: 0 }]
    })
    fireEvent.touchEnd(swipeElement)

    expect(blockHistoryVar()).toHaveLength(2)
    expect(blockHistoryVar()[1].id).toBe('step2.id')
  })

  it('should swipe previous on rtl', () => {
    treeBlocksVar([step1, step2, step3])
    blockHistoryVar([step1, step2])

    const { getByTestId } = render(
      <MockedProvider mocks={[mockStepPreviousEventCreate]}>
        <SwipeNavigation activeBlock={step2} rtl>
          <Box data-testid="swipe-test-box" />
        </SwipeNavigation>
      </MockedProvider>
    )
    const swipeElement = getByTestId('swipe-test-box')

    fireEvent.touchStart(swipeElement, {
      touches: [{ clientX: 0, clientY: 0 }]
    })
    fireEvent.touchMove(swipeElement, {
      touches: [{ clientX: swipeLeft, clientY: 0 }]
    })
    fireEvent.touchEnd(swipeElement)

    expect(blockHistoryVar()).toHaveLength(1)
    expect(blockHistoryVar()[0].id).toBe('step1.id')
  })

  it('should create navigateNextEvent', async () => {
    treeBlocksVar([step1, step2, step3])
    blockHistoryVar([step1])
    const mockPlausible = jest.fn()
    mockUsePlausible.mockReturnValue(mockPlausible)

    const { getByTestId } = render(
      <MockedProvider mocks={[mockStepNextEventCreate]}>
        <JourneyProvider value={{ journey }}>
          <SwipeNavigation activeBlock={step1} rtl={false}>
            <Box data-testid="swipe-test-box" />
          </SwipeNavigation>
        </JourneyProvider>
      </MockedProvider>
    )
    const swipeElement = getByTestId('swipe-test-box')

    fireEvent.touchStart(swipeElement, {
      touches: [{ clientX: 0, clientY: 0 }]
    })
    fireEvent.touchMove(swipeElement, {
      touches: [{ clientX: swipeLeft, clientY: 0 }]
    })
    fireEvent.touchEnd(swipeElement)

    await waitFor(() =>
      expect(mockStepNextEventCreate.result).toHaveBeenCalled()
    )
    expect(mockPlausible).toHaveBeenCalledWith('navigateNextStep', {
      u: `${mockOrigin}/journey.id/step1.id`,
      props: {
        id: 'uuid',
        blockId: 'step1.id',
        label: 'Step {{number}}',
        value: 'Step {{number}}',
        nextStepId: 'step2.id',
        key: keyify({
          stepId: 'step1.id',
          event: 'navigateNextStep',
          blockId: 'step1.id',
          target: 'step2.id'
        }),
        simpleKey: keyify({
          stepId: 'step1.id',
          event: 'navigateNextStep',
          blockId: 'step1.id'
        })
      }
    })
  })

  it('should create navigatePreviousEvent', async () => {
    treeBlocksVar([step1, step2, step3])
    blockHistoryVar([step1, step2])
    const mockPlausible = jest.fn()
    mockUsePlausible.mockReturnValue(mockPlausible)

    const { getByTestId } = render(
      <MockedProvider mocks={[mockStepPreviousEventCreate]}>
        <JourneyProvider value={{ journey }}>
          <SwipeNavigation activeBlock={step2} rtl={false}>
            <Box data-testid="swipe-test-box" />
          </SwipeNavigation>
        </JourneyProvider>
      </MockedProvider>
    )
    const swipeElement = getByTestId('swipe-test-box')

    fireEvent.touchStart(swipeElement, {
      touches: [{ clientX: 0, clientY: 0 }]
    })
    fireEvent.touchMove(swipeElement, {
      touches: [{ clientX: swipeRight, clientY: 0 }]
    })
    fireEvent.touchEnd(swipeElement)

    await waitFor(() =>
      expect(mockStepPreviousEventCreate.result).toHaveBeenCalled()
    )
    expect(mockPlausible).toHaveBeenCalledWith('navigatePreviousStep', {
      u: `${mockOrigin}/journey.id/step2.id`,
      props: {
        id: 'uuid',
        blockId: 'step2.id',
        label: 'Step {{number}}',
        value: 'Step {{number}}',
        previousStepId: 'step1.id',
        key: keyify({
          stepId: 'step2.id',
          event: 'navigatePreviousStep',
          blockId: 'step2.id',
          target: 'step1.id'
        }),
        simpleKey: keyify({
          stepId: 'step2.id',
          event: 'navigatePreviousStep',
          blockId: 'step2.id'
        })
      }
    })
  })

  it('should add navigateNextEvent to datalayer', async () => {
    treeBlocksVar([step1, step2, step3])
    blockHistoryVar([step1])

    const { getByTestId } = render(
      <MockedProvider mocks={[mockStepNextEventCreate]}>
        <SwipeNavigation activeBlock={step1} rtl={false}>
          <Box data-testid="swipe-test-box" />
        </SwipeNavigation>
      </MockedProvider>
    )
    const swipeElement = getByTestId('swipe-test-box')

    fireEvent.touchStart(swipeElement, {
      touches: [{ clientX: 0, clientY: 0 }]
    })
    fireEvent.touchMove(swipeElement, {
      touches: [{ clientX: swipeLeft, clientY: 0 }]
    })
    fireEvent.touchEnd(swipeElement)

    await waitFor(() =>
      expect(mockedSendGTMEvent).toHaveBeenCalledWith({
        event: 'step_next',
        eventId: 'uuid',
        blockId: 'step1.id',
        stepName: 'Step {{number}}',
        targetStepId: 'step2.id',
        targetStepName: 'Step {{number}}'
      })
    )
  })

  it('should add navigatePreviousEvent to datalayer', async () => {
    treeBlocksVar([step1, step2, step3])
    blockHistoryVar([step1, step2])

    const { getByTestId } = render(
      <MockedProvider mocks={[mockStepPreviousEventCreate]}>
        <SwipeNavigation activeBlock={step2} rtl={false}>
          <Box data-testid="swipe-test-box" />
        </SwipeNavigation>
      </MockedProvider>
    )
    const swipeElement = getByTestId('swipe-test-box')

    fireEvent.touchStart(swipeElement, {
      touches: [{ clientX: 0, clientY: 0 }]
    })
    fireEvent.touchMove(swipeElement, {
      touches: [{ clientX: swipeRight, clientY: 0 }]
    })
    fireEvent.touchEnd(swipeElement)

    await waitFor(() =>
      expect(mockedSendGTMEvent).toHaveBeenCalledWith({
        event: 'step_prev',
        eventId: 'uuid',
        blockId: 'step2.id',
        stepName: 'Step {{number}}',
        targetStepId: 'step1.id',
        targetStepName: 'Step {{number}}'
      })
    )
  })

  it('should not swipe on admin', () => {
    treeBlocksVar([step1, step2, step3])
    blockHistoryVar([step1])

    const { getByTestId } = render(
      <MockedProvider>
        <JourneyProvider value={{ variant: 'admin' }}>
          <SwipeNavigation activeBlock={step1} rtl={false}>
            <Box data-testid="swipe-test-box" />
          </SwipeNavigation>
        </JourneyProvider>
      </MockedProvider>
    )
    const swipeElement = getByTestId('swipe-test-box')

    fireEvent.touchStart(swipeElement, {
      touches: [{ clientX: 0, clientY: 0 }]
    })
    fireEvent.touchMove(swipeElement, {
      touches: [{ clientX: swipeLeft, clientY: 0 }]
    })
    fireEvent.touchEnd(swipeElement)

    expect(blockHistoryVar()).toHaveLength(1)
  })
})
