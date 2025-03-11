import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/react'
import { Background, ReactFlow } from '@xyflow/react'
import { ComponentPropsWithoutRef } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider, EditorState } from '@core/journeys/ui/EditorProvider'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import {
  BlockFields_ButtonBlock_action as Action,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../../__generated__/BlockFields'

import { LinkNode } from '.'

const meta = {
  component: LinkNode,
  title: 'Journeys-Admin/Editor/Slider/JourneyFlow/nodes/LinkNode'
} satisfies Meta<typeof LinkNode>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <ReactFlow {...args}>
      <Background />
    </ReactFlow>
  ),
  args: {
    nodes: [
      {
        id: 'link-1',
        type: 'link',
        position: { x: 0, y: 0 },
        data: {
          label: 'Link Node',
          journeyId: 'journey-id',
          journeyTitle: 'Journey Title'
        }
      }
    ],
    nodeTypes: {
      link: LinkNode
    }
  }
}

function addActionToStep(action: Action): TreeBlock<StepBlock> {
  return {
    __typename: 'StepBlock',
    id: 'step.id',
    parentBlockId: null,
    parentOrder: 0,
    locked: false,
    nextBlockId: null,
    slug: null,
    children: [
      {
        __typename: 'CardBlock',
        id: 'card.id',
        parentBlockId: 'step.id',
        parentOrder: 0,
        backgroundColor: null,
        coverBlockId: null,
        themeMode: null,
        themeName: null,
        fullscreen: false,
        children: [
          {
            __typename: 'ButtonBlock',
            id: 'button.id',
            parentBlockId: 'card.id',
            parentOrder: 0,
            label: 'Link Button',
            buttonVariant: null,
            buttonColor: null,
            size: null,
            startIconId: null,
            endIconId: null,
            children: [],
            action
          }
        ]
      }
    ]
  }
}

const defaultFlowProps = {
  edges: [],
  edgeTypes: {},
  onConnectStart: () => undefined,
  onConnectEnd: () => undefined,
  fitView: true,
  proOptions: { hideAttribution: true },
  nodeTypes: {
    Link: LinkNode
  }
}

export const Link = {
  ...Default,
  args: {
    ...defaultFlowProps,
    nodes: [
      {
        id: 'button.id',
        type: 'Link',
        position: { x: 100, y: 0 }
      }
    ],
    initialState: {
      steps: [
        addActionToStep({
          __typename: 'LinkAction',
          parentBlockId: 'button.id',
          gtmEventName: null,
          url: 'https://www.google.com'
        })
      ]
    }
  }
}

export const Bible = {
  ...Default,
  args: {
    ...defaultFlowProps,
    nodes: [
      {
        id: 'button.id',
        type: 'Link',
        position: { x: 100, y: 0 }
      }
    ],
    initialState: {
      steps: [
        addActionToStep({
          __typename: 'LinkAction',
          parentBlockId: 'button.id',
          gtmEventName: null,
          url: 'https://www.bible.com'
        })
      ]
    }
  }
}

export const Chat = {
  ...Default,
  args: {
    ...defaultFlowProps,
    nodes: [
      {
        id: 'button.id',
        type: 'Link',
        position: { x: 100, y: 0 }
      }
    ],
    initialState: {
      steps: [
        addActionToStep({
          __typename: 'LinkAction',
          parentBlockId: 'button.id',
          gtmEventName: null,
          url: 'https://m.me/example'
        })
      ]
    }
  }
}

export const Email = {
  ...Default,
  args: {
    ...defaultFlowProps,
    nodes: [
      {
        id: 'button.id',
        type: 'Link',
        position: { x: 100, y: 0 }
      }
    ],
    initialState: {
      steps: [
        addActionToStep({
          __typename: 'EmailAction',
          parentBlockId: 'button.id',
          gtmEventName: null,
          email: 'email@example.com'
        })
      ]
    }
  }
}

export const Analytics = {
  ...Default,
  args: {
    ...defaultFlowProps,
    nodes: [
      {
        id: 'someStep.id',
        type: 'Link',
        position: { x: 100, y: 0 }
      }
    ],
    initialState: {
      steps: [],
      showAnalytics: true
    }
  }
}
