import { MockedProvider } from '@apollo/client/testing'
import { sendGTMEvent } from '@next/third-parties/google'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { usePlausible } from 'next-plausible'
import { v4 as uuidv4 } from 'uuid'

import { blockHistoryVar, treeBlocksVar } from '@core/journeys/ui/block'
import { showNavigationVar } from '@core/journeys/ui/block/block'
import {
  STEP_NEXT_EVENT_CREATE,
  STEP_PREVIOUS_EVENT_CREATE
} from '@core/journeys/ui/Card/Card'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { keyify } from '@core/journeys/ui/plausibleHelpers'

import { GetJourney_journey as Journey } from '../../../../__generated__/GetJourney'

import { NavigationButton } from './NavigationButton'

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

const step1 = {
  id: 'step1.id',
  __typename: 'StepBlock' as const,
  parentBlockId: null,
  parentOrder: 0,
  locked: false,
  nextBlockId: 'step3.id',
  slug: null,
  children: []
}
const step2 = {
  id: 'step2.id',
  __typename: 'StepBlock' as const,
  parentBlockId: null,
  parentOrder: 1,
  locked: true,
  nextBlockId: null,
  slug: null,
  children: []
}
const step3 = {
  id: 'step3.id',
  __typename: 'StepBlock' as const,
  parentBlockId: null,
  parentOrder: 2,
  locked: false,
  nextBlockId: null,
  slug: null,
  children: []
}

const journey = {
  id: 'journey.id'
} as unknown as Journey

