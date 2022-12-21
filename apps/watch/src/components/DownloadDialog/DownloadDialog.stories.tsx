import { ComponentProps } from 'react'
import { Story, Meta } from '@storybook/react'
import { userEvent, screen } from '@storybook/testing-library'
import { noop } from 'lodash'
import { VideoContentFields } from '../../../__generated__/VideoContentFields'
import { watchConfig } from '../../libs/storybook'
import { VideoProvider } from '../../libs/videoContext'
import { videos } from '../Videos/testData'
import { DownloadDialog } from './DownloadDialog'

const DownloadDialogStory = {
  ...watchConfig,
  component: DownloadDialog,
  title: 'Watch/DownloadDialog',
  parameters: {
    theme: 'light'
  }
}

const routes = ['the-story-of-jesus-for-children']

const Template: Story<
  ComponentProps<typeof DownloadDialog> & { video: VideoContentFields }
> = ({ ...args }) => {
  return (
    <VideoProvider value={{ content: args.video }}>
      <DownloadDialog {...args} />
    </VideoProvider>
  )
}

export const Default = Template.bind({})
Default.args = {
  open: true,
  onClose: noop,
  video: videos[0],
  routes
}

export const AcceptedTerms = Template.bind({})
AcceptedTerms.args = {
  ...Default.args
}
AcceptedTerms.play = () => {
  userEvent.click(screen.getByRole('checkbox'))
}

export default DownloadDialogStory as Meta
