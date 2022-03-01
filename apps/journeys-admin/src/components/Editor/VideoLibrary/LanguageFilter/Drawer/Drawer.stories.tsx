import { Story, Meta } from '@storybook/react'
import { useState } from 'react'
import { simpleComponentConfig } from '../../../../../libs/storybook'
import { Drawer } from '.'

const DrawerStory = {
  ...simpleComponentConfig,
  component: Drawer,
  title: 'Journeys-Admin/Editor/VideoLibrary/LanguageFilter/Drawer',
  argTypes: { onSelect: { action: 'onSelect' } }
}

const Template: Story = ({ onSelect }) => {
  const [open, setOpen] = useState(true)
  const [selectedIds, setSelectedIds] = useState(['en'])
  const handleChange = (selectedIds: string[]): void => {
    setSelectedIds(selectedIds)
    onSelect(selectedIds)
  }

  return (
    <Drawer
      open={open}
      onClose={() => setOpen(false)}
      onChange={handleChange}
      selectedIds={selectedIds}
      languages={[
        { id: 'en', name: 'English', nativeName: 'English' },
        { id: 'zh-Hans', name: 'Simplified Chinese', nativeName: '简体中文' }
      ]}
    />
  )
}

export const Default = Template.bind({})

export default DrawerStory as Meta
