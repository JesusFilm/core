import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import noop from 'lodash/noop'
import { ReactElement, useState } from 'react'

import { simpleComponentConfig } from '../../../../libs/storybook'

import { UserMenu } from '.'

const UserMenuStory: Meta<typeof UserMenu> = {
  ...simpleComponentConfig,
  component: UserMenu,
  title: 'Journeys-Admin/NewPageWrapper/NavigationDrawer/UserMenu'
}

const UserMenuComponent = (args): ReactElement => {
  const [open, setOpen] = useState(true)

  return (
    <MockedProvider>
      <UserMenu
        {...args}
        profileOpen={open}
        profileAnchorEl={null}
        handleProfileClose={() => setOpen(!open)}
      />
    </MockedProvider>
  )
}

const Template: StoryObj<typeof UserMenu> = {
  render: ({ ...args }) => <UserMenuComponent {...args} />
}

export const Default = {
  ...Template,
  args: {
    user: {
      __typename: 'User',
      id: 'userId',
      firstName: 'Amin',
      lastName: 'One',
      imageUrl: 'https://bit.ly/3Gth4Yf',
      email: 'amin@email.com'
    },
    authUser: {
      displayName: 'Amin One',
      photoURL: 'https://bit.ly/3Gth4Yf',
      email: 'amin@email.com',
      signOut: noop
    }
  }
}

export default UserMenuStory
