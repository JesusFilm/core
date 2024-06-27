import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { ApiTokenTextField } from '.'

const ApiTokenTextFieldDemo: Meta<typeof ApiTokenTextField> = {
  ...simpleComponentConfig,
  component: ApiTokenTextField,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/Properties/blocks/Form/Credentials/ApiTokenTextField'
}

const Template: StoryObj<ComponentProps<typeof ApiTokenTextField>> = {
  render: ({ ...args }) => (
    <MockedProvider>
      <ApiTokenTextField {...args} />
    </MockedProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    id: 'id',
    apiTokenExists: false,
    loading: false
  }
}

export const Filled = {
  ...Template,
  args: {
    id: 'id',
    apiTokenExists: true,
    loading: false
  }
}

export const Loading = {
  ...Template,
  args: {
    id: 'id',
    loading: true
  }
}

export default ApiTokenTextFieldDemo
