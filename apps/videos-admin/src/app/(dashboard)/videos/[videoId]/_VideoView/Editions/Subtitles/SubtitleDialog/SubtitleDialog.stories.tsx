import { Meta, StoryObj } from '@storybook/react'
import { ComponentPropsWithoutRef } from 'react'

import { DialogAction } from '../../../../../../../../components/CrudDialog'
import { videosAdminConfig } from '../../../../../../../../libs/storybookConfig'
import { useAdminVideoMock } from '../../../../../../../../libs/useAdminVideo/useAdminVideo.mock'
import { VideoProvider } from '../../../../../../../../libs/VideoProvider'

import { SubtitleDialog } from './SubtitleDialog'

const noop = () => undefined

const mockVideo = useAdminVideoMock['result']?.['data']?.['adminVideo']
const mockEdition = mockVideo?.videoEditions?.[0]
const mockSubtitle = mockEdition?.videoSubtitles?.[0]

type StoryArgs = ComponentPropsWithoutRef<typeof SubtitleDialog>

const meta = {
  ...videosAdminConfig,
  title: 'Videos-Admin/VideoView/Subtitles/SubtitleDialog',
  component: SubtitleDialog,
  parameters: {
    tags: ['!autodocs']
  },
  decorators: [
    ...videosAdminConfig.decorators,
    (Story) => (
      <VideoProvider video={mockVideo}>
        <Story />
      </VideoProvider>
    )
  ]
} satisfies Meta<StoryArgs>

export default meta

type Story = StoryObj<typeof meta>

export const Hidden: Story = {
  args: {
    action: null,
    close: noop,
    edition: mockEdition,
    subtitle: null
  }
}

export const Create: Story = {
  args: {
    action: DialogAction.CREATE,
    close: noop,
    edition: mockEdition,
    subtitle: null
  }
}

export const Edit: Story = {
  args: {
    action: DialogAction.EDIT,
    close: noop,
    edition: mockEdition,
    subtitle: mockSubtitle
  }
}

export const Delete: Story = {
  args: {
    action: DialogAction.DELETE,
    close: noop,
    edition: mockEdition,
    subtitle: mockSubtitle
  }
}
