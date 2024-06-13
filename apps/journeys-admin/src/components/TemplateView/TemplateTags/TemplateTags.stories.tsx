import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'

import { journeysAdminConfig } from '../../../libs/storybook'
import { GET_TAGS } from '../../../libs/useTagsQuery/useTagsQuery'

import { parentTags, tags } from './data'
import { TemplateTags } from './TemplateTags'

const TemplateTagsStory: Meta<typeof TemplateTags> = {
  ...journeysAdminConfig,
  component: TemplateTags,
  title: 'Journeys-Admin/TemplateView/TemplateTags'
}

const Template: StoryObj<typeof TemplateTags> = {
  render: ({ ...args }) => (
    <MockedProvider
      mocks={[
        {
          request: {
            query: GET_TAGS
          },
          result: {
            data: {
              tags: [...parentTags, ...tags]
            }
          }
        }
      ]}
    >
      <TemplateTags {...args} />
    </MockedProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    tags
  }
}

export const Loading = {
  ...Template,
  args: { tags: null }
}

export default TemplateTagsStory
