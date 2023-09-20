import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { GetAdminJourneys_journeys as Journey } from '../../../__generated__/GetAdminJourneys'
import { journeysAdminConfig } from '../../libs/storybook'
import {
  defaultTemplate,
  publishedTemplate
} from '../TemplateLibrary/TemplateListData'

import { TemplateGalleryCard } from '.'

const TemplateGalleryCardStory: Meta<typeof TemplateGalleryCard> = {
  ...journeysAdminConfig,
  component: TemplateGalleryCard,
  title: 'Journeys-Admin/TemplateGalleryCard'
}

const Template: StoryObj<
  ComponentProps<typeof TemplateGalleryCard> & { template: Journey }
> = {
  render: ({ ...args }) => (
    <MockedProvider>
      <TemplateGalleryCard
        journey={args.template}
        isPublisher={args.isPublisher}
      />
    </MockedProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    template: defaultTemplate,
    isPublisher: false
  }
}

export const Loading = {
  ...Template,
  args: {
    template: undefined,
    isPublisher: false
  }
}

export const Complete = {
  ...Template,
  args: {
    template: {
      ...publishedTemplate,
      title: 'Template Journey'
    },
    isPublisher: true
  }
}

export default TemplateGalleryCardStory
