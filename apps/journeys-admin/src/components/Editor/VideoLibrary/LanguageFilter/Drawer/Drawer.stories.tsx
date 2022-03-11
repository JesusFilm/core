import { Story, Meta } from '@storybook/react'
import { useState } from 'react'
import { MockedProvider } from '@apollo/client/testing'
import { simpleComponentConfig } from '../../../../../libs/storybook'
import { GET_LANGUAGES } from './Drawer'
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
    <MockedProvider
      mocks={[
        {
          request: {
            query: GET_LANGUAGES,
            variables: {
              languageId: '529'
            }
          },
          result: {
            data: {
              languages: [
                {
                  id: '529',
                  name: [
                    {
                      value: 'English',
                      primary: true
                    }
                  ]
                },
                {
                  id: '496',
                  name: [
                    {
                      value: 'Français',
                      primary: true
                    },
                    {
                      value: 'French',
                      primary: false
                    }
                  ]
                },
                {
                  id: '1106',
                  name: [
                    {
                      value: 'Deutsch',
                      primary: true
                    },
                    {
                      value: 'German, Standard',
                      primary: false
                    }
                  ]
                }
              ]
            }
          }
        }
      ]}
    >
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        onChange={handleChange}
        selectedIds={selectedIds}
        currentLanguageId="529"
      />
    </MockedProvider>
  )
}

export const Default = Template.bind({})

export default DrawerStory as Meta
