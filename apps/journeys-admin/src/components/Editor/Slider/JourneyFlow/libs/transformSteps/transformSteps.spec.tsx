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
        slug: null,
        children: []
      },
      {
        __typename: 'StepBlock' as const,
        id: 'step2.id',
        parentBlockId: null,
        parentOrder: 0,
        locked: false,
        nextBlockId: 'step3.id',
        slug: null,
        children: []
      },
      {
        __typename: 'StepBlock' as const,
        id: 'step3.id',
        parentBlockId: null,
        parentOrder: 0,
        locked: false,
        nextBlockId: null,
        slug: null,
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
        ...defaultEdgeProps,
        id: 'SocialPreview->step1.id',
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
          x: -240,
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
        slug: null,
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
            backdropBlur: null,
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
                submitEnabled: null,
                action: {
                  __typename: 'NavigateToBlockAction',
                  parentBlockId: 'button1.id',
                  gtmEventName: null,
                  blockId: 'step2.id'
                },
                children: [],
                settings: null
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
        slug: null,
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
        ...defaultEdgeProps,
        id: 'SocialPreview->step1.id',
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
        slug: null,
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
            backdropBlur: null,
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
                submitEnabled: null,
                action: {
                  __typename: 'NavigateToBlockAction',
                  parentBlockId: 'button1.id',
                  gtmEventName: null,
                  blockId: 'step1.id'
                },
                children: [],
                settings: null
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
        ...defaultEdgeProps,
        id: 'SocialPreview->step1.id',
        source: 'SocialPreview',
        target: 'step1.id',
        type: 'Start'
      }
    ])
  })

  it('should handle link and email actions', () => {
    const steps: Array<TreeBlock<StepBlock>> = [
      {
        __typename: 'StepBlock' as const,
        id: 'step1.id',
        parentBlockId: null,
        parentOrder: 0,
        locked: false,
        nextBlockId: 'step1.id',
        slug: null,
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
            backdropBlur: null,
            children: [
              {
                __typename: 'ButtonBlock',
                id: 'button1.id',
                parentBlockId: 'card1.id',
                parentOrder: 0,
                label: 'link button',
                buttonVariant: null,
                buttonColor: null,
                size: null,
                startIconId: null,
                endIconId: null,
                submitEnabled: null,
                action: {
                  __typename: 'LinkAction',
                  parentBlockId: 'button1.id',
                  gtmEventName: null,
                  url: 'https://example.com'
                },
                children: [],
                settings: null
              },
              {
                __typename: 'ButtonBlock',
                id: 'button2.id',
                parentBlockId: 'card1.id',
                parentOrder: 1,
                label: 'email button',
                buttonVariant: null,
                buttonColor: null,
                size: null,
                startIconId: null,
                endIconId: null,
                submitEnabled: null,
                action: {
                  __typename: 'EmailAction',
                  parentBlockId: 'button2.id',
                  gtmEventName: null,
                  email: 'example@email.com'
                },
                children: [],
                settings: null
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
        draggable: false,
        id: 'LinkNode-button1.id',
        parentNode: 'step1.id',
        position: { x: 300, y: 103 },
        type: 'Link'
      },
      {
        data: {},
        draggable: false,
        id: 'LinkNode-button2.id',
        parentNode: 'step1.id',
        position: { x: 300, y: 175 },
        type: 'Link'
      },
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
        ...defaultEdgeProps,
        id: 'button1.id->LinkNode-button1.id',
        source: 'step1.id',
        sourceHandle: 'button1.id',
        target: 'LinkNode-button1.id'
      },
      {
        ...defaultEdgeProps,
        id: 'button2.id->LinkNode-button2.id',
        source: 'step1.id',
        sourceHandle: 'button2.id',
        target: 'LinkNode-button2.id'
      },
      {
        ...defaultEdgeProps,
        id: 'SocialPreview->step1.id',
        source: 'SocialPreview',
        target: 'step1.id',
        type: 'Start'
      }
    ])
  })
})
