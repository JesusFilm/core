import { Meta, Story } from '@storybook/react'
import Container from '@mui/material/Container'
import { ReactElement } from 'react'
import Typography from '@mui/material/Typography'
import { ThemeProvider } from '../ThemeProvider'
import { Header } from '../Header'
import { PageWrapper } from '.'

const PageWrapperStory = {
  component: PageWrapper,
  title: 'Watch/PageWrapper',
  parameters: {
    layout: 'fullscreen'
  }
}

const MuiContainer = ({
  bgColor,
  label,
  height
}: {
  bgColor: string
  label: string
  height?: string
}): ReactElement => (
  <Container
    maxWidth="xl"
    style={{
      height: height,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      borderStyle: 'solid',
      borderColor: '#26262E',
      borderWidth: 1,
      backgroundColor: bgColor
    }}
  >
    <Typography variant="h3">{label}</Typography>
  </Container>
)

const Template: Story = () => (
  <ThemeProvider>
    <PageWrapper
      isStory
      header={<Header />}
      footer={<MuiContainer height="100%" bgColor="#6D6D7D" label="Footer" />}
    >
      <MuiContainer height="600px" bgColor="#F0EDE3" label="Body" />
    </PageWrapper>
  </ThemeProvider>
)

export const Default = Template.bind({})

export default PageWrapperStory as Meta
