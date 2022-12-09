import { ComponentStory, Meta } from '@storybook/react'
import { watchConfig } from '../../../libs/storybook'
import { VideoContentFields } from '../../../../__generated__/VideoContentFields'
import { VideoLabel } from '../../../../__generated__/globalTypes'
import { ContainerHero } from '.'

const ContainerHeroStory = {
  ...watchConfig,
  component: ContainerHero,
  title: 'Watch/VideoContainerPage/ContainerHero'
}

const Template: ComponentStory<typeof ContainerHero> = ({ ...args }) => (
  <ContainerHero {...args} />
)

const defaultVideo = {
  label: VideoLabel.collection,
  title: [{ value: 'Collection video title' }],
  children: [1, 2, 3],
  image:
    'https://images.unsplash.com/photo-1669569713869-ff4a427a38ba?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3774&q=80'
} as unknown as VideoContentFields

const seriesVideo = {
  ...defaultVideo,
  label: VideoLabel.series,
  title: [{ value: 'Series video title' }]
}

export const Default = Template.bind({})
Default.args = { video: defaultVideo }

export const Series = Template.bind({})
Series.args = { video: seriesVideo }

export default ContainerHeroStory as Meta
