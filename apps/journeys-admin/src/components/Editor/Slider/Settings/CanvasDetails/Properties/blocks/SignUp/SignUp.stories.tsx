import { jest } from '@storybook/jest'
import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import type { TreeBlock } from '@core/journeys/ui/block'

import { BlockFields_SignUpBlock as SignUpBlock } from '../../../../../../../../../__generated__/BlockFields'
import {
  IconColor,
  IconName,
  IconSize
} from '../../../../../../../../../__generated__/globalTypes'
import { simpleComponentConfig } from '../../../../../../../../libs/storybook'
import { Drawer } from '../../../../Drawer'

import { SignUp } from '.'

const Demo: Meta<typeof SignUp> = {
  ...simpleComponentConfig,
  component: SignUp,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/Properties/blocks/SignUp'
}

const onClose = jest.fn()

const block: TreeBlock<SignUpBlock> = {
  id: 'signup.id',
  __typename: 'SignUpBlock',
  parentBlockId: null,
  parentOrder: 0,
  submitLabel: null,
  action: null,
  submitIconId: null,
  children: []
}

const Template: StoryObj<ComponentProps<typeof SignUp>> = {
  render: (args) => {
    return (
      <EditorProvider initialState={{ selectedBlock: { ...args } }}>
        <Drawer title="Subscribe Properties" onClose={onClose}>
          <SignUp {...args} />
        </Drawer>
      </EditorProvider>
    )
  }
}

export const Default = {
  ...Template,
  args: {
    ...block
  }
}

export const Filled: StoryObj<typeof SignUp> = {
  render: () => {
    const block: TreeBlock<SignUpBlock> = {
      id: 'signup.id',
      __typename: 'SignUpBlock',
      parentBlockId: 'step1.id',
      parentOrder: 0,
      submitLabel: 'Sign Up',
      action: {
        __typename: 'LinkAction',
        parentBlockId: 'signup.id',
        gtmEventName: 'signup',
        url: 'https://www.google.com'
      },
      submitIconId: 'icon',
      children: [
        {
          id: 'icon',
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
    return (
      <EditorProvider initialState={{ selectedBlock: { ...block } }}>
        <Drawer title="Subscribe Properties" onClose={onClose}>
          <SignUp {...block} />
        </Drawer>
      </EditorProvider>
    )
  }
}
export default Demo
