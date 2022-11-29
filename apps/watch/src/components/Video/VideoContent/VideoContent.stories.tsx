import { Meta, ComponentStory } from '@storybook/react'
import { watchConfig } from '../../../libs/storybook'
import { VideoType } from '../../../../__generated__/globalTypes'
import { GetVideo_video as Video } from '../../../../__generated__/GetVideo'
import { VideoContent } from './VideoContent'

const VideoContentStory = {
  ...watchConfig,
  component: VideoContent,
  title: 'Watch/Video/VideoContent'
}

const video: Video = {
  id: '2_0-FallingPlates',
  type: VideoType.standalone,
  __typename: 'Video',
  image:
    'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_0-FallingPlates.mobileCinematicHigh.jpg',
  snippet: [
    {
      value:
        '#FallingPlates leads through a series of visual metaphors: creation, the fall, Christ’s coming and resurrection, redemption, and our salvation. The video ends with Jesus asking you to respond to His life altering question, “Will you follow me?”.',
      __typename: 'Translation'
    }
  ],
  description: [
    {
      value:
        '#FallingPlates leads through a series of visual metaphors: creation, the fall, Christ’s coming and resurrection, redemption, and our salvation. The video ends with Jesus asking you to respond to His life altering question, “Will you follow me?”.\n\n#FallingPlates is an award winning short film about life, death & love of a Savior. It’s a flying 4 minute video depiction of the Gospel message with viral momentum (over 4 million views).\n\nAfter you showing the #FallingPlates video to a friend, ask: “Sometime, I’d like to hear more about your spiritual journey... would you be up for that?” And, during that conversation (or in the next one) you will ask if you can meet to hear his or her story.\n\nAn Easy Approach...\nExplore Past Experiences: Where they’ve been\n- What was your religious background as a child?\n- What have you tried in your spiritual journey since?\n\nExplore Present Attitudes: Where they are\n- Where are you now in your spiritual journey?\n- How has your search left you feeling?\n\nExplore Future Direction: Where they are going\n- Do you think you are moving toward God, away from God, or staying about the same?\n- On a scale of 1-10, how would you rate your desire to know God personally?\n- Proceed with sharing the Gospel.\n\nContinue the Conversation: http://www.fallingplates.com/ \n\nTRANSLATION requests for this video email: FallingPlatesVideo@gmail.com',
      __typename: 'Translation'
    }
  ],
  studyQuestions: [
    {
      value:
        'Life is portrayed as falling plates. What do you think about that?',
      __typename: 'Translation'
    },
    {
      value:
        'Everyone is on a spiritual journey. Where do you think you are on that journey?',
      __typename: 'Translation'
    },
    {
      value:
        'Do you think you are moving toward God, away from God, or staying about the same?',
      __typename: 'Translation'
    },
    {
      value: 'Would you like to hear how you can know God personally?',
      __typename: 'Translation'
    }
  ],
  title: [
    {
      value: '#FallingPlates',
      __typename: 'Translation'
    }
  ],
  variant: {
    duration: 247,
    hls: 'https://arc.gt/zbrvj',
    __typename: 'VideoVariant'
  },
  episodes: [],
  slug: [
    {
      value: 'fallingplates',
      __typename: 'Translation'
    }
  ],
  variantLanguages: []
}

const Template: ComponentStory<typeof VideoContent> = () => (
  <VideoContent video={video} />
)

export const Default = Template.bind({})

export default VideoContentStory as Meta
