import { TreeBlock } from '@core/journeys/ui/block'

import { BlockFields_StepBlock as StepBlock } from '../../../../../../../__generated__/BlockFields'

import {
  defaultEdgeProps,
  hiddenEdge,
  hiddenNode,
  socialNode
} from './transformSteps'

import { transformSteps } from '.'

describe('transformSteps', () => {
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
      socialNode,
      hiddenNode,
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
      }
    ])

    expect(edges).toEqual([
      hiddenEdge,
      {
        id: 'step1.id->step2.id',
        source: 'step1.id',
        sourceHandle: undefined,
        target: 'step2.id',
        ...defaultEdgeProps
      },
      {
        id: 'step2.id->step3.id',
        source: 'step2.id',
        sourceHandle: undefined,
        target: 'step3.id',
        ...defaultEdgeProps
      },
      {
        id: 'SocialPreview->step1.id',
        markerEnd: {
          color: '#d9d9dc',
          height: 10,
          type: 'arrowclosed',
          width: 10
        },
        source: 'SocialPreview',
        target: 'step1.id',
        type: 'Start'
      }
    ])
  })

  it('should handle empty steps and positions', () => {
    const { nodes, edges } = transformSteps([], {})

    expect(nodes).toEqual([
      {
        data: {},
        draggable: false,
        id: 'SocialPreview',
        position: {
          x: -365,
          y: -46
        },
        type: 'SocialPreview'
      },
      hiddenNode
    ])

    expect(edges).toEqual([hiddenEdge])
  })

  it('should handle action blocks', () => {
    const steps: Array<TreeBlock<StepBlock>> = [
      {
        __typename: 'StepBlock' as const,
        id: 'step1.id',
        parentBlockId: null,
        parentOrder: 0,
        locked: false,
        nextBlockId: null,
        children: [
          {
            __typename: 'CardBlock',
            id: 'card1.id',
            parentBlockId: 'step1.id',
            parentOrder: 0,
            backgroundColor: null,
            coverBlockId: null,
            themeName: null,
            themeMode: null,
            fullscreen: false,
            children: [
              {
                __typename: 'ButtonBlock',
                id: 'button1.id',
                parentBlockId: 'card1.id',
                parentOrder: 0,
                label: 'button1',
                buttonVariant: null,
                buttonColor: null,
                size: null,
                startIconId: null,
                endIconId: null,
                action: {
                  __typename: 'NavigateToBlockAction',
                  parentBlockId: 'button1.id',
                  gtmEventName: null,
                  blockId: 'step2.id'
                },
                children: []
              }
            ]
          }
        ]
      },
      {
        __typename: 'StepBlock' as const,
        id: 'step2.id',
        parentBlockId: null,
        parentOrder: 0,
        locked: false,
        nextBlockId: null,
        children: []
      }
    ]
    const positions = {
      'step1.id': { x: 0, y: 0 },
      'step2.id': { x: 0, y: 10 }
    }
    const { nodes, edges } = transformSteps(steps, positions)

    expect(nodes).toEqual([
      socialNode,
      hiddenNode,
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
      }
    ])

    expect(edges).toEqual([
      hiddenEdge,
      {
        id: 'button1.id->step2.id',
        source: 'step1.id',
        sourceHandle: 'button1.id',
        target: 'step2.id',
        ...defaultEdgeProps
      },
      {
        id: 'SocialPreview->step1.id',
        markerEnd: {
          color: '#d9d9dc',
          height: 10,
          type: 'arrowclosed',
          width: 10
        },
        source: 'SocialPreview',
        target: 'step1.id',
        type: 'Start'
      }
    ])
  })

  it('should not return edges that connects back the parent step', () => {
    const steps: Array<TreeBlock<StepBlock>> = [
      {
        __typename: 'StepBlock' as const,
        id: 'step1.id',
        parentBlockId: null,
        parentOrder: 0,
        locked: false,
        nextBlockId: 'step1.id',
        children: [
          {
            __typename: 'CardBlock',
            id: 'card1.id',
            parentBlockId: 'step1.id',
            parentOrder: 0,
            backgroundColor: null,
            coverBlockId: null,
            themeName: null,
            themeMode: null,
            fullscreen: false,
            children: [
              {
                __typename: 'ButtonBlock',
                id: 'button1.id',
                parentBlockId: 'card1.id',
                parentOrder: 0,
                label: 'button1',
                buttonVariant: null,
                buttonColor: null,
                size: null,
                startIconId: null,
                endIconId: null,
                action: {
                  __typename: 'NavigateToBlockAction',
                  parentBlockId: 'button1.id',
                  gtmEventName: null,
                  blockId: 'step1.id'
                },
                children: []
              }
            ]
          }
        ]
      }
    ]
    const positions = {
      'step1.id': { x: 0, y: 0 }
    }
    const { nodes, edges } = transformSteps(steps, positions)

    expect(nodes).toEqual([
      socialNode,
      hiddenNode,
      {
        data: {},
        id: 'step1.id',
        position: { x: 0, y: 0 },
        type: 'StepBlock'
      }
    ])

    expect(edges).toEqual([
      hiddenEdge,
      {
        id: 'SocialPreview->step1.id',
        markerEnd: {
          color: '#d9d9dc',
          height: 10,
          type: 'arrowclosed',
          width: 10
        },
        source: 'SocialPreview',
        target: 'step1.id',
        type: 'Start'
      }
    ])
  })
})
