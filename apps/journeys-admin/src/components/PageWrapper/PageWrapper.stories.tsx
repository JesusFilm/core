import { Meta, Story } from '@storybook/react'
import IconButton from '@mui/material/IconButton'
import MenuRounded from '@mui/icons-material/MenuRounded'
import { noop } from 'lodash'
import { MockedProvider } from '@apollo/client/testing'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import { journeysAdminConfig } from '../../libs/storybook'
import { Role } from '../../../__generated__/globalTypes'
import { GET_USER_ROLE } from '../JourneyView/JourneyView'
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
      },
      {
        request: {
          query: GET_USER_ROLE
        },
        result: {
          data: {
            getUserRole: {
              id: 'userId',
              roles: [Role.publisher]
            }
          }
        }
      }
    ]}
  >
    <FlagsProvider flags={{ templates: args.templates }}>
      <PageWrapper {...(args.props as unknown as PageWrapperProps)} />
    </FlagsProvider>
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  props: { title: 'Active Journeys' }
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
  templates: true
}

export default PageWrapperStory as Meta
