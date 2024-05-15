import Typography from '@mui/material/Typography'
import { Meta, StoryObj } from '@storybook/react'

import { nexusAdminConfig } from '../../libs/storybook'

import { PageWrapper } from './PageWrapper'

const PageWrapperStory: Meta<typeof PageWrapper> = {
  ...nexusAdminConfig,
  component: PageWrapper,
  title: 'Nexus-Admin/PageWrapper',
  parameters: {
    ...nexusAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: StoryObj<typeof PageWrapper> = {
  render: ({ ...args }) => {
    return <PageWrapper {...args} />
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
export default PageWrapperStory
