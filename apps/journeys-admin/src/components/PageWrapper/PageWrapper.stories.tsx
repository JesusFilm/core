import { Meta, Story } from '@storybook/react'
import IconButton from '@mui/material/IconButton'
import MenuRounded from '@mui/icons-material/MenuRounded'
import { noop } from 'lodash'
import { MockedProvider } from '@apollo/client/testing'
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

const Template: Story<PageWrapperProps> = ({ ...args }) => (
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
    <PageWrapper {...args} />
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = { title: 'Journeys' }

export const Complete = Template.bind({})
Complete.args = {
  backHref: '/',
  showDrawer: true,
  title: 'Journey Details',
  AuthUser: {
    displayName: 'Amin One',
    photoURL: 'https://bit.ly/3Gth4Yf',
    email: 'amin@email.com',
    signOut: noop
  },
  Menu: (
    <IconButton edge="end" size="large" color="inherit" sx={{ ml: 2 }}>
      <MenuRounded />
    </IconButton>
  )
}

export default PageWrapperStory as Meta
