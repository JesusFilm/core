import { MockedProvider } from '@apollo/client/testing'
import IconButton from '@mui/material/IconButton'
import { Meta, Story } from '@storybook/react'
import noop from 'lodash/noop'

import Menu1 from '@core/shared/ui/icons/Menu1'

import { Role } from '../../../__generated__/globalTypes'
import { journeysAdminConfig } from '../../libs/storybook'
import { GET_USER_ROLE } from '../JourneyView/JourneyView'
import { GET_ME } from '../NewPageWrapper/NavigationDrawer'

import { PageWrapperProps } from './PageWrapper'

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
    <PageWrapper {...(args.props as unknown as PageWrapperProps)} />
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
        <Menu1 />
      </IconButton>
    )
  }
}

export default PageWrapperStory as Meta
