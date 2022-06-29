import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { SnackbarProvider } from 'notistack'
import { noop } from 'lodash'
import { simpleComponentConfig } from '../../../../../libs/storybook'
import { JourneyStatus } from '../../../../../../__generated__/globalTypes'
import { DefaultMenuProps } from './DefaultMenu'
import { DefaultMenu } from '.'

const DefaultMenuDemo = {
  ...simpleComponentConfig,
  component: DefaultMenu,
  title: 'Journeys-Admin/JourneyList/JourneyCard/JourneyCardMenu/DefaultMenu'
}

const Template: Story<DefaultMenuProps> = ({ ...args }) => (
  <MockedProvider mocks={[]}>
    <SnackbarProvider>
      <DefaultMenu {...args} />
    </SnackbarProvider>
  </MockedProvider>
)

export const Draft = Template.bind({})
Draft.args = {
  slug: 'journey-slug',
  status: JourneyStatus.draft,
  journeyId: 'journey-id',
  published: false,
  setOpenAccessDialog: noop,
  handleCloseMenu: noop,
  setOpenTrashDialog: noop
}

export const Published = Template.bind({})
Published.args = {
  slug: 'journey-slug',
  status: JourneyStatus.draft,
  journeyId: 'journey-id',
  published: false,
  setOpenAccessDialog: noop,
  handleCloseMenu: noop,
  setOpenTrashDialog: noop
}

export default DefaultMenuDemo as Meta
