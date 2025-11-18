import { MockedProvider } from '@apollo/client/testing'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import ListItemButton from '@mui/material/ListItemButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Meta, StoryObj } from '@storybook/nextjs'
import noop from 'lodash/noop'
import { ReactElement } from 'react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { GET_USER_ROLE } from '@core/journeys/ui/useUserRoleQuery'
import Menu1Icon from '@core/shared/ui/icons/Menu1'
import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { Role } from '../../../__generated__/globalTypes'
import { Drawer } from '../Editor/Slider/Settings/Drawer'

import { GET_ME } from './NavigationDrawer/UserNavigation'
import { SidePanelContainer } from './SidePanelContainer'

import { PageWrapper } from '.'

const PageWrapperStory: Meta<typeof PageWrapper> = {
  ...journeysAdminConfig,
  component: PageWrapper,
  title: 'Journeys-Admin/PageWrapper',
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

const Template: StoryObj<typeof PageWrapper> = {
  render: ({ ...args }) => {
    return (
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_ME,
              variables: { input: { redirect: undefined } }
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
        <EditorProvider>
          <PageWrapper {...args} />
        </EditorProvider>
      </MockedProvider>
    )
  }
}

export const Default = {
  ...Template,
  args: {
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
          The main body content background is grey by default.
        </Typography>
      </>
    )
  }
}

export const CustomMainBody = {
  ...Template,
  args: {
    ...Default.args,
    mainBodyPadding: false,
    showMainHeader: false,
    children: (
      <Paper
        sx={{ height: '100%', px: { xs: 1, md: 16 }, py: 4 }}
        elevation={0}
        square
      >
        <Typography gutterBottom>
          Use mainBodyPadding: false and showMainHeader: false to completely
          customise the layout & background of the main body area.
        </Typography>
      </Paper>
    )
  }
}

export const SidePanel = {
  ...Template,
  args: {
    ...Default.args,
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
    sidePanelTitle: 'Side Panel Content',
    sidePanelChildren: <SidePanelContainers />
  },
  menu: (
    <IconButton edge="end" size="large" color="inherit" sx={{ ml: 2 }}>
      <Menu1Icon />
    </IconButton>
  ),
  templates: true,
  parameters: {
    chromatic: {
      viewports: [1200]
    }
  }
}

export const MobileSidePanel = {
  ...Template,
  args: {
    ...SidePanel.args,
    initialState: {
      mobileDrawerOpen: true
    }
  },
  parameters: {
    chromatic: {
      viewports: [360]
    }
  }
}

export const CustomSidePanel = {
  ...Template,
  args: {
    ...SidePanel.args,
    children:
      'Custom page specific side panel can go in side panel space on the right',
    sidePanelTitle: null,
    sidePanelChildren: null,
    customSidePanel: <Drawer />
  },
  parameters: {
    chromatic: {
      viewports: [1200]
    }
  }
}

export const NoNavBar = {
  ...Template,
  args: {
    ...Default.args,
    showNavBar: false
  }
}

export const NoHeader = {
  ...Template,
  args: {
    ...Default.args,
    showMainHeader: false,
    showAppHeader: false
  }
}

export const Complete = {
  ...Template,
  args: {
    ...SidePanel.args,
    sidePanelTitle: (
      <>
        Side Panel Content
        <Button size="small">Custom Content</Button>
      </>
    ),
    backHref: '/',
    bottomPanelChildren: (
      <Typography sx={{ backgroundColor: 'background.default' }}>
        Bottom Panel Content - no padding since TabPanels usually go here
      </Typography>
    ),
    user: {
      displayName: 'Amin One',
      photoURL: 'https://bit.ly/3Gth4Yf',
      email: 'amin@email.com',
      signOut: noop
    },
    mainHeaderChildren: (
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="flex-end"
        flexGrow={1}
      >
        <Typography variant="caption" sx={{ pl: 4 }}>
          custom content
        </Typography>
        <IconButton edge="end" size="large" color="inherit" sx={{ ml: 2 }}>
          <Menu1Icon />
        </IconButton>
      </Stack>
    ),
    templates: true
  }
}

export default PageWrapperStory
