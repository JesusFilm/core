import { ComponentProps } from 'react'
import { Story, Meta } from '@storybook/react'
import { journeysAdminConfig } from '../../libs/storybook'
import { ContactSupport } from '.'

const ContactSupportStory = {
  ...journeysAdminConfig,
  component: ContactSupport,
  title: 'Journeys-Admin/ContactSupport'
}

const Template: Story<ComponentProps<typeof ContactSupport>> = ({
  ...args
}) => <ContactSupport {...args} />

export const Default = Template.bind({})
Default.args = {
  title: 'You need to be invited to create the first journey',
  description:
    'Someone with a full account should add you to their journey as an editor, after that you will have full access'
}

export default ContactSupportStory as Meta
