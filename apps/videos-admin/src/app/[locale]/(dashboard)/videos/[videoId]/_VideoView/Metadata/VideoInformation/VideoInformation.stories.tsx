import type { Meta, StoryObj } from '@storybook/react'
import { screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { ComponentProps } from 'react'

import { VideoInformation } from './VideoInfomation'
import { videosAdminConfig } from '../../../../../../../../libs/storybookConfig'
import { useAdminVideoMock } from '../../../../../../../../libs/useAdminVideo/useAdminVideo.mock'
import { fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const meta: Meta<typeof VideoInformation> = {
  ...videosAdminConfig,
  component: VideoInformation,
  title: 'Videos-Admin/VideoInformation'
}

type Story = StoryObj<ComponentProps<typeof VideoInformation>>

const Template: Story = {
  render: ({ isEdit }) => (
    <NextIntlClientProvider locale="en">
      <VideoInformation isEdit={isEdit} />
    </NextIntlClientProvider>
  )
}

export const Default = {
  ...Template,
  args: { isEdit: false },
  parameters: {
    apolloClient: {
      mocks: [useAdminVideoMock]
    }
  }
}

export const Edit = {
  ...Template,
  args: { isEdit: true },
  parameters: {
    apolloClient: {
      mocks: [useAdminVideoMock]
    }
  }
}

export const Required = {
  ...Template,
  args: { isEdit: true },
  parameters: {
    apolloClient: {
      mocks: [useAdminVideoMock]
    }
  },
  play: async () => {
    await userEvent.click(screen.getByRole('checkbox', { name: 'No Index' }))
  }
}

export default meta
