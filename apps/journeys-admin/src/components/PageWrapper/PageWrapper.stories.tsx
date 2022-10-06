import { ReactElement } from 'react'
import { Meta, Story } from '@storybook/react'
import IconButton from '@mui/material/IconButton'
import MenuRounded from '@mui/icons-material/MenuRounded'
import Typography from '@mui/material/Typography'
import { noop } from 'lodash'
import { MockedProvider } from '@apollo/client/testing'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import { journeysAdminConfig } from '../../libs/storybook'
import { Role } from '../../../__generated__/globalTypes'
import { GET_USER_ROLE } from '../JourneyView/JourneyView'
import { GET_ME } from './NavigationDrawer/NavigationDrawer'
import { MainBodyContainer } from './MainBodyContainer'
import { SidePanelContainer } from './SidePanelContainer'
import { BottomPanelContainer } from './BottomPanelContainer'
import { PageWrapper, PageWrapperProps } from '.'

const PageWrapperStory = {
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
    <SidePanelContainer>
      <Typography sx={{ backgroundColor: 'background.default' }}>
        Side Panel Content
      </Typography>
    </SidePanelContainer>
    <SidePanelContainer>
      <Typography sx={{ backgroundColor: 'background.default' }}>
        Side Panel Content
      </Typography>
    </SidePanelContainer>
    <SidePanelContainer>
      <Typography sx={{ backgroundColor: 'background.default' }}>
        Side Panel Content
      </Typography>
    </SidePanelContainer>
  </>
)

const Template: Story = ({
  templates = false,
  ...args
}: PageWrapperProps & { templates?: boolean }) => (
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

export const Default = Template.bind({})
Default.args = {
  title: 'Main Content',
  children: (
    <MainBodyContainer>
      <Typography variant="h3" sx={{ backgroundColor: 'background.default' }}>
        Main Body Content
      </Typography>
      <Typography sx={{ backgroundColor: 'background.default' }}>
        This should always be wrapped in a MainBodyContainer which adds padding
        around it.
      </Typography>
    </MainBodyContainer>
  )
}

export const SidePanel = Template.bind({})
SidePanel.args = {
  title: 'Main Content',
  children: (
    <MainBodyContainer>
      <Typography variant="h3" sx={{ backgroundColor: 'background.default' }}>
        Main Body Content
      </Typography>
      <Typography sx={{ backgroundColor: 'background.default' }}>
        On this story we want to test scroll.
      </Typography>
      <Typography sx={{ backgroundColor: 'background.default' }}>
        We should still see the side panel content below on mobile portrait and
        to the side on desktop / mobile landscape.
      </Typography>
    </MainBodyContainer>
  ),
  sidePanelTitle: 'Side Panel Content',
  sidePanelChildren: <SidePanelContainers />
}

export const Complete = Template.bind({})
Complete.args = {
  backHref: '/',
  showDrawer: true,
  title: 'Main Content',
  children: (
    <>
      <MainBodyContainer xsColumns={2} smColumns={6}>
        <Typography variant="h3" sx={{ backgroundColor: 'background.default' }}>
          Main Body Content
        </Typography>
        <Typography sx={{ backgroundColor: 'background.default' }}>
          We can have multiple MainBodyContainers passed here. These can be
          configured by the grid. These 2 containers each take up a half of the
          MainPanel on mobile and desktop.
        </Typography>
      </MainBodyContainer>
      <MainBodyContainer xsColumns={2} smColumns={6}>
        <Typography sx={{ backgroundColor: 'background.default' }}>
          By default, the MainBodyContainer will take up the full width of
          MainPanel and stack on top of each other if there are multiple
        </Typography>
      </MainBodyContainer>
    </>
  ),
  sidePanelTitle: 'Side Panel Content',
  sidePanelChildren: <SidePanelContainers />,
  bottomPanelChildren: (
    <BottomPanelContainer>
      <Typography sx={{ backgroundColor: 'background.default' }}>
        Bottom Panel Content - no padding since TabPanels usually go here
      </Typography>
    </BottomPanelContainer>
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
