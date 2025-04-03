import type { Meta, StoryObj } from '@storybook/react'
import { NextIntlClientProvider } from 'next-intl'
import { ComponentProps } from 'react'

import { videosAdminConfig } from '../../../../../../../libs/storybookConfig'
import { GetAdminVideoVariant as VideoVariant } from '../../../../../../../libs/useAdminVideo'
import { useAdminVideoMock } from '../../../../../../../libs/useAdminVideo/useAdminVideo.mock'

import { VariantDialog } from './VariantDialog'

const meta: Meta<typeof VariantDialog> = {
  ...videosAdminConfig,
  component: VariantDialog,
  title: 'Videos-Admin/Variants/VariantCard/VariantDialog',
  parameters: {
    tags: ['!autodocs']
  }
}

const mockVideoVariant: VideoVariant =
  useAdminVideoMock['result']?.['data']?.['adminVideo']?.['variants'][0]

type Story = StoryObj<ComponentProps<typeof VariantDialog>>

const Template: Story = {
  render: (args) => (
    <NextIntlClientProvider locale="en">
      <VariantDialog {...args} />
    </NextIntlClientProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    variant: mockVideoVariant,
    open: true
  }
}

export default meta
