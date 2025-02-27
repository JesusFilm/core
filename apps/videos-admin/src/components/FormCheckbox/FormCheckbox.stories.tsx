import type { Meta, StoryObj } from '@storybook/react'
import { Form, Formik } from 'formik'
import { ComponentPropsWithoutRef } from 'react'

import { videosAdminConfig } from '../../libs/storybookConfig'

import { FormCheckbox } from './FormCheckbox'

type StoryArgs = ComponentPropsWithoutRef<typeof FormCheckbox> & {
  initialValues: { checkbox: boolean }
}

const meta = {
  ...videosAdminConfig,
  title: 'Videos-Admin/Form/FormCheckbox',
  component: FormCheckbox,
  parameters: {
    nextjs: {
      appDirectory: true
    },
    viewport: {
      defaultViewport: 'none'
    }
  },
  decorators: [
    ...videosAdminConfig.decorators,
    (Story, context) => (
      <Formik
        initialValues={context.args.initialValues}
        onSubmit={(values) => alert(JSON.stringify(values, null, 2))}
      >
        <Form>
          <Story />
        </Form>
      </Formik>
    )
  ]
} satisfies Meta<StoryArgs>

export default meta
type Story = StoryObj<typeof meta>

export const Unchecked: Story = {
  args: {
    name: 'checkbox',
    label: 'Form checkbox',
    initialValues: {
      checkbox: false
    }
  }
}

export const Checked: Story = {
  args: {
    ...Unchecked.args,
    initialValues: {
      checkbox: true
    }
  }
}
