import { Meta, StoryObj } from '@storybook/nextjs'
import noop from 'lodash/noop'

import { watchConfig } from '../../../libs/storybook'
import { VideoProvider } from '../../../libs/videoContext'
import { videos } from '../../Videos/__generated__/testData'

import { ContainerHero } from '.'

const ContainerHeroStory: Meta<typeof ContainerHero> = {
  ...watchConfig,
  component: ContainerHero,
  title: 'Watch/VideoContainerPage/ContainerHero'
}

const Template: StoryObj<typeof ContainerHero> = {
  render: (args) => (
    <VideoProvider value={{ content: videos[1] }}>
      <ContainerHero {...args} />
    </VideoProvider>
  )
}
export const Default = {
  ...Template,
  args: {
    openDialog: noop
  }
}

export default ContainerHeroStory
