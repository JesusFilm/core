import { Meta, Story } from '@storybook/react'
import Box from '@mui/material/Box'
import { ThemeProvider } from '../ThemeProvider'
import { Header } from './Header'

const HeaderStory = {
  component: Header,
  title: 'Watch/Header',
  parameters: {
    layout: 'fullscreen'
  }
}

const Template: Story = () => (
  <ThemeProvider>
    <Box
      sx={{
        backgroundColor: '#26262E'
      }}
    >
      <Header />
    </Box>
  </ThemeProvider>
)

export const Default = Template.bind({})

export default HeaderStory as Meta
