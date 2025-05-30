import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { JourneyProvider } from '../../../libs/JourneyProvider'
import {
  JourneyFields as Journey,
  JourneyFields_primaryImageBlock as PrimaryImageBlock
} from '../../../libs/JourneyProvider/__generated__/JourneyFields'
import { journey } from '../TemplateFooter/data'

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

export const CreatorDetails = {
  ...Template,
  args: {
    ...Template.args,
    journey: {
      ...journey,
      primaryImageBlock,
      title: 'My Cool Journey',
      description:
        'some description with some words in it... cool journey, huh?',
      creatorDescription:
        'Created by a Name of a Mission or Missionaries Organisation label by a Name of a Mission or Missionaries',
      creatorImageBlock: null
    }
  }
}

export const CreatorDetailsWithImage = {
  ...Template,
  args: {
    ...Template.args,
    journey: {
      ...journey,
      primaryImageBlock,
      title: 'My Cool Journey',
      description:
        'some description with some words in it... cool journey, huh?',
      creatorDescription:
        'Created by a Name of a Mission or Missionaries Organisation label by a Name of a Mission or Missionaries',
      creatorImageBlock: {
        id: 'creatorImageBlock.id',
        parentBlockId: null,
        parentOrder: 3,
        src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
        alt: 'photo-1552410260-0fd9b577afa6',
        width: 6000,
        height: 4000,
        blurhash: 'LHFr#AxW9a%L0KM{IVRkoMD%D%R*',
        __typename: 'ImageBlock'
      }
    }
  }
}

export const Loading = {
  ...Template,
  args: {
    isPublisher: undefined,
    authUser: undefined,
    journey: undefined
  }
}

export default TemplateViewHeaderStory
