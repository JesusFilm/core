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

export const WithTags = {
  ...Template,
  args: {
    ...Default.args,
    journey: {
      ...Default.args.journey,
      tags: [
        {
          __typename: 'Tag',
          id: 'a6b0080c-d2a5-4b92-945a-8e044c743139',
          parentId: 'eff2c8a5-64d3-4f20-916d-270ff9ad5813',
          name: [
            {
              __typename: 'Translation',
              value: 'Jesus Film',
              language: {
                __typename: 'Language',
                id: '529'
              },
              primary: true
            }
          ]
        },
        {
          __typename: 'Tag',
          id: 'eff2c8a5-64d3-4f20-916d-270ff9ad5813',
          parentId: null,
          name: [
            {
              __typename: 'Translation',
              value: 'Collections',
              language: {
                __typename: 'Language',
                id: '529'
              },
              primary: true
            }
          ]
        }
      ]
    }
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
