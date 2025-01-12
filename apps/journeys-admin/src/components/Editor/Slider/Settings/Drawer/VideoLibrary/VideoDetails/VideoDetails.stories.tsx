import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps, ReactElement, useState } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { journeysAdminConfig } from '@core/shared/ui/storybook'

import {
  BlockFields_ImageBlock as ImageBlock,
  BlockFields_VideoBlock as VideoBlock
} from '../../../../../../../../__generated__/BlockFields'
import { GetVideo_video_variantLanguages as Language } from '../../../../../../../../__generated__/GetVideo'
import { VideoBlockSource } from '../../../../../../../../__generated__/globalTypes'
import { ApolloLoadingProvider } from '../../../../../../../../test/ApolloLoadingProvider'
import { GET_VIDEO } from '../VideoFromLocal/LocalDetails/LocalDetails'

import { VideoDetails } from '.'

const VideoDetailsStory: Meta<typeof VideoDetails> = {
  ...journeysAdminConfig,
  component: VideoDetails,
  title:
    'Journeys-Admin/Editor/Slider/Settings/Drawer/VideoLibrary/VideoDetails',
  argTypes: { onSelect: { action: 'clicked' } }
}

const languages: Language[] = [
  {
    __typename: 'Language',
    id: '529',
    slug: 'english',
    name: [
      {
        value: 'English',
        primary: true,
        __typename: 'LanguageName'
      }
    ]
  },
  {
    id: '496',
    __typename: 'Language',
    slug: 'french',
    name: [
      {
        value: 'Français',
        primary: true,
        __typename: 'LanguageName'
      },
      {
        value: 'French',
        primary: false,
        __typename: 'LanguageName'
      }
    ]
  },
  {
    id: '1106',
    __typename: 'Language',
    slug: 'german-standard',
    name: [
      {
        value: 'Deutsch',
        primary: true,
        __typename: 'LanguageName'
      },
      {
        value: 'German, Standard',
        primary: false,
        __typename: 'LanguageName'
      }
    ]
  }
]

const VideoDetailsComponent = ({
  id,
  onSelect,
  activeVideoBlock,
  videoDescription
}: ComponentProps<typeof VideoDetails> & {
  videoDescription: string
}): ReactElement => {
  const [open, setOpen] = useState(true)

  return (
    <MockedProvider
      mocks={[
        {
          request: {
            query: GET_VIDEO,
            variables: {
              id: '2_Acts7302-0-0',
              languageId: '529'
            }
          },
          result: {
            data: {
              video: {
                id: '2_Acts7302-0-0',
                image:
                  'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7302-0-0.mobileCinematicHigh.jpg',
                primaryLanguageId: '529',
                title: [
                  {
                    primary: true,
                    value: 'Jesus Taken Up Into Heaven'
                  }
                ],
                description: [
                  {
                    primary: true,
                    value: videoDescription
                  }
                ],
                variant: {
                  id: 'variantA',
                  duration: 144,
                  hls: 'https://arc.gt/opsgn'
                },
                variantLanguages: languages
              }
            }
          }
        }
      ]}
    >
      <VideoDetails
        id={id}
        open={open}
        onClose={() => setOpen(false)}
        onSelect={onSelect}
        source={VideoBlockSource.internal}
        activeVideoBlock={activeVideoBlock}
      />
    </MockedProvider>
  )
}

const Template: StoryObj<
  ComponentProps<typeof VideoDetails> & { videoDescription: string }
> = {
  render: ({ ...args }) => <VideoDetailsComponent {...args} />
}

export const Default = {
  ...Template,
  args: {
    id: '2_Acts7302-0-0',
    videoDescription:
      'Jesus promises the Holy Spirit; then ascends into the clouds.'
  }
}

export const LongDescription = {
  ...Template,
  args: {
    ...Default.args,
    videoDescription:
      'Jesus promises the Holy Spirit; then ascends into the clouds. This description is set long on purpose to showcase the functionality of the "More" and "Less" buttons.'
  }
}

const imageBlock: TreeBlock<ImageBlock> = {
  id: 'imageBlockId',
  __typename: 'ImageBlock',
  parentBlockId: 'videoBlockId',
  parentOrder: 0,
  src: 'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7302-0-0.mobileCinematicHigh.jpg',
  alt: 'Default Image Icon',
  width: 0,
  height: 0,
  blurhash: '',
  children: [],
  scale: null,
  focalLeft: 50,
  focalTop: 50
}
const videoBlock: TreeBlock<VideoBlock> = {
  id: 'videoBlockId',
  __typename: 'VideoBlock',
  parentBlockId: 'card1.id',
  parentOrder: 0,
  startAt: 0,
  endAt: null,
  muted: true,
  autoplay: true,
  fullsize: true,
  action: null,
  videoId: null,
  videoVariantLanguageId: null,
  source: VideoBlockSource.internal,
  title: null,
  description: null,
  duration: null,
  image: null,
  mediaVideo: null,
  posterBlockId: 'imageBlockId',
  objectFit: null,
  children: [imageBlock]
}

export const Selected = {
  ...Template,
  args: {
    ...Default.args,
    activeVideoBlock: videoBlock
  }
}

const LoadingComponent = ({ id, onSelect }): ReactElement => {
  const [open, setOpen] = useState(true)

  return (
    <ApolloLoadingProvider>
      <VideoDetails
        id={id}
        open={open}
        onClose={() => setOpen(false)}
        onSelect={onSelect}
        source={VideoBlockSource.internal}
      />
    </ApolloLoadingProvider>
  )
}

export const Loading: StoryObj<typeof VideoDetails> = {
  render: ({ id, onSelect }) => (
    <LoadingComponent id={id} onSelect={onSelect} />
  ),
  args: {
    id: '2_Acts7302-0-0'
  }
}

export default VideoDetailsStory
