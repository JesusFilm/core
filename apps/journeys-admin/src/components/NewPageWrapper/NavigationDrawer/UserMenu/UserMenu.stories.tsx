import { MockedProvider } from '@apollo/client/testing'
import { Meta, Story } from '@storybook/react'
import noop from 'lodash/noop'
import { useState } from 'react'

import { simpleComponentConfig } from '../../../../libs/storybook'

import { UserMenuProps } from './UserMenu'

import { UserMenu } from '.'

const UserMenuStory = {
  ...simpleComponentConfig,
  component: UserMenu,
  title: 'Journeys-Admin/PageWrapper/NavigationDrawer/UserMenu'
}

const Template: Story<UserMenuProps> = ({ ...args }) => {
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

export const Default = Template.bind({})
Default.args = {
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

export default UserMenuStory as Meta
