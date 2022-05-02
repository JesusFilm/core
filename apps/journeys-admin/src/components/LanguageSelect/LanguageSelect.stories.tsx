import { Story, Meta } from '@storybook/react'
import { useState } from 'react'
import { MockedProvider } from '@apollo/client/testing'
import { simpleComponentConfig } from '../../libs/storybook'
import { GET_LANGUAGES } from './LanguageSelect'
import { LanguageSelect } from '.'

const LanguageSelectStory = {
  ...simpleComponentConfig,
  component: LanguageSelect,
  title: 'Journeys-Admin/LanguageSelect',
  argTypes: { onChange: { action: 'onChange' } }
}

const Template: Story = ({ onChange }) => {
  const [value, setValue] = useState<string | undefined>('529')

  const handleChange = (value?: string): void => {
    setValue(value)
    onChange(value)
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
                  __typename: 'Language',
                  id: '529',
                  name: [
                    {
                      value: 'English',
                      primary: true,
                      __typename: 'Translation'
                    }
                  ]
                },
                {
                  id: '496',
                  __typename: 'Language',
                  name: [
                    {
                      value: 'Français',
                      primary: true,
                      __typename: 'Translation'
                    },
                    {
                      value: 'French',
                      primary: false,
                      __typename: 'Translation'
                    }
                  ]
                },
                {
                  id: '1106',
                  __typename: 'Language',
                  name: [
                    {
                      value: 'Deutsch',
                      primary: true,
                      __typename: 'Translation'
                    },
                    {
                      value: 'German, Standard',
                      primary: false,
                      __typename: 'Translation'
                    }
                  ]
                }
              ]
            }
          }
        }
      ]}
    >
      <LanguageSelect
        onChange={handleChange}
        value={value}
        currentLanguageId="529"
      />
    </MockedProvider>
  )
}

export const Default = Template.bind({})

export default LanguageSelectStory as Meta
