import { ComponentMeta, ComponentStory } from '@storybook/react'
import noop from 'lodash/noop'

import { watchConfig } from '../../../libs/storybook'
import { VideoProvider } from '../../../libs/videoContext'
import { videos } from '../../Videos/__generated__/testData'

import { ContainerHero } from '.'

const ContainerHeroStory: ComponentMeta<typeof ContainerHero> = {
  ...watchConfig,
  component: ContainerHero,
  title: 'Watch/VideoContainerPage/ContainerHero'
}

const Template: ComponentStory<typeof ContainerHero> = (args) => (
  <VideoProvider value={{ content: videos[1] }}>
    <ContainerHero {...args} />
  </VideoProvider>
)

export const Default = Template.bind({})
Default.args = {
  openDialog: noop
}

export default ContainerHeroStory
