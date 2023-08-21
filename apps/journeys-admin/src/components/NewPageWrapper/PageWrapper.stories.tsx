import { MockedProvider } from '@apollo/client/testing'
import MenuRounded from '@mui/icons-material/MenuRounded'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import ListItemButton from '@mui/material/ListItemButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Meta, Story } from '@storybook/react'
import noop from 'lodash/noop'
import { ComponentProps, ReactElement } from 'react'

import { Role } from '../../../__generated__/globalTypes'
import { journeysAdminConfig } from '../../libs/storybook'
import { GET_USER_ROLE } from '../JourneyView/JourneyView'

import { GET_ME } from './NavigationDrawer'
import { SidePanelContainer } from './SidePanelContainer'

import { PageWrapper } from '.'

const PageWrapperStory = {
  ...journeysAdminConfig,
  component: PageWrapper,
  title: 'Journeys-Admin/NewPageWrapper',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const SidePanelContainers = (): ReactElement => (
  <>
    {[0, 1, 2, 3, 4, 5].map((index) =>
      index === 3 ? (
        <>
          <SidePanelContainer border={false} key={index}>
            <Typography sx={{ backgroundColor: 'background.default' }}>
              Side Panel Content with no border SidePanelContainer
            </Typography>
          </SidePanelContainer>
          <ListItemButton sx={{ backgroundColor: 'background.default', px: 6 }}>
            Component which does not need padding
          </ListItemButton>
        </>
      ) : (
        <SidePanelContainer key={index}>
          <Typography
            sx={{ backgroundColor: 'background.default' }}
            variant="body2"
          >
            Side Panel Content wrapped with default SidePanelContainer
          </Typography>
        </SidePanelContainer>
      )
    )}
  </>
)

const Template: Story<ComponentProps<typeof PageWrapper>> = ({ ...args }) => {
  return (
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
      <PageWrapper {...args} />
    </MockedProvider>
  )
}

export const Default = Template.bind({})
Default.args = {
  title: 'Main Content',
  children: (
    <>
      <Typography
        variant="h3"
        sx={{ backgroundColor: 'background.default' }}
        gutterBottom
      >
        Main Body Content
      </Typography>
      <Typography sx={{ backgroundColor: 'background.default' }}>
        Pass children directly via fragments or wrap in some other layout
        component
      </Typography>

      <Typography sx={{ backgroundColor: 'background.default' }}>
        The main body content background sometimes is grey, other times is
        white.
      </Typography>
    </>
  )
}

export const SidePanel = Template.bind({})
SidePanel.args = {
  title: (
    <Stack direction="row" alignItems="center">
      Main Content
      <Typography variant="caption" sx={{ pl: 4 }}>
        custom content
      </Typography>
    </Stack>
  ),
  children: (
    <>
      <Typography variant="h3" gutterBottom>
        Main Body Content
      </Typography>
      <Paper sx={{ width: '70%', height: '1000px', p: 4 }}>
        <Typography gutterBottom>
          This content is long to test scroll
        </Typography>
      </Paper>
    </>
  ),
  sidePanelTitle: (
    <>
      Side Panel Content
      <Button size="small">Custom Content</Button>
    </>
  ),
  sidePanelChildren: <SidePanelContainers />
}
SidePanel.parameters = {
  chromatic: {
    viewports: [1200]
  }
}

export const MobileSidePanel = Template.bind({})
MobileSidePanel.args = {
  ...SidePanel.args,
  initialState: { mobileDrawerOpen: true }
}
MobileSidePanel.parameters = {
  chromatic: {
    viewports: [360]
  }
}

export const Complete = Template.bind({})
Complete.args = {
  ...SidePanel.args,
  backHref: '/',
  bottomPanelChildren: (
    <Typography sx={{ backgroundColor: 'background.default' }}>
      Bottom Panel Content - no padding since TabPanels usually go here
    </Typography>
  ),
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
  ),
  templates: true
}

export default PageWrapperStory as Meta
