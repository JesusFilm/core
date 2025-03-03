import { ComponentPropsWithoutRef } from 'react'
import { ActionButton } from './ActionButton'
import { videosAdminConfig } from '../../libs/storybookConfig'
import { Meta, StoryObj } from '@storybook/react'

const noop = () => undefined

type StoryArgs = ComponentPropsWithoutRef<typeof ActionButton>

const meta = {
  ...videosAdminConfig,
  title: 'Videos-Admin/ActionButton',
  component: ActionButton,
  parameters: {
    tags: ['autodocs']
  }
} satisfies Meta<StoryArgs>

export default meta

type Story = StoryObj<typeof meta>

export const WithoutActions: Story = {
  args: {
    actions: {}
  }
}

export const WithActions: Story = {
  args: {
    actions: {
      view: noop,
      edit: noop,
      delete: noop
    }
  }
}
