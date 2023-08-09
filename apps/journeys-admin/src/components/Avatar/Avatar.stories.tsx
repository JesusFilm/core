import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { Meta, Story } from '@storybook/react'

import { simpleComponentConfig } from '../../libs/storybook'

import { Avatar, AvatarProps } from '.'

const AvatarDemo = {
  ...simpleComponentConfig,
  component: Avatar,
  title: 'Journeys-Admin/Avatar'
}

const Template: Story<AvatarProps> = ({ ...args }) => (
  <Paper elevation={0} sx={{ p: 2 }}>
    <Stack direction="row" gap={2}>
      <Avatar {...args} />
      <Avatar
        {...args}
        user={{
          __typename: 'User',
          id: '2',
          firstName: 'Person',
          lastName: 'Two',
          imageUrl: null
        }}
      />
    </Stack>
  </Paper>
)

export const Default = Template.bind({})
Default.args = {
  user: {
    __typename: 'User',
    id: '1',
    firstName: 'Person',
    lastName: 'One',
    imageUrl: 'https://bit.ly/3Gth4Yf'
  }
}

export const Notifications = Template.bind({})
Notifications.args = {
  user: {
    __typename: 'User',
    id: '3',
    firstName: 'Person',
    lastName: 'Three',
    imageUrl: 'https://bit.ly/3Gth4Yf'
  },
  notification: true
}

export default AvatarDemo as Meta
