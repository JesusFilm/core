import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/react'
import { Background, ReactFlow } from 'reactflow'
import 'reactflow/dist/style.css'

import { TreeBlock } from '@core/journeys/ui/block'

import {
  BlockFields_StepBlock as StepBlock,
  BlockFields_VideoBlock as VideoBlock
} from '../../../../../../../__generated__/BlockFields'
import {
  ThemeMode,
  ThemeName,
  VideoBlockSource
} from '../../../../../../../__generated__/globalTypes'
import { journeysAdminConfig } from '../../../../../../libs/storybook'

import { VideoBlockNode } from '.'

const VideoBlockNodeStory: Meta<typeof VideoBlockNode> = {
  ...journeysAdminConfig,
  component: VideoBlockNode,
  title: 'Journeys-Admin/Editor/Slider/JourneyFlow/nodes/VideoBlockNode'
}

const block: TreeBlock<VideoBlock> = {
  __typename: 'VideoBlock',
  id: 'VideoBlock.id',
  parentBlockId: 'CardBlock.id',
  parentOrder: 0,
  muted: false,
  autoplay: false,
  startAt: 0,
  endAt: null,
  posterBlockId: null,
  fullsize: false,
  videoId: 'video.id',
  videoVariantLanguageId: null,
  source: VideoBlockSource.youTube,
  title: null,
  description: null,
  image: null,
  duration: null,
  objectFit: null,
  video: {
    __typename: 'Video',
    id: 'video.id',
    title: [],
    image: null,
    variant: null
  },
  action: null,
  children: []
}

const step: TreeBlock<StepBlock> = {
  __typename: 'StepBlock',
  id: 'StepBlock.id',
  locked: false,
  nextBlockId: null,
  parentBlockId: null,
  parentOrder: 0,
  children: [
    {
      __typename: 'CardBlock',
      id: 'CardBlock.id',
      parentBlockId: 'StepBlock.id',
      backgroundColor: null,
      coverBlockId: null,
      fullscreen: false,
      parentOrder: 0,
      themeMode: ThemeMode.dark,
      themeName: ThemeName.base,
      children: [block]
    }
  ]
}

const defaultFlowProps = {
  edges: [],
  edgeTypes: {},
  onConnectStart: () => undefined,
  onConnectEnd: () => undefined,
  fitView: true,
  proOptions: { hideAttribution: true }
}

const Template: StoryObj<typeof VideoBlockNode> = {
  render: (args) => {
    return (
      <MockedProvider>
        <Box sx={{ height: 200, width: 400 }}>
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
    nodes: [
      {
        id: block.id,
        data: {
          ...block,
          step
        },
        type: block.__typename,
        position: {
          x: 0,
          y: 0
        },
        selectable: false
      }
    ],
    nodeTypes: {
      VideoBlock: VideoBlockNode
    }
  }
}

export const BlockTitle = {
  ...Template,
  args: {
    ...defaultFlowProps,
    nodes: [
      {
        id: block.id,
        data: {
          ...block,
          title: 'Video block title',
          step
        },
        type: block.__typename,
        position: {
          x: 0,
          y: 0
        },
        selectable: false
      }
    ],
    nodeTypes: {
      VideoBlock: VideoBlockNode
    }
  }
}

export const VideoTitle = {
  ...Template,
  args: {
    ...defaultFlowProps,
    nodes: [
      {
        id: block.id,
        data: {
          ...block,
          video: {
            __typename: 'Video',
            id: 'video.id',
            title: [
              {
                __typename: 'Translation',
                value: 'Video title'
              }
            ],
            image: null,
            variant: null
          },
          step
        },
        type: block.__typename,
        position: {
          x: 0,
          y: 0
        },
        selectable: false
      }
    ],
    nodeTypes: {
      VideoBlock: VideoBlockNode
    }
  }
}

export default VideoBlockNodeStory
