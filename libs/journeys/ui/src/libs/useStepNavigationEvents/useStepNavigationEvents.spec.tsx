import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { sendGTMEvent } from '@next/third-parties/google'
import { renderHook, waitFor } from '@testing-library/react'
import { TOptions } from 'i18next'
import { usePlausible } from 'next-plausible'
import { ReactElement, ReactNode } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { type MockedFunction } from 'vitest'

import { StepNextEventCreate } from '../../components/Card/__generated__/StepNextEventCreate'
import { StepPreviousEventCreate } from '../../components/Card/__generated__/StepPreviousEventCreate'
import {
  STEP_NEXT_EVENT_CREATE,
  STEP_PREVIOUS_EVENT_CREATE
} from '../../components/Card/Card'
import { StepFields } from '../../components/Step/__generated__/StepFields'
import { TreeBlock, blockHistoryVar, treeBlocksVar } from '../block'
import { JourneyProvider } from '../JourneyProvider'
import { JourneyFields as Journey } from '../JourneyProvider/__generated__/JourneyFields'
import { keyify, templateKeyify } from '../plausibleHelpers'

import { useStepNavigationEvents } from './useStepNavigationEvents'

vi.mock('uuid', () => ({
  __esModule: true,
  v4: vi.fn()
}))

const mockUuidv4 = uuidv4 as unknown as MockedFunction<typeof uuidv4>

vi.mock('@next/third-parties/google', () => ({
  sendGTMEvent: vi.fn()
}))

const mockedSendGTMEvent = sendGTMEvent as unknown as MockedFunction<
  typeof sendGTMEvent
>

vi.mock('next-plausible', () => ({
  __esModule: true,
  usePlausible: vi.fn()
}))

const mockUsePlausible = usePlausible as unknown as MockedFunction<
  typeof usePlausible
>

// interpolating stand-in for the caller-supplied translator
const t = (str: string, options?: TOptions): string =>
  str.replace('{{number}}', String(options?.number))

const step1: TreeBlock<StepFields> = {
  id: 'step1.id',
  __typename: 'StepBlock',
  parentBlockId: null,
  parentOrder: 0,
  locked: false,
  nextBlockId: 'step2.id',
  slug: null,
  children: []
}

const step2: TreeBlock<StepFields> = {
  id: 'step2.id',
  __typename: 'StepBlock',
  parentBlockId: null,
  parentOrder: 1,
  locked: false,
  nextBlockId: null,
  slug: null,
  children: []
}

const journey = { id: 'journey.id' } as unknown as Journey

function createWrapper(
  mocks: MockedResponse[],
  providedJourney?: Journey
): ({ children }: { children: ReactNode }) => ReactElement {
  return function Wrapper({ children }) {
    return (
      <MockedProvider mocks={mocks}>
        <JourneyProvider value={{ journey: providedJourney }}>
          {children}
        </JourneyProvider>
      </MockedProvider>
    )
  }
}

