import { Meta, StoryObj } from '@storybook/nextjs'
import { ReactElement, useState } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { publishedLocalTemplate } from '@core/journeys/ui/TemplateView/data'
import { GET_LANGUAGES } from '@core/journeys/ui/useLanguagesQuery'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { LocalTemplateDetailsDialog } from './LocalTemplateDetailsDialog'

const LocalTemplateDetailsDialogStory: Meta<
  typeof LocalTemplateDetailsDialog
> = {
  ...simpleComponentConfig,
  component: LocalTemplateDetailsDialog,
  title: 'Journeys-Admin/Editor/Toolbar/LocalTemplateDetailsDialog',
  parameters: {
    ...simpleComponentConfig.parameters,
    layout: 'fullscreen'
  }
}

const getLanguagesMock = {
  request: {
    query: GET_LANGUAGES,
    variables: { languageId: '529' }
  },
  result: {
    data: {
      languages: [
        {
          __typename: 'Language',
          id: '529',
          slug: 'english',
          name: [
            {
              value: 'English',
              primary: true,
              __typename: 'LanguageName'
            }
          ]
        },
        {
          id: '496',
          __typename: 'Language',
          slug: 'french',
          name: [
            {
              value: 'Français',
              primary: true,
              __typename: 'LanguageName'
            },
            {
              value: 'French',
              primary: false,
              __typename: 'LanguageName'
            }
          ]
        }
      ]
    }
  }
}

const LocalTemplateDetailsDialogComponent = (): ReactElement => {
  const [open, setOpen] = useState(true)

  return (
    <JourneyProvider
      value={{
        journey: publishedLocalTemplate,
        variant: 'admin'
      }}
    >
      <LocalTemplateDetailsDialog open={open} onClose={() => setOpen(false)} />
    </JourneyProvider>
  )
}

const Template: StoryObj<typeof LocalTemplateDetailsDialog> = {
  render: () => <LocalTemplateDetailsDialogComponent />
}

export const Default = {
  ...Template,
  parameters: {
    apolloClient: {
      mocks: [getLanguagesMock]
    }
  }
}

export default LocalTemplateDetailsDialogStory
