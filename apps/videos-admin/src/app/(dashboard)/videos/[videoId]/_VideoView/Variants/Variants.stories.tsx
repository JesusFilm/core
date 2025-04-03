import type { Meta, StoryObj } from '@storybook/react'
import { screen, userEvent } from '@storybook/test'
import { ComponentProps } from 'react'

import { videosAdminConfig } from '../../../../../../libs/storybookConfig'
import { GetAdminVideoVariant as VideoVariants } from '../../../../../../libs/useAdminVideo'
import { useAdminVideoMock } from '../../../../../../libs/useAdminVideo/useAdminVideo.mock'

import { Variants } from './Variants'

const meta: Meta<typeof Variants> = {
  ...videosAdminConfig,
  component: Variants,
  title: 'Videos-Admin/Variants',
  parameters: {
    ...videosAdminConfig.parameters,
    tags: ['!autodocs']
  }
}

const mockVideoVariants: VideoVariants[] =
  useAdminVideoMock['result']?.['data']?.['adminVideo']?.['variants']

type Story = StoryObj<ComponentProps<typeof Variants>>

const Template: Story = {
  render: ({ variants }) => (
    
      <Variants variants={variants} />
    
  )
}

export const Default = {
  ...Template,
  args: {
    variants: mockVideoVariants
  }
}

export const ModalOpened = {
  ...Template,
  args: {
    variants: mockVideoVariants
  },
  play: async () => {
    await userEvent.click(
      screen.getByRole('button', { name: 'Munukutuba jesus/munukutuba' })
    )
  }
}

export default meta
