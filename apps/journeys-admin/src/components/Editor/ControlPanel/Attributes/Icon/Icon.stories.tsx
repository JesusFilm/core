import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { TreeBlock, EditorProvider } from '@core/journeys/ui'
import { Drawer } from '../../../Drawer'
import { journeysAdminConfig } from '../../../../../libs/storybook'
import { IconFields } from '../../../../../../__generated__/IconFields'
import {
  IconName,
  IconColor,
  IconSize
} from '../../../../../../__generated__/globalTypes'
import { Icon } from '.'

const IconStory = {
  ...journeysAdminConfig,
  component: Icon,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Icon'
}

const Template: Story<TreeBlock<IconFields>> = ({ ...props }) => (
  <MockedProvider>
    <EditorProvider
      initialState={{
        drawerChildren: <Icon iconBlock={props} />,
        drawerTitle: 'Start Icon',
        drawerMobileOpen: true
      }}
    >
      <Drawer />
    </EditorProvider>
  </MockedProvider>
)

export const Default: Story<TreeBlock<IconFields>> = Template.bind({})
Default.args = {
  __typename: 'IconBlock',
  id: 'icon.id',
  parentBlockId: null,
  parentOrder: null,
  iconName: null,
  iconSize: null,
  iconColor: null,
  children: []
}

export const Filled: Story<TreeBlock<IconFields>> = Template.bind({})
Filled.args = {
  __typename: 'IconBlock',
  id: 'icon.id',
  parentBlockId: null,
  parentOrder: null,
  iconName: IconName.ArrowForwardRounded,
  iconSize: IconSize.md,
  iconColor: IconColor.primary,
  children: []
}
export default IconStory as Meta
