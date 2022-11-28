import { ComponentStory, Meta } from '@storybook/react'
import { watchConfig } from '../../../libs/storybook'
import { PlaylistHero } from '.'

const PlaylistHeroStory = {
  ...watchConfig,
  component: PlaylistHero,
  title: 'Watch/Hero/PlaylistHero'
}

const Template: ComponentStory<typeof PlaylistHero> = ({ ...args }) => (
  <PlaylistHero {...args} />
)

export const Default = Template.bind({})
Default.args = {
  title: 'Collection Title',
  imageSrc:
    'https://images.unsplash.com/photo-1669111958756-13b1d5be9110?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=4140&q=80',
  type: 'collection',
  length: 4
}

export const Series = Template.bind({})
Series.args = {
  title: 'Series title',
  imageSrc:
    'https://images.unsplash.com/photo-1669172460021-cf270d946e56?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1887&q=80',
  type: 'series',
  length: 10
}

export default PlaylistHeroStory as Meta
