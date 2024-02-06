import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { simpleComponentConfig } from '../../../../../../../../libs/storybook'

import { FormSlugSelect } from '.'

const FormSlugSelectDemo: Meta<typeof FormSlugSelect> = {
  ...simpleComponentConfig,
  component: FormSlugSelect,
  title:
    'Journeys-Admin/Editor/ControlPanel/Attributes/Form/Credentials/FormSlugSelect'
}

const Template: StoryObj<ComponentProps<typeof FormSlugSelect>> = {
  render: ({ ...args }) => (
    <MockedProvider>
      <FormSlugSelect {...args} />
    </MockedProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    id: 'id',
    currentFormSlug: null,
    forms: [],
    loading: false
  }
}

export const Filled = {
  ...Template,
  args: {
    id: 'id',
    currentFormSlug: 'formSlug',
    forms: [{ __typename: 'FormiumForm', slug: 'formSlug', name: 'form name' }],
    loading: false
  }
}

export const Loading = {
  ...Template,
  args: {
    id: 'id',
    currentFormSlug: null,
    forms: [],
    loading: true
  }
}

export default FormSlugSelectDemo
