import Stack from '@mui/material/Stack'
import { Meta, Story } from '@storybook/react'

import {
  IconColor,
  IconName,
  IconSize
} from '../../../../../../../__generated__/globalTypes'
import { journeysAdminConfig } from '../../../../../../libs/storybook'

import { TextResponse } from './TextResponse'

const TextResponseStory = {
  ...journeysAdminConfig,
  component: TextResponse,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/TextResponse'
}

const Template: Story = ({ ...args }) => {
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
      <TextResponse {...args.block} />
    </Stack>
  )
}

export const Default = Template.bind({})
Default.args = {
  block: {
    __typename: 'TextResponseBlock',
    id: 'textResponseBlock.id',
    parentBlockId: null,
    parentOrder: null,
    action: null,
    submitIconId: null,
    label: 'label',
    children: []
  }
}

export const Complete = Template.bind({})
Complete.args = {
  block: {
    __typename: 'TextResponseBlock',
    id: 'textResponseBlock.id',
    parentBlockId: null,
    parentOrder: null,
    action: {
      __typename: 'LinkAction',
      parentBlockId: 'responseAction.id',
      gtmEventName: 'responseAction',
      url: 'https://www.google.com'
    },
    submitIconId: 'icon.id',
    label: 'label',
    hint: 'hint text',
    minRows: 2,
    children: [
      {
        id: 'icon.id',
        __typename: 'IconBlock',
        parentBlockId: 'button',
        parentOrder: 0,
        iconName: IconName.ArrowForwardRounded,
        iconColor: IconColor.action,
        iconSize: IconSize.lg,
        children: []
      }
    ]
  }
}

export default TextResponseStory as Meta
