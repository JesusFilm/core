import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { FormikContextType, FormikProvider } from 'formik'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JourneyFields as Journey } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'

import { GET_LANGUAGES } from '../../../../../../libs/useLanguagesQuery'
import { publishedJourney } from '../../../../../JourneyList/journeyListData'
import { TemplateSettingsFormValues } from '../useTemplateSettingsForm'

import { MetadataTabPanel } from './MetadataTabPanel'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

describe('MetadataTabPanel', () => {
  afterEach(() => jest.clearAllMocks())

  it('shows published date', () => {
    const handleChange = jest.fn()
    const { getByText } = render(
      <MockedProvider>
        <JourneyProvider
          value={{ journey: publishedJourney as unknown as Journey }}
        >
          <FormikProvider
            value={
              {
                values: { title: '', description: '', featuredAt: false },
                handleChange
              } as unknown as FormikContextType<TemplateSettingsFormValues>
            }
          >
            <MetadataTabPanel />
          </FormikProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    expect(getByText('01/01/2023')).toBeInTheDocument()
  })

  it('should handle form change', () => {
    const handleChange = jest.fn()
    const { getByRole } = render(
      <MockedProvider>
        <FormikProvider
          value={
            {
              values: { title: '', description: '', featuredAt: false },
              handleChange
            } as unknown as FormikContextType<TemplateSettingsFormValues>
          }
        >
          <MetadataTabPanel />
        </FormikProvider>
      </MockedProvider>
    )

    fireEvent.change(getByRole('textbox', { name: 'Title' }), {
      target: { value: 'My Cool Journey' }
    })

    expect(handleChange).toHaveBeenCalled()
    jest.clearAllMocks()
    expect(handleChange).not.toHaveBeenCalled()

    fireEvent.change(getByRole('textbox', { name: 'Description' }), {
      target: { value: 'My cool description' }
    })

    expect(handleChange).toHaveBeenCalled()
    jest.clearAllMocks()
    expect(handleChange).not.toHaveBeenCalled()

    fireEvent.click(getByRole('checkbox', { name: 'Featured' }))
    expect(handleChange).toHaveBeenCalled()
  })

  it('should handle language selection change', async () => {
    const getLanguagesMock = {
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

    const setFieldValue = jest.fn()
    const { getByRole } = render(
      <MockedProvider mocks={[getLanguagesMock]}>
        <FormikProvider
          value={
            {
              values: {
                title: '',
                description: '',
                featuredAt: false,
                language: {
                  id: '529',
                  localName: 'English',
                  nativeName: 'English'
                }
              },
              setFieldValue
            } as unknown as FormikContextType<TemplateSettingsFormValues>
          }
        >
          <MetadataTabPanel />
        </FormikProvider>
      </MockedProvider>
    )

    fireEvent.focus(getByRole('combobox'))
    fireEvent.keyDown(getByRole('combobox'), { key: 'ArrowDown' })
    await waitFor(() =>
      expect(getByRole('option', { name: 'English' })).toBeInTheDocument()
    )
    fireEvent.click(getByRole('option', { name: 'French Français' }))
    expect(setFieldValue).toHaveBeenCalled()
  })
})
