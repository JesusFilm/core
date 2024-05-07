import { TreeBlock } from '@core/journeys/ui/block'

import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_CardBlock as CardBlock,
  BlockFields_RadioQuestionBlock as RadioQuestionBlock
} from '../../../../../../../__generated__/BlockFields'

import { transformSteps } from '.'

describe('tranformSteps', () => {
  it('should handle multiple steps without navigation actions', () => {
    const steps = [
      {
        __typename: 'StepBlock' as const,
        id: 'step1.id',
        parentBlockId: null,
        parentOrder: 0,
        locked: false,
        nextBlockId: 'step2.id',
        children: []
      },
      {
        __typename: 'StepBlock' as const,
        id: 'step2.id',
        parentBlockId: null,
        parentOrder: 0,
        locked: false,
        nextBlockId: 'step3.id',
        children: []
      },
      {
        __typename: 'StepBlock' as const,
        id: 'step3.id',
        parentBlockId: null,
        parentOrder: 0,
        locked: false,
        nextBlockId: null,
        children: []
      }
    ]

    const positions = {
      'step1.id': { x: 0, y: 0 },
      'step2.id': { x: 0, y: 10 },
      'step3.id': { x: 0, y: 20 }
    }

    const { nodes, edges } = transformSteps(steps, positions)

    expect(nodes).toEqual([
      {
        data: {},
        id: 'step1.id',
        position: { x: 0, y: 0 },
        type: 'StepBlock'
      },
      {
        data: {},
        id: 'step2.id',
        position: { x: 0, y: 10 },
        type: 'StepBlock'
      },
      {
        data: {},
        id: 'step3.id',
        position: { x: 0, y: 20 },
        type: 'StepBlock'
      },
      {
        data: {},
        draggable: false,
        id: 'SocialPreview',
        position: {
          x: -165,
          y: -195
        },
        type: 'SocialPreview'
      }
    ])

    expect(edges).toEqual([
      {
        id: 'step1.id->step2.id',
        source: 'step1.id',
        sourceHandle: undefined,
        style: {
          strokeDasharray: 4
        },
        target: 'step2.id'
      },
      {
        id: 'step2.id->step3.id',
        source: 'step2.id',
        sourceHandle: undefined,
        style: {
          strokeDasharray: 4
        },
        target: 'step3.id'
      }
    ])
  })

  it('should handle steps with navigation actions', () => {
    const steps = [
      {
        __typename: 'StepBlock' as const,
        id: 'step1.id',
        parentBlockId: null,
        nextBlockId: 'step2.id',
        parentOrder: 0,
        locked: false,
        children: [
          {
            id: 'card1.id',
            children: [
              {
                __typename: 'RadioQuestionBlock',
                id: 'radioQuestionBlock1.id',
                parentBlockId: 'card1.id',
                parentOrder: 0,
                children: [
                  {
                    __typename: 'RadioOptionBlock' as const,
                    id: 'radioOptionBlock1.id',
                    parentBlockId: 'radioQuestionBlock1.id',
                    parentOrder: 0,
                    action: {
                      __typename: 'NavigateToBlockAction' as const,
                      blockId: 'step3.id',
                      gtmEventName: null,
                      parentBlockId: 'radioOptionBlock1.id'
                    },
                    label: 'Option 1',
                    children: []
                  }
                ]
              } as unknown as TreeBlock<RadioQuestionBlock>
            ],
            parentOrder: 0,
            parentBlockId: 'step1.id',
            coverBlockId: null
          } as unknown as TreeBlock<CardBlock>
        ]
      },
      {
        __typename: 'StepBlock' as const,
        id: 'step2.id',
        parentBlockId: null,
        nextBlockId: null,
        parentOrder: 1,
        locked: false,
        children: [
          {
            __typename: 'CardBlock',
            children: [
              {
                action: {
                  __typename: 'NavigateAction',
                  parentBlockId: 'buttonBlock1.id',
                  gtmEventName: null
                },
                __typename: 'ButtonBlock',
                id: 'buttonBlock1.id',
                parentBlockId: 'card2.id',
                parentOrder: 0,
                children: []
              } as unknown as TreeBlock<ButtonBlock>
            ],
            parentOrder: 0,
            id: 'card2.id',
            parentBlockId: 'step2.id',
            coverBlockId: null
          } as unknown as TreeBlock<CardBlock>
        ]
      },
      {
        __typename: 'StepBlock' as const,
        id: 'step3.id',
        parentBlockId: null,
        parentOrder: 3,
        locked: false,
        nextBlockId: null,
        children: []
      }
    ]

    const positions = {
      'step1.id': { x: 0, y: 0 },
      'step2.id': { x: 0, y: 10 },
      'step3.id': { x: 0, y: 20 }
    }

    const { nodes, edges } = transformSteps(steps, positions)

    expect(nodes).toEqual([
      {
        data: {},
        id: 'step1.id',
        position: { x: 0, y: 0 },
        type: 'StepBlock'
      },
      {
        data: {},
        id: 'step2.id',
        position: { x: 0, y: 10 },
        type: 'StepBlock'
      },
      {
        data: {},
        id: 'step3.id',
        position: { x: 0, y: 20 },
        type: 'StepBlock'
      },
      {
        data: {},
        draggable: false,
        id: 'SocialPreview',
        position: {
          x: -165,
          y: -195
        },
        type: 'SocialPreview'
      }
    ])

    expect(edges).toEqual([
      {
        id: 'step1.id->step2.id',
        source: 'step1.id',
        sourceHandle: undefined,
        style: {
          strokeDasharray: 4
        },
        target: 'step2.id'
      },
      {
        id: 'radioOptionBlock1.id->step3.id',
        source: 'step1.id',
        sourceHandle: 'radioOptionBlock1.id',
        target: 'step3.id'
      },
      {
        id: 'step2.id->step3.id',
        source: 'step2.id',
        sourceHandle: 'step2.id',
        style: {
          strokeDasharray: 4
        },
        target: 'step3.id'
      },
      {
        id: 'buttonBlock1.id->step3.id',
        source: 'step2.id',
        sourceHandle: 'buttonBlock1.id',
        style: {
          strokeDasharray: 4
        },
        target: 'step3.id'
      }
    ])
  })

  it('should not add a handle for NavigateActions without a next step', () => {
    const steps = [
      {
        __typename: 'StepBlock' as const,
        id: 'step1.id',
        parentBlockId: null,
        nextBlockId: null,
        parentOrder: 1,
        locked: false,
        children: [
          {
            __typename: 'CardBlock',
            children: [
              {
                action: {
                  __typename: 'NavigateAction',
                  parentBlockId: 'buttonBlock1.id',
                  gtmEventName: null
                },
                __typename: 'ButtonBlock',
                id: 'buttonBlock1.id',
                parentBlockId: 'card1.id',
                parentOrder: 0,
                children: []
              } as unknown as TreeBlock<ButtonBlock>
            ],
            parentOrder: 0,
            id: 'card1.id',
            parentBlockId: 'step1.id',
            coverBlockId: null
          } as unknown as TreeBlock<CardBlock>
        ]
      }
    ]

    const positions = {
      'step1.id': { x: 0, y: 0 }
    }

    const { nodes, edges } = transformSteps(steps, positions)

    expect(nodes).toEqual([
      {
        data: {},
        id: 'step1.id',
        position: { x: 0, y: 0 },
        type: 'StepBlock'
      },
      {
        data: {},
        draggable: false,
        id: 'SocialPreview',
        position: {
          x: -165,
          y: -195
        },
        type: 'SocialPreview'
      }
    ])

    expect(edges).toEqual([])
  })

  it('should handle empty steps and positions', () => {
    const { nodes, edges } = transformSteps([], {})

    expect(nodes).toEqual([
      {
        data: {},
        draggable: false,
        id: 'SocialPreview',
        position: {
          x: -165,
          y: -195
        },
        type: 'SocialPreview'
      }
    ])

    expect(edges).toEqual([])
  })
})
