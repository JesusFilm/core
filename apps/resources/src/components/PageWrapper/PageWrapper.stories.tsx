import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { Meta, StoryObj } from '@storybook/nextjs'

import { watchConfig } from '../../libs/storybook'

import { PageWrapper } from '.'

const PageWrapperStory: Meta<typeof PageWrapper> = {
  ...watchConfig,
  component: PageWrapper,
  title: 'Watch/PageWrapper',
  parameters: {
    layout: 'fullscreen'
  }
}

const Template: StoryObj<typeof PageWrapper> = {
  render: () => (
    // Box shows PageWrapper Container spacing
    <Box
      sx={{
        backgroundColor: 'divider',
        'div:has(> .content)': {
          backgroundColor: 'darkseagreen'
        }
      }}
    >
      <PageWrapper
        hero={
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              height: '150px',
              backgroundColor: 'background.default',
              color: 'text.primary'
            }}
          >
            <Typography variant="h3">Hero</Typography>
          </Box>
        }
      >
        <Box
          className="content"
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%',
            backgroundColor: '#a9cce8'
          }}
        >
          <Typography variant="h3">Body</Typography>
        </Box>
      </PageWrapper>
    </Box>
  )
}

export const Default = { ...Template }

export default PageWrapperStory
