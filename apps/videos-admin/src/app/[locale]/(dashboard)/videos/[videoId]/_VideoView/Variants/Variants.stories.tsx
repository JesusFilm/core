import type { Meta, StoryObj } from '@storybook/react'
import { screen, userEvent } from '@storybook/test'
import { NextIntlClientProvider } from 'next-intl'
import { ComponentProps } from 'react'

import { videosAdminConfig } from '../../../../../../../libs/storybookConfig'
import { GetAdminVideoVariant as VideoVariants } from '../../../../../../../libs/useAdminVideo'
import { useAdminVideoMock } from '../../../../../../../libs/useAdminVideo/useAdminVideo.mock'
import { EditProvider, EditState } from '../../_EditProvider'

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

type Story = StoryObj<
  ComponentProps<typeof Variants> & { state: Partial<EditState> }
>

const Template: Story = {
  render: ({ state, variants }) => (
    <NextIntlClientProvider locale="en">
      <EditProvider initialState={state}>
        <Variants variants={variants} />
      </EditProvider>
    </NextIntlClientProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    state: {
      isEdit: false
    },
    variants: mockVideoVariants
  }
}

export const ModalOpened = {
  ...Template,
  args: {
    state: {
      isEdit: false
    },
    variants: mockVideoVariants
  },
  play: async () => {
    await userEvent.click(
      screen.getByRole('button', { name: 'Munukutuba jesus/munukutuba' })
    )
  }
}

export default meta
