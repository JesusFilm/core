import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/react'
import { ComponentPropsWithoutRef } from 'react'
import { Background, ReactFlow } from 'reactflow'

import { EditorProvider, EditorState } from '@core/journeys/ui/EditorProvider'
import { TreeBlock } from '@core/journeys/ui/block'

import {
  BlockFields_ButtonBlock_action as Action,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../../__generated__/BlockFields'
import { simpleComponentConfig } from '../../../../../../libs/storybook'

import { LinkNode } from '.'

const Demo: Meta<typeof LinkNode> = {
  ...simpleComponentConfig,
  component: LinkNode,
  title: 'Journeys-Admin/Editor/Slider/JourneyFlow/nodes/LinkNode'
}

const Template: StoryObj<
  ComponentPropsWithoutRef<typeof LinkNode> & { initialState: EditorState }
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

export const Default = {
  ...Template,
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
      steps: []
    }
  }
}

export const Link = {
  ...Template,
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
  ...Template,
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
  ...Template,
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
  ...Template,
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
  ...Template,
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

export default Demo
