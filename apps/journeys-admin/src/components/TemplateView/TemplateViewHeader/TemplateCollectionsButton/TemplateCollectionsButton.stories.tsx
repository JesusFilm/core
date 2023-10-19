import { Meta, StoryObj } from '@storybook/react'

import { JourneyFields_tags as Tag } from '../../../../../__generated__/JourneyFields'
import { journeysAdminConfig } from '../../../../libs/storybook'

import { TemplateCollectionsButton } from './TemplateCollectionsButton'

const TemplateCollectionsButtonStory: Meta<typeof TemplateCollectionsButton> = {
  ...journeysAdminConfig,
  title: 'Journeys-Admin/TemplateView/TemplateHeader/TemplateCollectionsButton',
  component: TemplateCollectionsButton
}

const mockTag: Tag = {
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
}

const Template: StoryObj<typeof TemplateCollectionsButton> = {
  render: (args) => <TemplateCollectionsButton tag={args.tag} />
}

export const Default = {
  ...Template,
  args: {
    tag: { ...mockTag }
  }
}

export default TemplateCollectionsButtonStory
