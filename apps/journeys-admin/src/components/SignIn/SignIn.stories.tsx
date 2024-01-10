import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import { initializeApp } from 'firebase/app'
import noop from 'lodash/noop'
import { ComponentProps, ReactNode } from 'react'

import { journeysAdminConfig } from '../../libs/storybook'

import { EmailUsedPage } from './EmailUsedPage'
import { HelpPage } from './HelpPage'
import { PasswordPage } from './PasswordPage'
import { RegisterPage } from './RegisterPage'
import { SignIn } from './SignIn'

const SignInStory: Meta<typeof SignIn> = {
  ...journeysAdminConfig,
  component: SignIn,
  title: 'Journeys-Admin/SignIn'
}

const userEmail = 'JesusFilm@JesusFilm.com'
const setActivePage = noop

const firebaseMockConfig = {
  apiKey: 'mock-api-key',
  authDomain: 'mock-auth-domain',
  projectId: 'mock-project-id',
  storageBucket: 'mock-storage-bucket',
  messagingSenderId: 'mock-messaging-sender-id',
  appId: 'mock-app-id'
}

initializeApp(firebaseMockConfig)

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

export const Password = {
  ...Template,
  args: {
    children: (
      <PasswordPage setActivePage={setActivePage} userEmail={userEmail} />
    )
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
    children: <EmailUsedPage userEmail={userEmail} variant="Google" />
  }
}

export const Facebook = {
  ...Template,
  args: {
    children: <EmailUsedPage userEmail={userEmail} variant="Facebook" />
  }
}

export const Help = {
  ...Template,
  args: {
    children: <HelpPage setActivePage={setActivePage} userEmail={userEmail} />
  }
}

export default SignInStory
