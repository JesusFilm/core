import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { act, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { usePlausible } from 'next-plausible'
import TagManager from 'react-gtm-module'
import { v4 as uuidv4 } from 'uuid'

import { blockHistoryVar, treeBlocksVar } from '@core/journeys/ui/block'
import {
  STEP_NEXT_EVENT_CREATE,
  STEP_PREVIOUS_EVENT_CREATE
} from '@core/journeys/ui/Card/Card'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { keyify } from '@core/journeys/ui/plausibleHelpers'

import { GetJourney_journey as Journey } from '../../../../__generated__/GetJourney'
import {
  StepNextEventCreate_stepNextEventCreate as StepNextCreateResult,
  StepNextEventCreate
} from '../../../../__generated__/StepNextEventCreate'
import {
  StepPreviousEventCreate_stepPreviousEventCreate as StepPreviousCreateResult,
  StepPreviousEventCreate
} from '../../../../__generated__/StepPreviousEventCreate'

import { HotkeyNavigation } from '.'

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
  children: []
}
const step2 = {
  id: 'step2.id',
  __typename: 'StepBlock' as const,
  parentBlockId: null,
  parentOrder: 1,
  locked: true,
  nextBlockId: null,
  children: []
}
const step3 = {
  id: 'step3.id',
  __typename: 'StepBlock' as const,
  parentBlockId: null,
  parentOrder: 2,
  locked: false,
  nextBlockId: null,
  children: []
}

const journey = {
  id: 'journey.id'
} as unknown as Journey

describe('HotkeyNavigation', () => {
  mockUuidv4.mockReturnValue('uuid')
  const stepNextResult = jest.fn(() => ({
    data: {
      stepNextEventCreate: {
        id: 'uuid',
        __typename: 'StepNextEvent'
      } satisfies StepNextCreateResult
    }
  }))
  const stepPreviousResult = jest.fn(() => ({
    data: {
      stepPreviousEventCreate: {
        id: 'uuid',
        __typename: 'StepPreviousEvent'
      } satisfies StepPreviousCreateResult
    }
  }))

  const stepNextEventCreateMock: MockedResponse<StepNextEventCreate> = {
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

  const stepPreviousEventCreateMock: MockedResponse<StepPreviousEventCreate> = {
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

  it('should create next event', async () => {
    treeBlocksVar([step1, step2, step3])
    blockHistoryVar([step1])
    const mockPlausible = jest.fn()
    mockUsePlausible.mockReturnValue(mockPlausible)

    render(
      <MockedProvider mocks={[stepNextEventCreateMock]}>
        <JourneyProvider value={{ journey }}>
          <HotkeyNavigation rtl={false} />
        </JourneyProvider>
      </MockedProvider>
    )

    await act(async () => await userEvent.keyboard('{ArrowRight}'))
    await waitFor(() => expect(stepNextResult).toHaveBeenCalled())

    expect(mockPlausible).toHaveBeenCalledWith('navigateNextStep', {
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
    expect(mockedDataLayer).toHaveBeenCalledWith({
      dataLayer: {
        event: 'step_next',
        eventId: 'uuid',
        blockId: 'step1.id',
        stepName: 'Step {{number}}',
        targetStepId: 'step3.id',
        targetStepName: 'Step {{number}}'
      }
    })
  })

  it('should create previous event', async () => {
    treeBlocksVar([step1, step2, step3])
    blockHistoryVar([step1, step2])
    const mockPlausible = jest.fn()
    mockUsePlausible.mockReturnValue(mockPlausible)

    render(
      <MockedProvider mocks={[stepPreviousEventCreateMock]}>
        <JourneyProvider value={{ journey }}>
          <HotkeyNavigation rtl={false} />
        </JourneyProvider>
      </MockedProvider>
    )

    await act(async () => await userEvent.keyboard('{ArrowLeft}'))
    await waitFor(() => expect(stepPreviousResult).toHaveBeenCalled())

    expect(mockPlausible).toHaveBeenCalledWith('navigatePreviousStep', {
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
  })

  describe('ltr', () => {
    it('should navigate next', async () => {
      treeBlocksVar([step1, step2, step3])
      blockHistoryVar([step1])

      render(
        <MockedProvider mocks={[stepNextEventCreateMock]}>
          <HotkeyNavigation rtl={false} />
        </MockedProvider>
      )

      await act(async () => await userEvent.keyboard('{ArrowRight}'))
      expect(blockHistoryVar()[1].id).toBe('step3.id')
    })

    it('should navigate previous', async () => {
      treeBlocksVar([step1, step2, step3])
      blockHistoryVar([step1, step2])

      render(
        <MockedProvider mocks={[stepPreviousEventCreateMock]}>
          <HotkeyNavigation rtl={false} />
        </MockedProvider>
      )

      await act(async () => await userEvent.keyboard('{ArrowLeft}'))
      expect(blockHistoryVar()[0].id).toBe('step1.id')
    })
  })

  describe('rtl', () => {
    it('should navigate next', async () => {
      treeBlocksVar([step1, step2, step3])
      blockHistoryVar([step1])

      render(
        <MockedProvider mocks={[stepNextEventCreateMock]}>
          <HotkeyNavigation rtl />
        </MockedProvider>
      )

      await act(async () => await userEvent.keyboard('{ArrowLeft}'))
      expect(blockHistoryVar()[1].id).toBe('step3.id')
    })

    it('should navigate previous', async () => {
      treeBlocksVar([step1, step2, step3])
      blockHistoryVar([step1, step2])

      render(
        <MockedProvider mocks={[stepPreviousEventCreateMock]}>
          <HotkeyNavigation rtl />
        </MockedProvider>
      )

      await act(async () => await userEvent.keyboard('{ArrowRight}'))
      expect(blockHistoryVar()[0].id).toBe('step1.id')
    })
  })
})
