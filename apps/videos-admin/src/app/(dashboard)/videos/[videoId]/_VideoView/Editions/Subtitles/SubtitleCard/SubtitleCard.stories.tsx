import { Meta, StoryObj } from '@storybook/react'
import { ComponentPropsWithoutRef } from 'react'

import { videosAdminConfig } from '../../../../../../../../../libs/storybookConfig'
import { useAdminVideoMock } from '../../../../../../../../../libs/useAdminVideo/useAdminVideo.mock'

import { SubtitleCard } from './SubtitleCard'

const noop = () => undefined

const mockPrimarySubtitle =
  useAdminVideoMock['result']?.['data']?.['adminVideo'].videoEditions[0]
    .videoSubtitles[0]
const mockSecondarySubtitle =
  useAdminVideoMock['result']?.['data']?.['adminVideo'].videoEditions[0]
    .videoSubtitles[1]

type StoryArgs = ComponentPropsWithoutRef<typeof SubtitleCard>

const meta = {
  ...videosAdminConfig,
  title: 'Videos-Admin/VideoView/Subtitles/SubtitleCard',
  component: SubtitleCard,
  parameters: {
    tags: ['!autodocs']
  }
} satisfies Meta<StoryArgs>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    subtitle: mockSecondarySubtitle,
    onClick: noop,
    actions: {
      view: noop,
      edit: noop,
      delete: noop
    }
  }
}

export const Primary: Story = {
  args: {
    subtitle: mockPrimarySubtitle,
    onClick: noop,
    actions: {
      view: noop,
      edit: noop,
      delete: noop
    }
  }
}
