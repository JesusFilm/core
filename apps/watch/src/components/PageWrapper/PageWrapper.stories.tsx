import { Meta, Story } from '@storybook/react'
import Container from '@mui/material/Container'
import { ReactElement } from 'react'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { watchConfig } from '../../libs/storybook'
import { ThemeProvider } from '../ThemeProvider'
import { Header } from '../Header'
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
  <ThemeProvider>
    <PageWrapper
      isStory
      header={<Header />}
      footer={<MuiContainer height="100%" label="Footer" />}
    >
      <MuiContainer height="600px" label="Body" />
    </PageWrapper>
  </ThemeProvider>
)

export const Default = Template.bind({})

export default PageWrapperStory as Meta
