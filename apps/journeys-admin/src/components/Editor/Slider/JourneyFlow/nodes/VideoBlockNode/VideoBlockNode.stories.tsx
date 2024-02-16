import { Meta, StoryObj } from '@storybook/react'
import { ReactElement } from 'react'
import { ReactFlowProvider } from 'reactflow'

import { TreeBlock } from '@core/journeys/ui/block/TreeBlock'

import { BlockFields_StepBlock as StepBlock } from '../../../../../../../__generated__/BlockFields'
import { VideoBlockSource } from '../../../../../../../__generated__/globalTypes'
import { journeysAdminConfig } from '../../../../../../libs/storybook'

import { VideoBlockNode, VideoBlockNodeData } from '.'

const VideoBlockNodeStory: Meta<typeof VideoBlockNode> = {
  ...journeysAdminConfig,
  component: VideoBlockNode,
  title: 'Journeys-Admin/JourneyFlow/VideoBlockNode'
}

const stepBlock: TreeBlock<StepBlock> = {
  id: 'step2.id',
  __typename: 'StepBlock',
  parentBlockId: null,
  parentOrder: 0,
  locked: false,
  nextBlockId: 'step3.id',
  children: []
}

const videoBlockNodeData: VideoBlockNodeData = {
  step: stepBlock,
  muted: null,
  autoplay: null,
  startAt: null,
  endAt: null,
  posterBlockId: null,
  fullsize: null,
  videoId: null,
  videoVariantLanguageId: '1',
  source: VideoBlockSource.internal,
  title: 'video title',
  description: 'description of video',
  __typename: 'VideoBlock',
  id: 'cee5fa56-764f-4e77-b5a6-7c753078d3ec',
  parentBlockId: null,
  parentOrder: null,
  image: null,
  duration: null,
  objectFit: null,
  video: null,
  action: null,
  children: [
    {
      backgroundColor: null,
      children: [
        {
          alt: 'onboarding card 1 cover',
          blurhash: 'UbLX6?~p9FtRkX.8ogD%IUj@M{adxaM_ofkW',
          children: [],
          height: 768,
          id: 'c1819b66-ecce-4448-aad5-1b0076e27a52',
          parentBlockId: 'f812a82e-50ad-464a-9d26-af07127ce742',
          parentOrder: 0,
          src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/ae95a856-1401-41e1-6f3e-7b4e6f707f00/public',
          width: 1152,
          __typename: 'ImageBlock'
        },
        {
          align: null,
          children: [],
          color: null,
          content:
            'This title is really long so that the line wrap can be tested and shown',
          id: '2b59b819-667c-49c4-b2fe-ed1a1f355993',
          parentBlockId: 'f812a82e-50ad-464a-9d26-af07127ce742',
          parentOrder: 0,
          variant: null,
          __typename: 'TypographyBlock'
        },
        {
          align: null,
          children: [],
          color: null,
          content:
            'This title is really long so that the line wrap can be tested and shown',
          id: '2b59b819-667c-49c4-b2fe-ed1a1f355993',
          parentBlockId: 'f812a82e-50ad-464a-9d26-af07127ce742',
          parentOrder: 0,
          variant: null,
          __typename: 'TypographyBlock'
        }
      ],
      coverBlockId: 'c1819b66-ecce-4448-aad5-1b0076e27a52',
      fullscreen: false,
      id: 'f812a82e-50ad-464a-9d26-af07127ce742',
      parentBlockId: '94302faa-73b9-4023-b639-8b6e1ad5e391',
      parentOrder: 0,
      themeMode: null,
      themeName: null,
      __typename: 'CardBlock'
    }
  ]
}

const VideoBlockNodeComponent = (): ReactElement => {
  return (
    <ReactFlowProvider>
      <VideoBlockNode
        id=""
        data={videoBlockNodeData}
        selected={false}
        type=""
        zIndex={0}
        isConnectable={false}
        xPos={0}
        yPos={0}
        dragging={false}
      />
    </ReactFlowProvider>
  )
}

const Template: StoryObj<typeof VideoBlockNode> = {
  render: () => <VideoBlockNodeComponent />
}

export const Default = { ...Template }

export default VideoBlockNodeStory
