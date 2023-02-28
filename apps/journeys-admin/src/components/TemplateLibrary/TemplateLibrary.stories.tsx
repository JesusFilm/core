import { Meta, Story } from '@storybook/react'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import { journeysAdminConfig } from '../../libs/storybook'
import {
  oldTemplate,
  publishedTemplate,
  descriptiveTemplate
} from './TemplateListData'
import { TemplateLibrary } from '.'

const TemplateLibraryStory = {
  ...journeysAdminConfig,
  component: TemplateLibrary,
  title: 'Journeys-Admin/TemplateLibrary'
}

const Template: Story = ({ ...args }) => (
  <FlagsProvider flags={args.flags}>
    <TemplateLibrary {...args.props} />
  </FlagsProvider>
)

export const Default = Template.bind({})
Default.args = {
  props: {
    journeys: [oldTemplate],
    templates: [oldTemplate, publishedTemplate, descriptiveTemplate]
  },
  flags: {
    inviteRequirement: false
  }
}

export const Loading = Template.bind({})
Loading.args = {
  journeys: null,
  templates: null
}

export const InviteRequirement = Template.bind({})
InviteRequirement.args = {
  props: {
    journeys: [],
    templates: []
  },
  flags: {
    inviteRequirement: true
  }
}

export default TemplateLibraryStory as Meta
