import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/nextjs'
import { ComponentPropsWithoutRef } from 'react'
import { Background, ReactFlow } from 'reactflow'

import { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider, EditorState } from '@core/journeys/ui/EditorProvider'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import {
  BlockFields_ButtonBlock_action as Action,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../../__generated__/BlockFields'

import { ChatNode } from '.'

const Demo: Meta<typeof ChatNode> = {
  ...simpleComponentConfig,
  component: ChatNode,
  title: 'Journeys-Admin/Editor/Slider/JourneyFlow/nodes/ChatNode'
}

const Template: StoryObj<
  ComponentPropsWithoutRef<typeof ChatNode> & { initialState: EditorState }
> = {
  render: ({ initialState, ...args }) => {
    return (
      <MockedProvider>
        <EditorProvider initialState={initialState}>
          <Box sx={{ height: 400, width: 600 }}>
            <ReactFlow {...args}>
              <Background color="#aaa" gap={16} />
            </ReactFlow>
          </Box>
        </EditorProvider>
      </MockedProvider>
    )
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
        backdropBlur: null,
        children: [
          {
            __typename: 'ButtonBlock',
            id: 'button.id',
            parentBlockId: 'card.id',
            parentOrder: 0,
            label: 'Chat Button',
            buttonVariant: null,
            buttonColor: null,
            size: null,
            startIconId: null,
            endIconId: null,
            submitEnabled: null,
            children: [],
            action,
            settings: null
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
    Chat: ChatNode
  }
}

export const Default = {
  ...Template,
  args: {
    ...defaultFlowProps,
    nodes: [
      {
        id: 'someStep.id',
        type: 'Chat',
        position: { x: 100, y: 0 }
      }
    ],
    initialState: {
      steps: []
    }
  }
}

export const Messenger = {
  ...Template,
  args: {
    ...defaultFlowProps,
    nodes: [
      {
        id: 'button.id',
        type: 'Chat',
        position: { x: 100, y: 0 }
      }
    ],
    initialState: {
      steps: [
        addActionToStep({
          __typename: 'ChatAction' as any,
          parentBlockId: 'button.id',
          gtmEventName: null,
          chatUrl: 'https://m.me/example',
          target: '_blank',
          customizable: false,
          parentStepId: null
        } as any)
      ]
    }
  }
}

export const WhatsApp = {
  ...Template,
  args: {
    ...defaultFlowProps,
    nodes: [
      {
        id: 'button.id',
        type: 'Chat',
        position: { x: 100, y: 0 }
      }
    ],
    initialState: {
      steps: [
        addActionToStep({
          __typename: 'ChatAction' as any,
          parentBlockId: 'button.id',
          gtmEventName: null,
          chatUrl: 'https://wa.me/1234567890',
          target: '_blank',
          customizable: false,
          parentStepId: null
        } as any)
      ]
    }
  }
}

export const Telegram = {
  ...Template,
  args: {
    ...defaultFlowProps,
    nodes: [
      {
        id: 'button.id',
        type: 'Chat',
        position: { x: 100, y: 0 }
      }
    ],
    initialState: {
      steps: [
        addActionToStep({
          __typename: 'ChatAction' as any,
          parentBlockId: 'button.id',
          gtmEventName: null,
          chatUrl: 'https://t.me/username',
          target: '_blank',
          customizable: false,
          parentStepId: null
        } as any)
      ]
    }
  }
}

export const Discord = {
  ...Template,
  args: {
    ...defaultFlowProps,
    nodes: [
      {
        id: 'button.id',
        type: 'Chat',
        position: { x: 100, y: 0 }
      }
    ],
    initialState: {
      steps: [
        addActionToStep({
          __typename: 'ChatAction' as any,
          parentBlockId: 'button.id',
          gtmEventName: null,
          chatUrl: 'https://discord.gg/invitecode',
          target: '_blank',
          customizable: false,
          parentStepId: null
        } as any)
      ]
    }
  }
}

export const Slack = {
  ...Template,
  args: {
    ...defaultFlowProps,
    nodes: [
      {
        id: 'button.id',
        type: 'Chat',
        position: { x: 100, y: 0 }
      }
    ],
    initialState: {
      steps: [
        addActionToStep({
          __typename: 'ChatAction' as any,
          parentBlockId: 'button.id',
          gtmEventName: null,
          chatUrl: 'https://slack.com/join',
          target: '_blank',
          customizable: false,
          parentStepId: null
        } as any)
      ]
    }
  }
}

export const Analytics = {
  ...Template,
  args: {
    ...defaultFlowProps,
    nodes: [
      {
        id: 'button.id',
        type: 'Chat',
        position: { x: 100, y: 0 }
      }
    ],
    initialState: {
      steps: [
        addActionToStep({
          __typename: 'ChatAction' as any,
          parentBlockId: 'button.id',
          gtmEventName: null,
          chatUrl: 'https://m.me/example',
          target: '_blank',
          customizable: false,
          parentStepId: null
        } as any)
      ],
      showAnalytics: true
    }
  }
}

export default Demo
