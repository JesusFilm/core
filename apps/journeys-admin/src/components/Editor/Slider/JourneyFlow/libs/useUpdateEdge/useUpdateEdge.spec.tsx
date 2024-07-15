import { MockedProvider } from '@apollo/client/testing'
import { renderHook, waitFor } from '@testing-library/react'
import { act } from 'react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'
import { TreeBlock } from '@core/journeys/ui/block'

import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../../__generated__/BlockFields'
import { GetJourney_journey as Journey } from '../../../../../../../__generated__/GetJourney'
import { blockOrderUpdateMock } from '../../../../../../libs/useBlockOrderUpdateMutation/useBlockOrderUpdateMutation.mock'
import { stepBlockNextBlockUpdateMock } from '../../../../../../libs/useStepBlockNextBlockUpdateMutation/useStepBlockNextBlockUpdateMutation.mock'
import { wrappedNavigateToBlockActionUpdateMock } from '../../../../../../libs/useWrappedNavigateToBlockActionUpdateMutation/useWrappedNavigateToBlockActionUpdateMutation.mock'

import { useUpdateEdge } from './useUpdateEdge'

stepBlockNextBlockUpdateMock.request.variables = {
  id: 'step0.id',
  journeyId: 'journey-id',
  input: {
    nextBlockId: 'step2.id'
  }
}
stepBlockNextBlockUpdateMock.result = {
  data: {
    stepBlockUpdate: {
      __typename: 'StepBlock',
      id: 'step0.id',
      nextBlockId: 'step2.id'
    }
  }
}

const block = {
  __typename: 'ButtonBlock',
  id: 'block1.id',
  children: []
} as unknown as TreeBlock<ButtonBlock>

const step1: TreeBlock<StepBlock> = {
  id: 'step1.id',
  __typename: 'StepBlock',
  parentBlockId: null,
  parentOrder: 0,
  locked: false,
  nextBlockId: null,
  children: [block]
}

describe('useUpdateEdge', () => {
  it('should update block order for SocialPreview edge', async () => {
    const blockOrderResult = jest
      .fn()
      .mockReturnValue(blockOrderUpdateMock.result)

    const { result } = renderHook(() => useUpdateEdge(), {
      wrapper: ({ children }) => (
        <MockedProvider
          mocks={[{ ...blockOrderUpdateMock, result: blockOrderResult }]}
        >
          <JourneyProvider
            value={{ journey: { id: 'journeyId' } as unknown as Journey }}
          >
            {children}
          </JourneyProvider>
        </MockedProvider>
      )
    })

    await act(
      async () =>
        await result.current({
          target: 'blockId',
          source: 'SocialPreview',
          sourceHandle: null
        })
    )

    expect(blockOrderResult).toHaveBeenCalled()
  })

  it('should update nextBlockId for step block edge', async () => {
    const stepBlockResult = jest
      .fn()
      .mockReturnValue(stepBlockNextBlockUpdateMock.result)

    const { result } = renderHook(() => useUpdateEdge(), {
      wrapper: ({ children }) => (
        <MockedProvider
          mocks={[
            {
              ...stepBlockNextBlockUpdateMock,
              result: stepBlockResult
            }
          ]}
        >
          <JourneyProvider value={{ journey: defaultJourney }}>
            {children}
          </JourneyProvider>
        </MockedProvider>
      )
    })

    await act(
      async () =>
        await result.current({
          target: 'step2.id',
          source: 'step0.id',
          sourceHandle: null
        })
    )

    expect(stepBlockResult).toHaveBeenCalled()
  })

  it('should update navigateToBlockAction for action edge', async () => {
    const blockActionResult = jest
      .fn()
      .mockReturnValue(wrappedNavigateToBlockActionUpdateMock.result)

    const { result } = renderHook(() => useUpdateEdge(), {
      wrapper: ({ children }) => (
        <MockedProvider
          mocks={[
            {
              ...wrappedNavigateToBlockActionUpdateMock,
              result: blockActionResult
            }
          ]}
        >
          <JourneyProvider value={{ journey: defaultJourney }}>
            <EditorProvider initialState={{ steps: [step1] }}>
              {children}
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )
    })

    await act(
      async () =>
        await result.current({
          target: 'step2.id',
          source: 'step1.id',
          sourceHandle: 'block1.id'
        })
    )

    expect(blockActionResult).toHaveBeenCalled()
  })

  it('should update edge for source node change', async () => {
    wrappedNavigateToBlockActionUpdateMock.request.variables = {
      id: 'block1.id',
      journeyId: 'journeyId',
      input: { blockId: 'step2.id' }
    }

    stepBlockNextBlockUpdateMock.request.variables = {
      id: 'step1.id',
      journeyId: 'journeyId',
      input: { nextBlockId: null }
    }

    const blockActionResult = jest
      .fn()
      .mockReturnValue(wrappedNavigateToBlockActionUpdateMock.result)

    const stepBlockResult = jest
      .fn()
      .mockReturnValue(stepBlockNextBlockUpdateMock.result)

    const { result } = renderHook(() => useUpdateEdge(), {
      wrapper: ({ children }) => (
        <MockedProvider
          mocks={[
            {
              ...wrappedNavigateToBlockActionUpdateMock,
              result: blockActionResult
            },
            {
              ...stepBlockNextBlockUpdateMock,
              result: stepBlockResult
            }
          ]}
        >
          <JourneyProvider
            value={{ journey: { id: 'journeyId' } as unknown as Journey }}
          >
            <EditorProvider initialState={{ steps: [step1] }}>
              {children}
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )
    })

    await act(
      async () =>
        await result.current({
          source: 'step1.id',
          sourceHandle: 'block1.id',
          target: 'step2.id',
          oldEdge: {
            id: 'oldEdge.id',
            source: 'step1.id',
            sourceHandle: null,
            target: 'step2.id'
          }
        })
    )
    await waitFor(() => expect(stepBlockResult).toHaveBeenCalled())
  })
})
