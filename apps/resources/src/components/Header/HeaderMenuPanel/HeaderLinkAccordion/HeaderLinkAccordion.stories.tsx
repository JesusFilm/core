import { Meta, StoryObj } from '@storybook/nextjs'
import noop from 'lodash/noop'
import { screen, userEvent } from 'storybook/test'

import { watchConfig } from '../../../../libs/storybook'

import { HeaderLinkAccordion } from './HeaderLinkAccordion'

const HeaderLinkAccordionStory: Meta<typeof HeaderLinkAccordion> = {
  ...watchConfig,
  component: HeaderLinkAccordion,
  title: 'Watch/Header/HeaderMenuPanel/HeaderLinkAccordion'
}
const url = 'https://www.jesusfilm.org/'

const mockSubLinks = [
  {
    url: url,
    label: 'First Link'
  },
  {
    url: url,
    label: 'Second Link'
  },
  {
    url: url,
    label: 'Third Link'
  }
]

const Template: StoryObj<typeof HeaderLinkAccordion> = {
  render: ({ ...args }) => <HeaderLinkAccordion {...args} />
}

export const SingleLink = {
  ...Template,
  args: {
    label: 'Single Link',
    url: url,
    onClose: noop
  }
}

export const WithSubLinks = {
  ...Template,
  args: {
    label: 'Heading',
    subLinks: mockSubLinks,
    onClose: noop
  }
}

export const ExpandedAccordion = {
  ...Template,
  args: {
    label: 'Heading',
    subLinks: mockSubLinks,
    expanded: true,
    onClose: noop
  }
}

export const InteractiveAccordion = {
  ...Template,
  args: {
    label: 'Heading',
    subLinks: mockSubLinks,
    onClose: noop,
    onAccordionChange: (panel: string) => (_event, isExpanded) => undefined
  },
  play: async () => {
    const accordionHeader = screen.getByText('Heading')
    await userEvent.click(accordionHeader)
  }
}

export default HeaderLinkAccordionStory
