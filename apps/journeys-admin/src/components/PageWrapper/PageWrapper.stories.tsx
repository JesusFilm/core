import { Meta, Story } from '@storybook/react'
import IconButton from '@mui/material/IconButton'
import MenuRounded from '@mui/icons-material/MenuRounded'
import { noop } from 'lodash'
import { MockedProvider } from '@apollo/client/testing'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import { journeysAdminConfig } from '../../libs/storybook'
import { PageWrapperProps } from './PageWrapper'
import { GET_ME } from './NavigationDrawer/NavigationDrawer'
import { PageWrapper } from '.'

const PageWrapperStory = {
  ...journeysAdminConfig,
  component: PageWrapper,
  title: 'Journeys-Admin/PageWrapper',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: Story = ({ ...args }) => (
  <MockedProvider
    mocks={[
      {
        request: {
          query: GET_ME
        },
        result: {
          data: {
            me: {
              id: 'userId',
              firstName: 'Test',
              lastName: 'User',
              imageUrl: 'https://bit.ly/3Gth4Yf',
              email: 'amin@email.com'
            }
          }
        }
      }
    ]}
  >
    <FlagsProvider flags={{ analytics: args.analytics }}>
      <PageWrapper {...(args.props as unknown as PageWrapperProps)} />
    </FlagsProvider>
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  props: { title: 'Active Journeys' },
  analytics: true
}

export const Analytics = Template.bind({})
Analytics.args = {
  props: { title: 'Analytics' },
  analytics: true
}

export const AnalyticsOff = Template.bind({})
AnalyticsOff.args = {
  props: { title: 'Journeys' },
  analytics: false
}

export const Complete = Template.bind({})
Complete.args = {
  props: {
    backHref: '/',
    showDrawer: true,
    title: 'Journey Details',
    authUser: {
      displayName: 'Amin One',
      photoURL: 'https://bit.ly/3Gth4Yf',
      email: 'amin@email.com',
      signOut: noop
    },
    menu: (
      <IconButton edge="end" size="large" color="inherit" sx={{ ml: 2 }}>
        <MenuRounded />
      </IconButton>
    )
  },
  analytics: true
}

export default PageWrapperStory as Meta
