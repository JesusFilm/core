import { ComponentProps, ReactElement } from 'react'
import { Meta, Story } from '@storybook/react'
import IconButton from '@mui/material/IconButton'
import MenuRounded from '@mui/icons-material/MenuRounded'
import Typography from '@mui/material/Typography'
import { noop } from 'lodash'
import { MockedProvider } from '@apollo/client/testing'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import { screen, userEvent, waitFor } from '@storybook/testing-library'
import { journeysAdminConfig } from '../../libs/storybook'
import { Role } from '../../../__generated__/globalTypes'
import { GET_USER_ROLE } from '../JourneyView/JourneyView'
import { GET_ME } from '../PageWrapper/NavigationDrawer/NavigationDrawer'
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
        <SidePanelContainer border={false}>
          <Typography sx={{ backgroundColor: 'background.default' }}>
            Side Panel Content without border
          </Typography>
        </SidePanelContainer>
      ) : (
        <SidePanelContainer>
          <Typography sx={{ backgroundColor: 'background.default' }}>
            Side Panel Content
          </Typography>
        </SidePanelContainer>
      )
    )}
  </>
)

const Template: Story<
  ComponentProps<typeof PageWrapper> & { templates?: boolean }
> = ({ templates = false, ...args }) => {
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
      <FlagsProvider flags={{ templates }}>
        <PageWrapper {...args} />
      </FlagsProvider>
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
        Each child in the side panel must be wrapped by SidePanelContainer which
        adds padding and an optional border to the component.
      </Typography>
    </>
  ),
  sidePanelTitle: 'Side Panel Content',
  sidePanelChildren: <SidePanelContainers />
}
SidePanel.parameters = {
  chromatic: {
    viewports: [1200]
  }
}

export const OpenSidePanel = Template.bind({})
OpenSidePanel.args = {
  ...SidePanel.args,
  initialState: { mobileDrawerOpen: true }
}
OpenSidePanel.parameters = {
  chromatic: {
    viewports: [360]
  }
}
OpenSidePanel.play = async () => {
  await waitFor(() => {
    userEvent.click(screen.getByRole('button', { name: 'Open' }))
  })
}

export const Complete = Template.bind({})
Complete.args = {
  ...Default.args,
  backHref: '/',
  sidePanelTitle: 'Side Panel Content',
  sidePanelChildren: <SidePanelContainers />,
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
