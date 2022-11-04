import { Meta, Story } from '@storybook/react'
import { watchConfig } from '../../../libs/storybook'
import { VideoType } from '../../../../__generated__/globalTypes'
import { SimpleHero } from './SimpleHero'

const SimpleHeroStory = {
  ...watchConfig,
  component: SimpleHero,
  title: 'Watch/Hero/SimpleHero'
}

const episode = {
  id: '1_fj_1-0-0',
  type: VideoType.standalone,
  image:
    'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_fj_1-0-0.mobileCinematicHigh.jpg',
  imageAlt: [
    {
      value: 'image',
      __typename: 'Translation'
    }
  ],
  snippet: [
    {
      value:
        "A few men in the village walk and talk. The JESUS film has been shown in their village and it's made an impression. One man keeps remembering how Jesus brought the daughter of Jairus from death to life.",
      __typename: 'Translation'
    }
  ],
  title: [
    {
      value: 'Who is God',
      __typename: 'Translation'
    }
  ],
  variant: {
    duration: 1079,
    __typename: 'VideoVariant',
    hls: 'https://arc.gt/qjqeh'
  },
  __typename: 'Video',
  episodeIds: [],
  slug: [
    {
      value: 'who-is-god',
      __typename: 'Translation'
    }
  ]
}

const Template: Story = ({ ...args }) => (
  <SimpleHero video={args.video} loading={args.loading} />
)

export const Default = Template.bind({})
Default.args = {
  video: {
    id: '1_fj-0-0',
    type: VideoType.playlist,
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_cl-0-0.mobileCinematicHigh.jpg',
    title: [
      {
        value: 'Following Jesus (India)',
        __typename: 'Translation'
      }
    ],
    variant: { duration: 0, __typename: 'VideoVariant', hls: null },
    __typename: 'Video',
    slug: [
      {
        value: 'following-jesus-india',
        __typename: 'Translation'
      }
    ],
    description: [
      {
        value: 'description',
        __typename: 'Translation'
      }
    ],
    episodes: [episode, episode, episode],
    variantLanguages: [
      {
        __typename: 'language',
        id: 1171,
        name: [{ __typename: 'Translation', value: 'Assamese' }]
      }
    ]
  },
  loading: false
}

export default SimpleHeroStory as Meta
