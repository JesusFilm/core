import { Meta, StoryObj } from '@storybook/react'
import { ComponentPropsWithoutRef } from 'react'

import { videosAdminConfig } from '../../../../../../../libs/storybookConfig'
import { GetAdminVideo_AdminVideo as AdminVideo } from '../../../../../../../libs/useAdminVideo'
import { useAdminVideoMock } from '../../../../../../../libs/useAdminVideo/useAdminVideo.mock'
import { VideoProvider } from '../../../../../../../libs/VideoProvider'

import { Editions } from './Editions'

const mockVideo = useAdminVideoMock['result']?.['data']?.['adminVideo']
const mockEditions = mockVideo?.['videoEditions']

type StoryArgs = ComponentPropsWithoutRef<typeof Editions> & {
  video: AdminVideo
}

const meta = {
  ...videosAdminConfig,
  title: 'Videos-Admin/Editions',
  component: Editions,
  parameters: {
    tags: ['!autodocs']
  },
  decorators: [
    ...videosAdminConfig.decorators,
    (Story, context) => (
      <VideoProvider video={context.args.video}>
        <Story />
      </VideoProvider>
    )
  ]
} satisfies Meta<StoryArgs>

export default meta

type Story = StoryObj<typeof meta>

export const Empty: Story = {
  args: {
    editions: [],
    video: mockVideo
  }
}

export const Filled: Story = {
  args: {
    editions: mockEditions,
    video: mockVideo
  }
}
