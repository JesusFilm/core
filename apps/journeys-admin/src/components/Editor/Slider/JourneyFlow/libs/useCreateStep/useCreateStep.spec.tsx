import { InMemoryCache } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { act, renderHook } from '@testing-library/react'
import { v4 as uuidv4 } from 'uuid'

import { TreeBlock } from '@core/journeys/ui/block'
import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_StepBlock as StepBlock
} from '@core/journeys/ui/block/__generated__/BlockFields'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  StepBlockNextBlockUpdate,
  StepBlockNextBlockUpdateVariables
} from '../../../../../../../__generated__/StepBlockNextBlockUpdate'
import { blockOrderUpdateMock } from '../../../../../../libs/useBlockOrderUpdateMutation/useBlockOrderUpdateMutation.mock'
import { navigateToBlockActionUpdateMock } from '../../../../../../libs/useNavigateToBlockActionUpdateMutation/useNavigateToBlockActionUpdate.mock'
import { stepAndCardBlockCreateMock } from '../../../../../../libs/useStepAndCardBlockCreateMutation/useStepAndCardBlockCreateMutation.mock'
import { STEP_BLOCK_NEXT_BLOCK_UPDATE } from '../../../../../../libs/useStepBlockNextBlockUpdateMutation/useStepBlockNextBlockUpdateMutation'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'

import { useCreateStep } from '.'

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

const step = {
  __typename: 'StepBlock',
  id: 'step.id'
} as unknown as TreeBlock<StepBlock>

blockOrderUpdateMock.request.variables = {
  id: 'newStep.id',
  journeyId: 'journey-id',
  parentOrder: 0
}
blockOrderUpdateMock.result = jest.fn(() => ({
  data: {
    blockOrderUpdate: [
      {
        __typename: 'StepBlock',
        id: 'blockId',
        parentOrder: 0
      }
    ]
  }
}))

navigateToBlockActionUpdateMock.request.variables = {
  id: 'block1.id',
  journeyId: 'journey-id',
  input: {
    blockId: 'newStep.id'
  }
}
navigateToBlockActionUpdateMock.result = jest.fn(() => ({
  data: {
    blockUpdateNavigateToBlockAction: {
      __typename: 'NavigateToBlockAction',
      parentBlockId: 'step1.id',
      gtmEventName: null,
      blockId: 'newStep.id'
    }
  }
}))

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

const stepBlockNextBlockUpdateMock: MockedResponse<
  StepBlockNextBlockUpdate,
  StepBlockNextBlockUpdateVariables
> = {
  request: {
    query: STEP_BLOCK_NEXT_BLOCK_UPDATE,
    variables: {
      id: 'step0.id',
      journeyId: 'journey-id',
      input: {
        nextBlockId: 'newStep.id'
      }
    }
  },
  result: {
    data: {
      stepBlockUpdate: {
        __typename: 'StepBlock',
        id: 'step0.id',
        nextBlockId: 'newStep.id'
      }
    }
  }
}

describe('useCreateStep', () => {
  it('should create a new step block', async () => {
    const cache = new InMemoryCache().restore({
      'Journey:journey-id': {
        blocks: [{ __ref: `StepBlock:step.id` }],
        id: 'journey-id',
        __typename: 'Journey'
      },
      'StepBlock:step1.id': {
        ...step
      }
    })

    mockUuidv4.mockReturnValueOnce('newStep.id')
    mockUuidv4.mockReturnValueOnce('newCard.id')

    const result = jest.fn().mockReturnValue(stepAndCardBlockCreateMock.result)

    const { result: hook } = renderHook(() => useCreateStep(), {
      wrapper: ({ children }) => (
        <MockedProvider
          mocks={[{ ...stepAndCardBlockCreateMock, result }]}
          cache={cache}
        >
          <JourneyProvider value={{ journey: defaultJourney }}>
            {children}
          </JourneyProvider>
        </MockedProvider>
      )
    })

    await act(
      async () =>
        await hook.current({
          x: -200,
          y: 38
        })
    )

    expect(result).toHaveBeenCalled()

    expect(cache.extract()['Journey:journey-id']?.blocks).toEqual([
      { __ref: 'StepBlock:step.id' },
      { __ref: 'StepBlock:newStep.id' },
      { __ref: 'CardBlock:newCard.id' }
    ])

    expect(cache.extract()['StepBlock:newStep.id']).toEqual({
      __typename: 'StepBlock',
      id: 'newStep.id',
      locked: false,
      nextBlockId: null,
      parentBlockId: null,
      parentOrder: null,
      x: -200,
      y: 38
    })
    expect(cache.extract()['CardBlock:newCard.id']).toEqual({
      __typename: 'CardBlock',
      id: 'newCard.id',
      parentBlockId: 'newStep.id',
      parentOrder: 0,
      backgroundColor: null,
      coverBlockId: null,
      themeMode: 'dark',
      themeName: 'base',
      fullscreen: false
    })
  })

  it('should update block order for SocialPreview edge', async () => {
    mockUuidv4.mockReturnValueOnce('newStep.id')
    mockUuidv4.mockReturnValueOnce('newCard.id')

    const { result: hook } = renderHook(() => useCreateStep(), {
      wrapper: ({ children }) => (
        <MockedProvider
          mocks={[stepAndCardBlockCreateMock, blockOrderUpdateMock]}
        >
          <JourneyProvider value={{ journey: defaultJourney }}>
            {children}
          </JourneyProvider>
        </MockedProvider>
      )
    })

    await act(
      async () =>
        await hook.current({
          x: -200,
          y: 38,
          source: 'SocialPreview',
          sourceHandle: null
        })
    )

    expect(blockOrderUpdateMock.result).toHaveBeenCalled()
  })

  it('should update nextBlockId for step block edge', async () => {
    mockUuidv4.mockReturnValueOnce('newStep.id')
    mockUuidv4.mockReturnValueOnce('newCard.id')

    const result = jest
      .fn()
      .mockReturnValue(stepBlockNextBlockUpdateMock.result)

    const { result: hook } = renderHook(() => useCreateStep(), {
      wrapper: ({ children }) => (
        <MockedProvider
          mocks={[
            stepAndCardBlockCreateMock,
            { ...stepBlockNextBlockUpdateMock, result }
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
        await hook.current({
          x: -200,
          y: 38,
          source: 'step0.id',
          sourceHandle: null
        })
    )

    expect(result).toHaveBeenCalled()
  })

  it('should update navigateToBlockAction for action', async () => {
    mockUuidv4.mockReturnValueOnce('newStep.id')
    mockUuidv4.mockReturnValueOnce('newCard.id')

    const { result: hook } = renderHook(() => useCreateStep(), {
      wrapper: ({ children }) => (
        <MockedProvider
          mocks={[stepAndCardBlockCreateMock, navigateToBlockActionUpdateMock]}
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
        await hook.current({
          x: -200,
          y: 38,
          source: 'step1.id',
          sourceHandle: 'block1.id'
        })
    )

    expect(navigateToBlockActionUpdateMock.result).toHaveBeenCalled()
  })
})
