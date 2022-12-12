import { ComponentStory, Meta } from '@storybook/react'
import { noop } from 'lodash'
import { watchConfig } from '../../../libs/storybook'
import { VideoProvider } from '../../../libs/videoContext'
import { videos } from '../../Videos/testData'
import { ContainerHero } from '.'

const ContainerHeroStory = {
  ...watchConfig,
  component: ContainerHero,
  title: 'Watch/VideoContainerPage/ContainerHero'
}

const Template: ComponentStory<typeof ContainerHero> = ({ ...args }) => (
  <VideoProvider value={{ content: videos[1] }}>
    <ContainerHero openDialog={noop} />
  </VideoProvider>
)

export const Default = Template.bind({})
Default.args = {
  content: videos[1]
}

export default ContainerHeroStory as Meta
