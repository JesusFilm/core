import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { Meta, StoryObj } from '@storybook/nextjs'

import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { Avatar } from '.'

const AvatarDemo: Meta<typeof Avatar> = {
  ...simpleComponentConfig,
  component: Avatar,
  title: 'Journeys-Admin/Avatar'
}

const Template: StoryObj<typeof Avatar> = {
  render: ({ ...args }) => (
    <Paper elevation={0} sx={{ p: 2 }}>
      <Stack direction="row" gap={2}>
        <Avatar {...args} />
        <Avatar
          {...args}
          apiUser={{
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
}

export const Default = {
  ...Template,
  args: {
    apiUser: {
      __typename: 'User',
      id: '1',
      firstName: 'Person',
      lastName: 'One',
      imageUrl: 'https://bit.ly/3Gth4Yf'
    }
  }
}

export const Notifications = {
  ...Template,
  args: {
    apiUser: {
      __typename: 'User',
      id: '3',
      firstName: 'Person',
      lastName: 'Three',
      imageUrl: 'https://bit.ly/3Gth4Yf'
    },
    notification: true
  }
}

export default AvatarDemo
