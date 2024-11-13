import type { Meta, StoryObj } from '@storybook/react'
import { Form, Formik } from 'formik'
import { ComponentPropsWithoutRef } from 'react'
import { object, string } from 'yup'

import { videosAdminConfig } from '../../libs/storybookConfig'

import { FormSelect } from './FormSelect'

type StoryArgs = ComponentPropsWithoutRef<typeof FormSelect> & {
  initialValues: object
}

const meta = {
  ...videosAdminConfig,
  title: 'Videos-Admin/Form/FormSelect',
  component: FormSelect,
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
    name: 'select',
    label: 'Form select',
    options: [
      { label: 'Frodo', value: 'frodo' },
      { label: 'Sam', value: 'sam' },
      { label: 'Mary', value: 'mary' },
      { label: 'Pippin', value: 'pippin' }
    ],
    initialValues: {
      select: ''
    }
  }
}

export const Filled: Story = {
  args: {
    ...Empty.args,
    initialValues: {
      select: 'frodo'
    }
  }
}

export const Helper: Story = {
  args: {
    ...Filled.args,
    helperText: 'Members of the Fellowship'
  }
}

export const Error: Story = {
  args: {
    ...Empty.args,
    name: 'error'
  }
}
