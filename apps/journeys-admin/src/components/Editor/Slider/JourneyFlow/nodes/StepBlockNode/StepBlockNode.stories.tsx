import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/react'
import { Background, ReactFlow } from 'reactflow'
import 'reactflow/dist/style.css'

import { simpleComponentConfig } from '../../../../../../libs/storybook'

import { StepBlockNode } from '.'

const StepBlockNodeStory: Meta<typeof StepBlockNode> = {
  ...simpleComponentConfig,
  component: StepBlockNode,
  title: 'Journeys-Admin/Editor/Slider/JourneyFlow/nodes/StepBlockNode'
}

const node = {
  id: '7562388a-5dbe-4b10-b14c-c0cad7420f63',
  type: 'StepBlock',
  data: {
    __typename: 'StepBlock',
    id: '7562388a-5dbe-4b10-b14c-c0cad7420f63',
    parentBlockId: null,
    parentOrder: 0,
    locked: false,
    nextBlockId: null,
    children: [
      {
        __typename: 'CardBlock',
        id: '91ba1eb7-89a1-44d6-b579-7a98315d92ad',
        parentBlockId: '7562388a-5dbe-4b10-b14c-c0cad7420f63',
        parentOrder: 0,
        backgroundColor: null,
        coverBlockId: 'f4b922ea-7834-419d-8d7b-79b3ab17ae9d',
        themeMode: null,
        themeName: null,
        fullscreen: false,
        children: [
          {
            __typename: 'TypographyBlock',
            id: '1e2b2229-81d2-4e49-aaa5-52bca5ae3d49',
            parentBlockId: '91ba1eb7-89a1-44d6-b579-7a98315d92ad',
            parentOrder: 0,
            align: null,
            color: null,
            content: 'The Journey Is On',
            variant: 'h3',
            children: []
          },
          {
            __typename: 'TypographyBlock',
            id: 'ad4205e5-cbae-4d36-8e22-b1cb6d0197da',
            parentBlockId: '91ba1eb7-89a1-44d6-b579-7a98315d92ad',
            parentOrder: 1,
            align: null,
            color: null,
            content: '"Go, and lead the people on their way..."',
            variant: 'body1',
            children: []
          },
          {
            __typename: 'TypographyBlock',
            id: 'a449d2a0-b39e-4f1b-a4f9-10eb950a47d8',
            parentBlockId: '91ba1eb7-89a1-44d6-b579-7a98315d92ad',
            parentOrder: 2,
            align: null,
            color: null,
            content: 'Deutoronomy 10:11',
            variant: 'caption',
            children: []
          },
          {
            __typename: 'ImageBlock',
            id: 'f4b922ea-7834-419d-8d7b-79b3ab17ae9d',
            parentBlockId: '91ba1eb7-89a1-44d6-b579-7a98315d92ad',
            parentOrder: null,
            src: 'https://images.unsplash.com/photo-1524414287096-c7fb74ab3ba0?w=854&q=50',
            alt: 'two hot air balloons in the sky',
            width: 854,
            height: 567,
            blurhash: 'UgFiJ[59PC=r{@E3XTxWjGngs7NeslWCskRk',
            children: []
          }
        ]
      }
    ],
    steps: [
      {
        __typename: 'StepBlock',
        id: '7562388a-5dbe-4b10-b14c-c0cad7420f63',
        parentBlockId: null,
        parentOrder: 0,
        locked: false,
        nextBlockId: null,
        children: [
          {
            __typename: 'CardBlock',
            id: '91ba1eb7-89a1-44d6-b579-7a98315d92ad',
            parentBlockId: '7562388a-5dbe-4b10-b14c-c0cad7420f63',
            parentOrder: 0,
            backgroundColor: null,
            coverBlockId: 'f4b922ea-7834-419d-8d7b-79b3ab17ae9d',
            themeMode: null,
            themeName: null,
            fullscreen: false,
            children: [
              {
                __typename: 'TypographyBlock',
                id: '1e2b2229-81d2-4e49-aaa5-52bca5ae3d49',
                parentBlockId: '91ba1eb7-89a1-44d6-b579-7a98315d92ad',
                parentOrder: 0,
                align: null,
                color: null,
                content: 'The Journey Is On',
                variant: 'h3',
                children: []
              },
              {
                __typename: 'TypographyBlock',
                id: 'ad4205e5-cbae-4d36-8e22-b1cb6d0197da',
                parentBlockId: '91ba1eb7-89a1-44d6-b579-7a98315d92ad',
                parentOrder: 1,
                align: null,
                color: null,
                content: '"Go, and lead the people on their way..."',
                variant: 'body1',
                children: []
              },
              {
                __typename: 'TypographyBlock',
                id: 'a449d2a0-b39e-4f1b-a4f9-10eb950a47d8',
                parentBlockId: '91ba1eb7-89a1-44d6-b579-7a98315d92ad',
                parentOrder: 2,
                align: null,
                color: null,
                content: 'Deutoronomy 10:11',
                variant: 'caption',
                children: []
              },
              {
                __typename: 'ImageBlock',
                id: 'f4b922ea-7834-419d-8d7b-79b3ab17ae9d',
                parentBlockId: '91ba1eb7-89a1-44d6-b579-7a98315d92ad',
                parentOrder: null,
                src: 'https://images.unsplash.com/photo-1524414287096-c7fb74ab3ba0?w=854&q=50',
                alt: 'two hot air balloons in the sky',
                width: 854,
                height: 567,
                blurhash: 'UgFiJ[59PC=r{@E3XTxWjGngs7NeslWCskRk',
                children: []
              }
            ]
          }
        ]
      }
    ]
  },
  position: { x: -200, y: 0 }
}

const defaultFlowProps = {
  edges: [],
  edgeTypes: {},
  onConnectStart: () => undefined,
  onConnectEnd: () => undefined,
  fitView: true,
  proOptions: { hideAttribution: true }
}

const Template: StoryObj<typeof StepBlockNode> = {
  render: (args) => {
    return (
      <MockedProvider>
        <Box sx={{ height: 400, width: 600 }}>
          <ReactFlow {...args}>
            <Background color="#aaa" gap={16} />
          </ReactFlow>
        </Box>
      </MockedProvider>
    )
  }
}

export const Default = {
  ...Template,
  args: {
    ...defaultFlowProps,
    nodes: [node],
    nodeTypes: {
      StepBlock: StepBlockNode
    }
  }
}

export default StepBlockNodeStory
