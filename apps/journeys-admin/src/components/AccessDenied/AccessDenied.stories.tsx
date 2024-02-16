import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'

import { simpleComponentConfig } from '../../libs/storybook'

import { AccessDenied } from '.'

const AccessDeniedStrory: Meta<typeof AccessDenied> = {
  ...simpleComponentConfig,
  component: AccessDenied,
  title: 'Journeys-Admin/AccessDenied'
}

const Template: StoryObj = {
  render: () => (
    <MockedProvider>
      <AccessDenied />
    </MockedProvider>
  )
}

export const Default = {
  ...Template
}

export default AccessDeniedStrory
