import { Meta, StoryObj } from '@storybook/react'

import { simpleComponentConfig } from '../../../../../../../libs/storybook'

import { Credentials } from '.'

const CredentialsDemo: Meta<typeof Credentials> = {
  ...simpleComponentConfig,
  component: Credentials,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Form/Credentials'
}

const Template: StoryObj = {
  render: () => <Credentials />
}

export const Default = {
  ...Template
}

export default CredentialsDemo
