import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import noop from 'lodash/noop'
import { ComponentProps, ReactNode } from 'react'

import { journeysAdminConfig } from '../../libs/storybook'

import { FacebookPage } from './FacebookPage'
import { GooglePage } from './GooglePage'
import { HelpPage } from './HelpPage'
import { RegisterPage } from './RegisterPage'
import { SignIn } from './SignIn'

const SignInStory: Meta<typeof SignIn> = {
  ...journeysAdminConfig,
  component: SignIn,
  title: 'Journeys-Admin/SignIn'
}

const userEmail = 'JesusFilm@JesusFilm.com'
const setActivePage = noop

const Template: StoryObj<
  ComponentProps<typeof SignIn> & { children: ReactNode }
> = {
  render: (args) => {
    return <MockedProvider>{args.children}</MockedProvider>
  }
}

export const Default = {
  ...Template,
  args: {
    children: <SignIn />
  }
}

export const Register = {
  ...Template,
  args: {
    children: (
      <RegisterPage setActivePage={setActivePage} userEmail={userEmail} />
    )
  }
}

export const Google = {
  ...Template,
  args: {
    children: <GooglePage setActivePage={setActivePage} userEmail={userEmail} />
  }
}

export const Facebook = {
  ...Template,
  args: {
    children: (
      <FacebookPage setActivePage={setActivePage} userEmail={userEmail} />
    )
  }
}

export const Help = {
  ...Template,
  args: {
    children: <HelpPage setActivePage={setActivePage} userEmail={userEmail} />
  }
}

export default SignInStory
