import { Meta, Story } from '@storybook/react'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { watchConfig } from '../../libs/storybook'
import { PageWrapper } from '.'

const PageWrapperStory = {
  ...watchConfig,
  component: PageWrapper,
  title: 'Watch/PageWrapper',
  parameters: {
    layout: 'fullscreen'
  }
}

const MuiContainer = ({
  label,
  height
}: {
  label: string
  height?: string
}): ReactElement => (
  <Container
    maxWidth="xl"
    style={{
      height: height,
      borderStyle: 'solid',
      borderColor: '#26262E',
      borderWidth: 1,
      backgroundColor: '#F0EDE3'
    }}
  >
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#a9cce8'
      }}
    >
      <Typography variant="h3">{label}</Typography>
    </Box>
  </Container>
)

const Template: Story = () => (
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

export const Default = Template.bind({})

export default PageWrapperStory as Meta
