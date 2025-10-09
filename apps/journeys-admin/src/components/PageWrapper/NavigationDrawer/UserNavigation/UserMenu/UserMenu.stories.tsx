import { Meta, StoryObj } from '@storybook/nextjs'
import noop from 'lodash/noop'
import { ReactElement, useState } from 'react'

import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { UserMenu } from '.'

const UserMenuStory: Meta<typeof UserMenu> = {
  ...simpleComponentConfig,
  component: UserMenu,
  title: 'Journeys-Admin/PageWrapper/NavigationDrawer/UserNavigation/UserMenu'
}

const UserMenuComponent = (args): ReactElement => {
  const [open, setOpen] = useState(true)

  return (
    <UserMenu
      {...args}
      profileOpen={open}
      profileAnchorEl={null}
      handleProfileClose={() => setOpen(!open)}
    />
  )
}

const Template: StoryObj<typeof UserMenu> = {
  render: ({ ...args }) => <UserMenuComponent {...args} />
}

export const Default = {
  ...Template,
  args: {
    apiUser: {
      __typename: 'User',
      id: 'userId',
      firstName: 'Amin',
      lastName: 'One',
      imageUrl: 'https://bit.ly/3Gth4Yf',
      email: 'amin@email.com',
      superAdmin: false
    },
    user: {
      displayName: 'Amin One',
      photoURL: 'https://bit.ly/3Gth4Yf',
      email: 'amin@email.com',
      signOut: noop
    }
  }
}

export default UserMenuStory
