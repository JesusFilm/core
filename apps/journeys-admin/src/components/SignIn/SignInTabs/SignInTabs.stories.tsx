import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { simpleComponentConfig } from '../../../libs/storybook'

import { SignInTabs } from './SignInTabs'

const SignInTabsStory: Meta<typeof SignInTabs> = {
  ...simpleComponentConfig,
  component: SignInTabs,
  title: 'Journeys-Admin/SignIn/SignInTabs'
}

const Template: StoryObj<ComponentProps<typeof SignInTabs>> = {
  render: () => {
    return <SignInTabs />
  }
}

export const Default = {
  ...Template
}

export default SignInTabsStory