describe('useStepNavigationEvents', () => {
  const mockPlausible = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUuidv4.mockReturnValue('uuid')
    mockUsePlausible.mockReturnValue(mockPlausible)
    treeBlocksVar([step1, step2])
    blockHistoryVar([step1])
  })

  describe('handleNextNavigationEventCreate', () => {
    const input = {
      id: 'uuid',
      blockId: 'step1.id',
      label: 'Step 1',
      value: 'Step 2',
      nextStepId: 'step2.id'
    }

    const result = vi.fn(() => ({
      data: {
        stepNextEventCreate: {
          __typename: 'StepNextEvent' as const,
          id: 'uuid'
        }
      }
    }))

    const mocks: Array<MockedResponse<StepNextEventCreate>> = [
      {
        request: {
          query: STEP_NEXT_EVENT_CREATE,
          variables: { input }
        },
        result
      }
    ]

    it('creates the event and reports to plausible and GTM', async () => {
      const { result: hook } = renderHook(
        () => useStepNavigationEvents({ t }),
        {
          wrapper: createWrapper(mocks, journey)
        }
      )

      hook.current.handleNextNavigationEventCreate(step1)

      await waitFor(() => expect(result).toHaveBeenCalled())
      expect(mockPlausible).toHaveBeenCalledWith('navigateNextStep', {
        u: `${window.location.origin}/journey.id/step1.id`,
        props: {
          ...input,
          key: keyify({
            stepId: 'step1.id',
            event: 'navigateNextStep',
            blockId: 'step1.id',
            target: 'step2.id',
            journeyId: 'journey.id'
          }),
          simpleKey: keyify({
            stepId: 'step1.id',
            event: 'navigateNextStep',
            blockId: 'step1.id',
            journeyId: 'journey.id'
          }),
          templateKey: templateKeyify({
            event: 'navigateNextStep',
            journeyId: 'journey.id'
          })
        }
      })
      expect(mockedSendGTMEvent).toHaveBeenCalledWith({
        event: 'step_next',
        eventId: 'uuid',
        blockId: 'step1.id',
        stepName: 'Step 1',
        targetStepId: 'step2.id',
        targetStepName: 'Step 2'
      })
    })

    it('does nothing when there is no next block', async () => {
      const noNextStep: TreeBlock<StepFields> = {
        ...step1,
        id: 'lone.id',
        nextBlockId: null
      }
      treeBlocksVar([noNextStep])
      blockHistoryVar([noNextStep])

      const { result: hook } = renderHook(
        () => useStepNavigationEvents({ t }),
        {
          wrapper: createWrapper([], journey)
        }
      )

      hook.current.handleNextNavigationEventCreate(noNextStep)

      expect(mockPlausible).not.toHaveBeenCalled()
      expect(mockedSendGTMEvent).not.toHaveBeenCalled()
    })

    it('skips plausible when journey is undefined', async () => {
      const { result: hook } = renderHook(
        () => useStepNavigationEvents({ t }),
        {
          wrapper: createWrapper(mocks)
        }
      )

      hook.current.handleNextNavigationEventCreate(step1)

      await waitFor(() => expect(mockedSendGTMEvent).toHaveBeenCalled())
      expect(mockPlausible).not.toHaveBeenCalled()
    })
  })

  describe('handlePreviousNavigationEventCreate', () => {
    const input = {
      id: 'uuid',
      blockId: 'step2.id',
      label: 'Step 2',
      value: 'Step 1',
      previousStepId: 'step1.id'
    }

    const result = vi.fn(() => ({
      data: {
        stepPreviousEventCreate: {
          __typename: 'StepPreviousEvent' as const,
          id: 'uuid'
        }
      }
    }))

    const mocks: Array<MockedResponse<StepPreviousEventCreate>> = [
      {
        request: {
          query: STEP_PREVIOUS_EVENT_CREATE,
          variables: { input }
        },
        result
      }
    ]

    it('creates the event and reports to plausible and GTM', async () => {
      blockHistoryVar([step1, step2])

      const { result: hook } = renderHook(
        () => useStepNavigationEvents({ t }),
        {
          wrapper: createWrapper(mocks, journey)
        }
      )

      hook.current.handlePreviousNavigationEventCreate(step2)

      await waitFor(() => expect(result).toHaveBeenCalled())
      expect(mockPlausible).toHaveBeenCalledWith('navigatePreviousStep', {
        u: `${window.location.origin}/journey.id/step2.id`,
        props: {
          ...input,
          key: keyify({
            stepId: 'step2.id',
            event: 'navigatePreviousStep',
            blockId: 'step2.id',
            target: 'step1.id',
            journeyId: 'journey.id'
          }),
          simpleKey: keyify({
            stepId: 'step2.id',
            event: 'navigatePreviousStep',
            blockId: 'step2.id',
            journeyId: 'journey.id'
          }),
          templateKey: templateKeyify({
            event: 'navigatePreviousStep',
            journeyId: 'journey.id'
          })
        }
      })
      expect(mockedSendGTMEvent).toHaveBeenCalledWith({
        event: 'step_prev',
        eventId: 'uuid',
        blockId: 'step2.id',
        stepName: 'Step 2',
        targetStepId: 'step1.id',
        targetStepName: 'Step 1'
      })
    })

    it('does nothing when there is no previous block in history', async () => {
      blockHistoryVar([step1])

      const { result: hook } = renderHook(
        () => useStepNavigationEvents({ t }),
        {
          wrapper: createWrapper([], journey)
        }
      )

      hook.current.handlePreviousNavigationEventCreate(step1)

      expect(mockPlausible).not.toHaveBeenCalled()
      expect(mockedSendGTMEvent).not.toHaveBeenCalled()
    })
  })
})
