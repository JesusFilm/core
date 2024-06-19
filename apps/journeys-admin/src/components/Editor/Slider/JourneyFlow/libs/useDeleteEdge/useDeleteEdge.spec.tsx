import { MockedProvider } from '@apollo/client/testing'
import { renderHook, waitFor } from '@testing-library/react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'
import { TreeBlock } from '@core/journeys/ui/block'

import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../../__generated__/BlockFields'
import { blockActionDeleteMock } from '../../../../../../libs/useBlockActionDeleteMutation/useBlockActionDeleteMutation.mock'
import { stepBlockNextBlockUpdateMock } from '../../../../../../libs/useStepBlockNextBlockUpdateMutation/useStepBlockNextBlockUpdateMutation.mock'

import { useDeleteEdge } from './useDeleteEdge'

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

describe('useDeleteEdge', () => {
  const stepActionResult = jest
    .fn()
    .mockReturnValue(stepBlockNextBlockUpdateMock.result)

  const blockActionResult = jest
    .fn()
    .mockReturnValue(blockActionDeleteMock.result)

  afterEach(() => jest.clearAllMocks())

  it('should delete a base edge', async () => {
    const { result } = renderHook(() => useDeleteEdge(), {
      wrapper: ({ children }) => (
        <MockedProvider
          mocks={[
            { ...stepBlockNextBlockUpdateMock, result: stepActionResult }
          ]}
        >
          <JourneyProvider value={{ journey: defaultJourney }}>
            {children}
          </JourneyProvider>
        </MockedProvider>
      )
    })

    await result.current({ source: 'step0.id', sourceHandle: null })

    await waitFor(async () => expect(stepActionResult).toHaveBeenCalled())
  })

  it('should delete an action edge', async () => {
    const { result } = renderHook(() => useDeleteEdge(), {
      wrapper: ({ children }) => (
        <MockedProvider
          mocks={[{ ...blockActionDeleteMock, result: blockActionResult }]}
        >
          <JourneyProvider value={{ journey: defaultJourney }}>
            <EditorProvider initialState={{ steps: [step1] }}>
              {children}
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )
    })
    await result.current({ source: 'step1.id', sourceHandle: 'block1.id' })

    await waitFor(async () => expect(blockActionResult).toHaveBeenCalled())
  })

  it('should not delete SocialPreview edges', async () => {
    const { result } = renderHook(() => useDeleteEdge(), {
      wrapper: ({ children }) => (
        <MockedProvider
          mocks={[
            { ...stepBlockNextBlockUpdateMock, result: stepActionResult },
            { ...blockActionDeleteMock, result: blockActionResult }
          ]}
        >
          <JourneyProvider value={{ journey: defaultJourney }}>
            {children}
          </JourneyProvider>
        </MockedProvider>
      )
    })

    await result.current({ source: 'SocialPreview', sourceHandle: null })

    await waitFor(async () => {
      expect(stepActionResult).not.toHaveBeenCalled()
      expect(blockActionResult).not.toHaveBeenCalled()
    })
  })

  it('should do nothing without an edge source', async () => {
    const { result } = renderHook(() => useDeleteEdge(), {
      wrapper: ({ children }) => (
        <MockedProvider
          mocks={[
            { ...stepBlockNextBlockUpdateMock, result: stepActionResult },
            { ...blockActionDeleteMock, result: blockActionResult }
          ]}
        >
          <JourneyProvider value={{ journey: defaultJourney }}>
            {children}
          </JourneyProvider>
        </MockedProvider>
      )
    })

    await result.current({ source: null, sourceHandle: null })

    await waitFor(async () => {
      expect(stepActionResult).not.toHaveBeenCalled()
      expect(blockActionResult).not.toHaveBeenCalled()
    })
  })
})
