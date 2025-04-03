import { Meta, StoryObj } from '@storybook/react'
import { ComponentPropsWithoutRef } from 'react'

import { DialogAction } from '../../../../../../../../components/CrudDialog'
import { videosAdminConfig } from '../../../../../../../../libs/storybookConfig'
import { useAdminVideoMock } from '../../../../../../../../libs/useAdminVideo/useAdminVideo.mock'
import { VideoProvider } from '../../../../../../../../libs/VideoProvider'

import { EditionDialog } from './EditionDialog'

const mockVideo = useAdminVideoMock['result']?.['data']?.['adminVideo']
const mockEdition = mockVideo?.videoEditions?.[0]

const noop = () => undefined

type StoryArgs = ComponentPropsWithoutRef<typeof EditionDialog>

const meta = {
  ...videosAdminConfig,
  title: 'Videos-Admin/VideoView/Editions/EditionDialog',
  component: EditionDialog,
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
    edition: null
  }
}

export const View: Story = {
  args: {
    action: DialogAction.VIEW,
    close: noop,
    edition: mockEdition
  }
}

export const Create: Story = {
  args: {
    action: DialogAction.CREATE,
    close: noop,
    edition: null
  }
}

export const Edit: Story = {
  args: {
    action: DialogAction.EDIT,
    close: noop,
    edition: mockEdition
  }
}

export const Delete: Story = {
  args: {
    action: DialogAction.DELETE,
    close: noop,
    edition: mockEdition
  }
}
