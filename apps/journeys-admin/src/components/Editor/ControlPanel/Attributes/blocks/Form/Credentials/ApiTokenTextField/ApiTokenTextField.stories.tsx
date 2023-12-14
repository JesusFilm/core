import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { simpleComponentConfig } from '../../../../../../../../libs/storybook'

import { ApiTokenTextField } from '.'

const ApiTokenTextFieldDemo: Meta<typeof ApiTokenTextField> = {
  ...simpleComponentConfig,
  component: ApiTokenTextField,
  title:
    'Journeys-Admin/Editor/ControlPanel/Attributes/Form/Credentials/ApiTokenTextField'
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
    id: 'id'
  }
}

export default ApiTokenTextFieldDemo
