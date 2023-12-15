import { MockedProvider } from '@apollo/client/testing'
import {
  FormElementType,
  FormStatus,
  FormSubmitLayout,
  Form as FormType,
  FormValidate
} from '@formium/types'
import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { journeyUiConfig } from '../../libs/journeyUiConfig'
import { StoryCard } from '../StoryCard'

import { Form } from '.'

const FormDemo: Meta<typeof Form> = {
  ...journeyUiConfig,
  component: Form,
  title: 'Journeys-Ui/Form',
  parameters: {
    docs: {
      source: { type: 'code' }
    }
  }
}

const Template: StoryObj<ComponentProps<typeof Form>> = {
  render: ({ ...args }) => (
    <MockedProvider>
      <StoryCard>
        <Form {...args} />
      </StoryCard>
    </MockedProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    id: 'id',
    form: null,
    action: null
  }
}

const form: FormType = {
  actionIds: [],
  createAt: '2023-10-09T02:59:18.299Z',
  createId: '65076cdeaa22460001b3d3ea',
  customerId: '65076cedaa22460001b3d3ec',
  id: '65236c864f0b2e0001233fed',
  keys: [],
  name: 'single-page-test',
  previewUrl: 'https://previewurl.com',
  projectId: '65076cedaa22460001b3d3ed',
  schema: {
    fields: {
      'qgdEnz3-l': {
        actions: [],
        dynamic: false,
        hidden: false,
        id: 'qgdEnz3-l',
        items: ['_SmxT8v1Ur'],
        slug: '____',
        title: 'single-page-test',
        type: FormElementType.PAGE
      },
      _SmxT8v1Ur: {
        actions: [],
        dynamic: false,
        hidden: false,
        id: '_SmxT8v1Ur',
        items: [],
        slug: 'field',
        title: 'field',
        type: FormElementType.SHORT_TEXT
      }
    },
    pageIds: ['qgdEnz3-l']
  },
  status: FormStatus.ACTIVE,
  slug: 'single-page-test',
  submitCount: 0,
  submitLayout: FormSubmitLayout.LIST,
  updateAt: '2023-10-09T02:59:38.335Z',
  updateId: '65236c9a4f0b2e0001233fee',
  validate: FormValidate.ANY
}

export const Filled = {
  ...Template,
  args: {
    id: 'id',
    form,
    action: null
  }
}

export default FormDemo
