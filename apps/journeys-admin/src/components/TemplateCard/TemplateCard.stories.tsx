import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { GetJourneysAdmin_journeys as Journey } from '../../../__generated__/GetJourneysAdmin'
import { journeysAdminConfig } from '../../libs/storybook'
import {
  defaultTemplate,
  descriptiveTemplate
} from '../TemplateLibrary/TemplateListData'

import { TemplateCard } from '.'

const TemplateCardStory: Meta<typeof TemplateCard> = {
  ...journeysAdminConfig,
  component: TemplateCard,
  title: 'Journeys-Admin/TemplateCard'
}

const Template: StoryObj<
  ComponentProps<typeof TemplateCard> & { template: Journey }
> = {
  render: ({ ...args }) => (
    <MockedProvider>
      <TemplateCard journey={args.template} isPublisher={args.isPublisher} />
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
    template: descriptiveTemplate,
    isPublisher: true
  }
}

export const CompleteLoading = {
  ...Template,
  args: {
    template: undefined,
    isPublisher: true
  }
}

export default TemplateCardStory
