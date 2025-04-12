import { Meta, StoryObj } from '@storybook/react'
import { ComponentPropsWithoutRef } from 'react'

import { videosAdminConfig } from '../../../../../../../libs/storybookConfig'

import { EditionForm } from './EditionForm'

type StoryArgs = ComponentPropsWithoutRef<typeof EditionForm>

const meta = {
  ...videosAdminConfig,
  title: 'Videos-Admin/VideoView/Editions/EditionForm',
  component: EditionForm,
  parameters: {
    tags: ['!autodocs']
  }
} satisfies Meta<StoryArgs>

export default meta
type Story = StoryObj<typeof meta>

export const Create: Story = {
  args: {
    variant: 'create',
    initialValues: { name: '' },
    onSubmit: () => undefined
  }
}

export const Edit: Story = {
  args: {
    variant: 'edit',
    initialValues: { name: 'base' },
    onSubmit: () => undefined
  }
}
