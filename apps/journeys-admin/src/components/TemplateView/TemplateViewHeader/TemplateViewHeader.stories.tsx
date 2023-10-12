import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  JourneyFields as Journey,
  JourneyFields_primaryImageBlock as PrimaryImageBlock
} from '../../../../__generated__/JourneyFields'
import { journeysAdminConfig } from '../../../libs/storybook'
import { journey } from '../../Editor/ActionDetails/data'

import { TemplateViewHeader } from './TemplateViewHeader'

const TemplateViewHeaderStory: Meta<typeof TemplateViewHeader> = {
  ...journeysAdminConfig,
  title: 'Journeys-Admin/TemplateView/TemplateHeader',
  component: TemplateViewHeader
}

const primaryImageBlock: PrimaryImageBlock = {
  id: 'image1.id',
  __typename: 'ImageBlock',
  parentBlockId: null,
  parentOrder: 0,
  src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
  alt: 'image.jpg',
  width: 1920,
  height: 1080,
  blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL'
} as unknown as PrimaryImageBlock

const Template: StoryObj<
  ComponentProps<typeof TemplateViewHeader> & { journey: Journey }
> = {
  render: ({ ...args }) => (
    <JourneyProvider
      value={{
        journey: args.journey
      }}
    >
      <TemplateViewHeader
        isPublisher={args.isPublisher}
        authUser={args.authUser}
      />
    </JourneyProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    journey: {
      ...journey,
      primaryImageBlock,
      title: 'My Cool Journey',
      description:
        'some description with some words in it... cool journey, huh?'
    },
    isPublisher: false,
    authUser: { id: 'userId' }
  }
}

export const Publisher = {
  ...Template,
  args: {
    ...Default.args,
    isPublisher: true
  }
}

export const EmptyImage = {
  ...Template,
  args: {
    ...Publisher.args,
    journey
  }
}

export default TemplateViewHeaderStory
