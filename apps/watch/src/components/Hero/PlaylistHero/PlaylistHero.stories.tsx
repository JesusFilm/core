import { ComponentStory, Meta } from '@storybook/react'
import { watchConfig } from '../../../libs/storybook'
import { videos } from '../../Videos/testData'
import { GetVideo_video as Video } from '../../../../__generated__/GetVideo'
import { PlaylistHero } from '.'

const PlaylistHeroStory = {
  ...watchConfig,
  component: PlaylistHero,
  title: 'Watch/Hero/PlaylistHero'
}

const Template: ComponentStory<typeof PlaylistHero> = ({ ...args }) => (
  <PlaylistHero {...args} />
)

const video = { ...videos[0], episodes: [] } as unknown as Video

export const Default = Template.bind({})
Default.args = { video }

// TODO: bring back once we can find difference between series and collection
// export const Series = Template.bind({})
// Series.args = { video }

export default PlaylistHeroStory as Meta