describe('NavigationButton', () => {
  mockUuidv4.mockReturnValue('uuid')

  const mockOrigin = 'https://example.com'

  beforeAll(() => {
    // Jest v30 compatible way to mock window.location
    delete (window as any).location
    window.location = { ...window.location, origin: mockOrigin } as any
  })

  afterAll(() => {
    // Reset is handled by Jest automatically in v30
  })

  const stepNextResult = jest.fn(() => ({
    data: {
      stepNextEventCreate: {
        id: 'uuid',
        __typename: 'StepNextEvent'
      }
    }
  }))
  const stepPreviousResult = jest.fn(() => ({
    data: {
      stepPreviousEventCreate: {
        id: 'uuid',
        __typename: 'StepPreviousEvent'
      }
    }
  }))

  const stepNextEventCreateMock = {
    request: {
      query: STEP_NEXT_EVENT_CREATE,
      variables: {
        input: {
          id: 'uuid',
          blockId: 'step1.id',
          nextStepId: 'step3.id',
          label: 'Step {{number}}',
          value: 'Step {{number}}'
        }
      }
    },
    result: stepNextResult
  }

  const stepPreviousEventCreateMock = {
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
    result: stepPreviousResult
  }

  it('should show navigation arrows on mouse over', async () => {
    showNavigationVar(false)
    treeBlocksVar([step1, step2, step3])
    blockHistoryVar([step1])

    const { getByTestId } = render(
      <MockedProvider>
        <NavigationButton variant="next" alignment="right" />
      </MockedProvider>
    )
    expect(getByTestId('ConductorNavigationButtonNext')).not.toBeVisible()

    fireEvent.mouseOver(getByTestId('ConductorNavigationButtonNext'))

    await waitFor(() => {
      expect(getByTestId('ConductorNavigationButtonNext')).toBeVisible()
    })
  })

  it('should hide navigation arrows after 3 seconds', async () => {
    showNavigationVar(true)
    treeBlocksVar([step1, step2, step3])
    blockHistoryVar([step1])

    const { getByTestId } = render(
      <MockedProvider>
        <NavigationButton variant="next" alignment="right" />
      </MockedProvider>
    )
    expect(getByTestId('ConductorNavigationButtonNext')).toBeVisible()

    await waitFor(
      () => {
        expect(getByTestId('ConductorNavigationButtonNext')).not.toBeVisible()
      },
      { timeout: 3000 }
    )
  })

  it('should create stepNextEvent', async () => {
    treeBlocksVar([step1, step2, step3])
    blockHistoryVar([step1])
    const mockPlausible = jest.fn()
    mockUsePlausible.mockReturnValue(mockPlausible)

    const { getByTestId } = render(
      <MockedProvider mocks={[stepNextEventCreateMock]}>
        <JourneyProvider value={{ journey }}>
          <NavigationButton variant="next" alignment="right" />
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByTestId('ConductorNavigationButtonNext'))

    await waitFor(() => expect(stepNextResult).toHaveBeenCalled())

    expect(mockPlausible).toHaveBeenCalledWith('navigateNextStep', {
      u: `${mockOrigin}/journey.id/step1.id`,
      props: {
        id: 'uuid',
        blockId: 'step1.id',
        label: 'Step {{number}}',
        value: 'Step {{number}}',
        nextStepId: 'step3.id',
        key: keyify({
          stepId: 'step1.id',
          event: 'navigateNextStep',
          blockId: 'step1.id',
          target: 'step3.id'
        }),
        simpleKey: keyify({
          stepId: 'step1.id',
          event: 'navigateNextStep',
          blockId: 'step1.id'
        })
      }
    })
    expect(mockedSendGTMEvent).toHaveBeenCalledWith({
      event: 'step_next',
      eventId: 'uuid',
      blockId: 'step1.id',
      stepName: 'Step {{number}}',
      targetStepId: 'step3.id',
      targetStepName: 'Step {{number}}'
    })
  })

  it('should create stepPreviousEvent', async () => {
    treeBlocksVar([step1, step2, step3])
    blockHistoryVar([step1, step2])
    const mockPlausible = jest.fn()
    mockUsePlausible.mockReturnValue(mockPlausible)

    const { getByTestId } = render(
      <MockedProvider mocks={[stepPreviousEventCreateMock]}>
        <JourneyProvider value={{ journey }}>
          <NavigationButton variant="previous" alignment="left" />
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByTestId('ConductorNavigationButtonPrevious'))

    await waitFor(() => expect(stepPreviousResult).toHaveBeenCalled())

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
    expect(mockedSendGTMEvent).toHaveBeenCalledWith({
      event: 'step_prev',
      eventId: 'uuid',
      blockId: 'step2.id',
      stepName: 'Step {{number}}',
      targetStepId: 'step1.id',
      targetStepName: 'Step {{number}}'
    })
  })

  describe('ltr', () => {
    it('should call nextActiveBlock on next button click', () => {
      treeBlocksVar([step1, step2, step3])
      blockHistoryVar([step1])

      const { getByTestId } = render(
        <MockedProvider mocks={[stepNextEventCreateMock]}>
          <NavigationButton variant="next" alignment="right" />
        </MockedProvider>
      )
      fireEvent.click(getByTestId('ConductorNavigationButtonNext'))

      expect(blockHistoryVar()[1].id).toBe('step3.id')
    })

    it('should call previousActiveBlock on prev button click', () => {
      treeBlocksVar([step1, step2, step3])
      blockHistoryVar([step1, step2])
      const { getByTestId } = render(
        <MockedProvider mocks={[stepPreviousEventCreateMock]}>
          <NavigationButton variant="previous" alignment="left" />
        </MockedProvider>
      )
      expect(blockHistoryVar()[1].id).toBe('step2.id')

      fireEvent.click(getByTestId('ConductorNavigationButtonPrevious'))

      expect(blockHistoryVar()[0].id).toBe('step1.id')
    })

    it('should hide left button if on first card', () => {
      treeBlocksVar([step1, step2, step3])
      blockHistoryVar([step1])
      const { getByTestId } = render(
        <MockedProvider>
          <NavigationButton variant="previous" alignment="left" />
        </MockedProvider>
      )

      expect(getByTestId('ConductorNavigationButtonPrevious')).not.toBeVisible()
    })

    it('should hide right button if next step is locked', () => {
      treeBlocksVar([step1, step2, step3])
      blockHistoryVar([step1, step2])
      const { getByTestId } = render(
        <MockedProvider>
          <NavigationButton variant="next" alignment="right" />
        </MockedProvider>
      )
      expect(getByTestId('ConductorNavigationButtonNext')).not.toBeVisible()
    })

    it('should hide right button if on last card', () => {
      treeBlocksVar([step1, step2, step3])
      blockHistoryVar([step1, step2, step3])
      const { getByTestId } = render(
        <MockedProvider>
          <NavigationButton variant="next" alignment="right" />
        </MockedProvider>
      )

      expect(getByTestId('ConductorNavigationButtonNext')).not.toBeVisible()
    })

    it('should show right button if on last card but set to navigate to another card', async () => {
      treeBlocksVar([step1, step2, { ...step3, nextBlockId: step1.id }])
      blockHistoryVar([step1, step2, { ...step3, nextBlockId: step1.id }])
      const { getByTestId } = render(
        <MockedProvider
          mocks={[stepNextEventCreateMock, stepPreviousEventCreateMock]}
        >
          <NavigationButton variant="next" alignment="right" />
        </MockedProvider>
      )

      fireEvent.mouseOver(getByTestId('ConductorNavigationButtonNext'))

      await waitFor(() => {
        expect(getByTestId('ConductorNavigationButtonNext')).toBeVisible()
      })
    })
  })

  describe('rtl', () => {
    it('should call nextActiveBlock on next button click', () => {
      treeBlocksVar([step1, step2, step3])
      blockHistoryVar([step1])

      const { getByTestId } = render(
        <MockedProvider mocks={[stepNextEventCreateMock]}>
          <NavigationButton variant="next" alignment="left" />
        </MockedProvider>
      )
      fireEvent.click(getByTestId('ConductorNavigationButtonNext'))

      expect(blockHistoryVar()[1].id).toBe('step3.id')
    })

    it('should call previousActiveBlock on prev button click', () => {
      treeBlocksVar([step1, step2, step3])
      blockHistoryVar([step1, step2])
      const { getByTestId } = render(
        <MockedProvider mocks={[stepPreviousEventCreateMock]}>
          <NavigationButton variant="previous" alignment="right" />
        </MockedProvider>
      )
      expect(blockHistoryVar()[1].id).toBe('step2.id')

      fireEvent.click(getByTestId('ConductorNavigationButtonPrevious'))

      expect(blockHistoryVar()[0].id).toBe('step1.id')
    })

    it('should hide right button if on first card', () => {
      treeBlocksVar([step1, step2, step3])
      blockHistoryVar([step1])
      const { getByTestId } = render(
        <MockedProvider>
          <NavigationButton variant="previous" alignment="right" />
        </MockedProvider>
      )

      expect(getByTestId('ConductorNavigationButtonPrevious')).not.toBeVisible()
    })

    it('should hide left button if next step is locked', () => {
      treeBlocksVar([step1, step2, step3])
      blockHistoryVar([step1, step2])
      const { getByTestId } = render(
        <MockedProvider>
          <NavigationButton variant="next" alignment="left" />
        </MockedProvider>
      )
      expect(getByTestId('ConductorNavigationButtonNext')).not.toBeVisible()
    })

    it('should hide left button if on last card', () => {
      treeBlocksVar([step1, step2, step3])
      blockHistoryVar([step1, step2, step3])
      const { getByTestId } = render(
        <MockedProvider>
          <NavigationButton variant="next" alignment="left" />
        </MockedProvider>
      )

      expect(getByTestId('ConductorNavigationButtonNext')).not.toBeVisible()
    })

    it('should show left button if on last card but set to navigate to another card', async () => {
      treeBlocksVar([step1, step2, { ...step3, nextBlockId: step1.id }])
      blockHistoryVar([step1, step2, { ...step3, nextBlockId: step1.id }])
      const { getByTestId } = render(
        <MockedProvider mocks={[stepNextEventCreateMock]}>
          <NavigationButton variant="next" alignment="left" />
        </MockedProvider>
      )

      fireEvent.mouseOver(getByTestId('ConductorNavigationButtonNext'))

      await waitFor(() => {
        expect(getByTestId('ConductorNavigationButtonNext')).toBeVisible()
      })
    })
  })
})
