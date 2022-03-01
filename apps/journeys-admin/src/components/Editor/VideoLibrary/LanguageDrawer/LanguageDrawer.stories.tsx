import { Story, Meta } from '@storybook/react'
import { useState } from 'react'
import { simpleComponentConfig } from '../../../../libs/storybook'
import { LanguageDrawer } from '.'

const LanguageDrawerStory = {
  ...simpleComponentConfig,
  component: LanguageDrawer,
  title: 'Journeys-Admin/Editor/VideoLibrary/LanguageDrawer',
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
    <LanguageDrawer
      open={open}
      onClose={() => setOpen(false)}
      onChange={handleChange}
      selectedIds={selectedIds}
    />
  )
}

export const Default = Template.bind({})

export default LanguageDrawerStory as Meta
