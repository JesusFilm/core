import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/nextjs'
import { initializeApp } from 'firebase/app'
import noop from 'lodash/noop'
import { ComponentProps, ReactNode } from 'react'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { EmailUsedPage } from './EmailUsedPage'
import { PasswordPage } from './PasswordPage'
import { PasswordResetPage } from './PasswordResetPage'
import { RegisterPage } from './RegisterPage'
import { ResetPasswordSentPage } from './ResetPasswordSentPage'
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
    children: (
      <EmailUsedPage
        activePage="google.com"
        setActivePage={setActivePage}
        userEmail={userEmail}
      />
    )
  }
}

export const Facebook = {
  ...Template,
  args: {
    children: (
      <EmailUsedPage
        activePage="facebook.com"
        setActivePage={setActivePage}
        userEmail={userEmail}
      />
    )
  }
}

export const Help = {
  ...Template,
  args: {
    children: (
      <PasswordResetPage setActivePage={setActivePage} userEmail={userEmail} />
    )
  }
}

export const Reset = {
  ...Template,
  args: {
    children: (
      <ResetPasswordSentPage
        setActivePage={setActivePage}
        userEmail={userEmail}
      />
    )
  }
}

export default SignInStory
