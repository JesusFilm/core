import type { Meta, StoryObj } from '@storybook/react'
import { Form, Formik } from 'formik'
import { ComponentPropsWithoutRef } from 'react'
import { object, string } from 'yup'

import { videosAdminConfig } from '../../libs/storybookConfig'

import { FormTextArea } from './FormTextArea'

type StoryArgs = ComponentPropsWithoutRef<typeof FormTextArea> & {
  initialValues: object
}

const meta = {
  ...videosAdminConfig,
  title: 'Videos-Admin/Form/FormTextArea',
  component: FormTextArea,
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
        initialTouched={{ error: true }}
        validationSchema={object({
          error: string().required('Required')
        })}
        validateOnMount
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

export const Empty: Story = {
  args: {
    name: 'textarea',
    label: 'FormTextArea',
    initialValues: {
      textarea: ''
    }
  }
}

export const Filled: Story = {
  args: {
    ...Empty.args,
    initialValues: {
      textarea: 'Filled'
    }
  }
}

export const Error: Story = {
  args: {
    name: 'error',
    label: 'Error',
    initialValues: {
      error: ''
    }
  }
}

export const Helper: Story = {
  args: {
    ...Filled.args,
    helperText: 'Helper text'
  }
}
