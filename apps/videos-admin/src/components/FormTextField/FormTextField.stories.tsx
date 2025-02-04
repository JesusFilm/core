import type { Meta, StoryObj } from '@storybook/react'
import { Form, Formik } from 'formik'
import { ComponentPropsWithoutRef } from 'react'
import { object, string } from 'yup'

import { videosAdminConfig } from '../../libs/storybookConfig'

import { FormTextField } from './FormTextField'

type StoryArgs = ComponentPropsWithoutRef<typeof FormTextField> & {
  initialValues: object
}
const meta = {
  ...videosAdminConfig,
  title: 'Videos-Admin/Form/FormTextField',
  component: FormTextField,
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
    name: 'textfield',
    label: 'FormTextField',
    initialValues: {
      textfield: ''
    }
  }
}

export const Filled: Story = {
  args: {
    ...Empty.args,
    initialValues: {
      textfield: 'Filled'
    }
  }
}

export const Disabled: Story = {
  args: {
    ...Filled.args,
    disabled: true,
    initialValues: {
      textfield: 'Disabled'
    }
  }
}

export const Error: Story = {
  args: {
    ...Empty.args,
    name: 'error'
  }
}
