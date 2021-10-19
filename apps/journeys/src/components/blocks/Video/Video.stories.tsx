import { Story, Meta } from '@storybook/react'
import { Video } from '.'
import { ApolloProvider } from '@apollo/client'
import { TreeBlock } from '../../../libs/transformer/transformer'
import { journeysConfig, StoryCard } from '../../../libs/storybook'
import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../__generated__/GetJourney'

const Demo = {
  ...journeysConfig,
  component: Video,
  title: 'Journeys/Blocks/Video'
}


const Template: Story<TreeBlock<VideoBlock>> = ({ ...props }) => (
  <ApolloProvider client={'client'}>
    <StoryCard>
      <Video {...props} />
    </StoryCard>
  </ApolloProvider>
)

export const Default = Template.bind({})
Default.args = {
  __typename: 'VideoBlock',
  id: 'Video1',
  parentBlockId: '',
  volume: 1,
  autoplay: true,
  mediaComponentId: '2_0-FallingPlates',
  languageId: '529'
}

export default Demo as Meta
