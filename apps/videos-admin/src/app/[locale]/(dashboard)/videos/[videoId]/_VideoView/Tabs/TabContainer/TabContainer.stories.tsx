import Typography from '@mui/material/Typography'
import type { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { videosAdminConfig } from '../../../../../../../../libs/storybookConfig'

import { TabContainer } from './TabContainer'

const meta: Meta<typeof TabContainer> = {
  ...videosAdminConfig,
  component: TabContainer,
  title: 'Videos-Admin/TabContainer',
  parameters: {
    ...videosAdminConfig.parameters,
    tags: ['!autodocs']
  }
}

type Story = StoryObj<ComponentProps<typeof TabContainer>>

const Template: Story = {
  render: ({ ...args }) => (
    <TabContainer value={args.value} index={args.index}>
      <Typography>Content here</Typography>
    </TabContainer>
  )
}

export const Default = {
  ...Template,
  args: {
    value: 0,
    index: 0
  }
}

export default meta
