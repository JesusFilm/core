import { Story, Meta } from '@storybook/react'
import { ComponentProps } from 'react'
import { watchConfig } from '../../../libs/storybook'
import { VideoContentFields } from '../../../../__generated__/VideoContentFields'
import { videos } from '../../Videos/testData'
import { VideoProvider } from '../../../libs/videoContext'
import { VideoLabel } from '../../../../__generated__/globalTypes'
import { CarouselItem } from './CarouselItem'

const CarouselItemStory = {
  ...watchConfig,
  component: CarouselItem,
  title: 'Watch/Video/CarouselItem'
}

const noImage: VideoContentFields = {
  __typename: 'Video',
  id: '3_0-8DWJ-WIJ_06-0-0',
  label: VideoLabel.episode,
  image: null,
  imageAlt: [{ __typename: 'Translation', value: 'Day 6: Jesus Died for Me' }],
  snippet: [
    {
      __typename: 'Translation',
      value:
        'MentorLink International and The JESUS Film Project have partnered to develop "Days with Jesus", a series of innovative tools specifically designed to help users deepen their walk with Christ. "Days with Jesus" delivers video clips from The JESUS Film along with thought-provoking questions designed to challenge and transform a person’s heart, character, values and motives. Take this opportunity to enhance and deepen your understanding of Jesus, the Son of God. Visit www.mentorlink.org for more information.'
    }
  ],
  description: [
    {
      __typename: 'Translation',
      value:
        "They arrive at the place where the crosses are being set up. Others are being tied to their crosses. Jesus is stripped and led to His own cross. They throw Him down on it. There are cries as the others are nailed to their crosses.\n\nThe nails are hammered through Jesus's wrists and feet as He screams. Then slowly, the crosses are erected as Romans pulls the ropes. Jesus is lifted high in the air. He hangs on the cross, tired and in pain. He prays for those in the crowd. He asks God to forgive them because they don't know what they do.\n\nThe crowd murmurs at the feet of the cross. Annas and Caiaphas comment that He saved others. They wonder why He doesn't save Himself. The crowd starts to jeer. They urge Him to save Himself. But He doesn't."
    }
  ],
  studyQuestions: [
    {
      __typename: 'Translation',
      value: 'How do I feel about Jesus being crucified?'
    },
    {
      __typename: 'Translation',
      value: "How do Jesus' words to the thief on the cross give me hope?"
    }
  ],
  title: [{ __typename: 'Translation', value: 'Day 6: Jesus Died for Me' }],
  variant: {
    __typename: 'VideoVariant',
    id: '3_529-0-8DWJ-WIJ_06-0-0',
    duration: 488,
    hls: 'https://arc.gt/xqav7',
    language: {
      __typename: 'Language',
      id: '529',
      name: [{ __typename: 'Translation', value: 'English' }]
    },
    slug: 'day-6-jesus-died-for-me/english'
  },
  slug: 'day-6-jesus-died-for-me',
  children: []
}

const Template: Story<
  ComponentProps<typeof CarouselItem> & {
    content: VideoContentFields
  }
> = ({ ...args }) => {
  return (
    <VideoProvider
      value={{
        content: args.content
      }}
    >
      <CarouselItem
        index={args.index}
        isPlaying={args.isPlaying}
        onClick={() => console.log('clicked')}
      />
    </VideoProvider>
  )
}

export const Default = Template.bind({})
Default.args = {
  content: videos[0],
  index: 5,
  isPlaying: false
}

export const Label = Template.bind({})
Label.args = {
  content: videos[6],
  index: 5,
  isPlaying: false
}

export const NoImage = Template.bind({})
NoImage.args = {
  content: noImage,
  index: 5,
  isPlaying: false
}

export const IsPlaying = Template.bind({})
IsPlaying.args = {
  content: videos[0],
  index: 5,
  isPlaying: true
}

export default CarouselItemStory as Meta
