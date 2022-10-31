import { Meta, Story } from '@storybook/react'
import { useState, KeyboardEvent, MouseEvent } from 'react'
import { ThemeProvider } from '../../ThemeProvider'
import { HeaderMenuPanel } from './HeaderMenuPanel'

const HeaderMenuPanelStory = {
  component: HeaderMenuPanel,
  title: 'Watch/Header/HeaderMenuPanel',
  parameters: {
    layout: 'fullscreen'
  }
}

const Template: Story = () => {
  const [state, setState] = useState({
    top: false,
    left: false,
    bottom: false,
    right: false
  })

  const toggleDrawer =
    (anchor: string, open: boolean) =>
    (event: KeyboardEvent<Element> | MouseEvent<Element | MouseEvent>) => {
      if (
        event.type === 'keydown' &&
        ((event as KeyboardEvent).key === 'Tab' ||
          (event as KeyboardEvent).key === 'Shift')
      ) {
        return
      }

      setState({ ...state, [anchor]: open })
    }

  return (
    <ThemeProvider>
      <HeaderMenuPanel toggleDrawer={toggleDrawer} />
    </ThemeProvider>
  )
}

export const Default = Template.bind({})

export default HeaderMenuPanelStory as Meta
