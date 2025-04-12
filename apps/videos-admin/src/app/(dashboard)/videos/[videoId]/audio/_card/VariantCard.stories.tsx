import type { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { videosAdminConfig } from '../../../../../../libs/storybookConfig'
import { GetAdminVideoVariant as VideoVariant } from '../../../../../../libs/useAdminVideo'
import { useAdminVideoMock } from '../../../../../../libs/useAdminVideo/useAdminVideo.mock'

import { VariantCard } from './VariantCard'

const meta: Meta<typeof VariantCard> = {
  ...videosAdminConfig,
  component: VariantCard,
  title: 'Videos-Admin/Variants/VariantCard',
  parameters: {
    tags: ['!autodocs']
  }
}

const mockVideoVariant: VideoVariant =
  useAdminVideoMock['result']?.['data']?.['adminVideo']?.['variants'][0]

type Story = StoryObj<ComponentProps<typeof VariantCard>>

const Template: Story = {
  render: (args) => <VariantCard {...args} />
}

export const Default = {
  ...Template,
  args: {
    key: 1,
    variant: mockVideoVariant
  }
}

export default meta
