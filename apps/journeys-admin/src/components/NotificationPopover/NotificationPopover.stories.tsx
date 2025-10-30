import { Meta, StoryObj } from '@storybook/nextjs'
import noop from 'lodash/noop'
import { ComponentProps } from 'react'

import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { NotificationPopover } from '.'

const NotificationPopoverStory: Meta<typeof NotificationPopover> = {
  ...simpleComponentConfig,
  title: 'Journeys-Admin/NotificationPopover'
}

const Template: StoryObj<ComponentProps<typeof NotificationPopover>> = {
  render: ({ ...args }) => {
    return <NotificationPopover {...args} />
  }
}

const TestComponent = (): HTMLElement =>
  (<div>Test Component</div>) as unknown as HTMLElement

export const Default = {
  ...Template,
  args: {
    title: 'title',
    description: 'description',
    open: true,
    currentRef: TestComponent,
    pointerPosition: '10%',
    handleClose: noop
  }
}

export const Filled = {
  ...Template,
  args: {
    title:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam placerat mattis tempor. Morbi in arcu quam. Vestibulum suscipit lacus orci.',
    description:
      'Donec tristique turpis in quam faucibus, sed congue enim imperdiet. In posuere odio lacus, at luctus tellus finibus quis. Vestibulum rhoncus, tortor nec ultrices varius, mi nisl feugiat ipsum, ut pulvinar felis elit dictum metus. Vestibulum sodales est vel ullamcorper aliquam. Donec et feugiat dui, ac dictum augue. ',
    open: true,
    currentRef: TestComponent,
    pointerPosition: '90%',
    handleClose: noop,
    popoverAction: {
      label: 'Action',
      handleClick: noop
    }
  }
}

export default NotificationPopoverStory
