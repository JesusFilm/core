import { ComponentProps } from 'react'
import { Story, Meta } from '@storybook/react'
import Stack from '@mui/material/Stack'

import { simpleComponentConfig } from '../../../../../../libs/storybook'

import { Footer } from './Footer'

const Demo = {
  ...simpleComponentConfig,
  component: Footer,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Footer'
}

const Template: Story<ComponentProps<typeof Footer>> = () => {
  return (
    <Stack
      direction="row"
      spacing={4}
      sx={{
        overflowX: 'auto',
        py: 5,
        px: 6
      }}
    >
      <Footer />
    </Stack>
  )
}

export const Default = Template.bind({})

export default Demo as Meta
