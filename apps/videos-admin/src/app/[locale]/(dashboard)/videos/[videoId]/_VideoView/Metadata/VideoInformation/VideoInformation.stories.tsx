import type { Meta, StoryObj } from '@storybook/react'
import { screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { ComponentProps } from 'react'

import { VideoInformation } from './VideoInfomation'
import { videosAdminConfig } from '../../../../../../../../libs/storybookConfig'
import { useAdminVideoMock } from '../../../../../../../../libs/useAdminVideo/useAdminVideo.mock'
import { fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fn } from '@storybook/test'
import { useParams } from 'next/navigation'
import { EditProvider } from '../../../_EditProvider'

const meta: Meta<typeof VideoInformation> = {
  ...videosAdminConfig,
  component: VideoInformation,
  title: 'Videos-Admin/VideoInformation'
}

export const mockuseParams = fn(useParams).mockName('useParams')

type Story = StoryObj<ComponentProps<typeof VideoInformation>>

const Template: Story = {
  async beforeEach() {
    // 👇 Set the return value for the getUserFromSession function
    mockuseParams.mockReturnValue({ videoId: 'someId' })
  },

  render: ({ isEdit }) => (
    <NextIntlClientProvider locale="en">
      <EditProvider>
        <VideoInformation />
      </EditProvider>
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
