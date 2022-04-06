import { Story, Meta } from '@storybook/react'
import { EditorProvider } from '@core/journeys/ui'
import { MockedProvider } from '@apollo/client/testing'
import { simpleComponentConfig } from '../../../../libs/storybook'
import { Drawer } from '../Drawer'
import { SocialShareAppearance } from './SocialShareAppearance'

const SocialShareAppearanceStory = {
  ...simpleComponentConfig,
  component: SocialShareAppearance,
  title: 'Journeys-Admin/Editor/Drawer/SocialShareAppearance'
}

export const Default: Story = () => {
  return (
    <MockedProvider>
      <EditorProvider
        initialState={{
          drawerTitle: 'Social Share Appearance',
          drawerChildren: <SocialShareAppearance id="1" />,
          drawerMobileOpen: true
        }}
      >
        <Drawer />
      </EditorProvider>
    </MockedProvider>
  )
}

export default SocialShareAppearanceStory as Meta
