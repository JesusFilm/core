import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { FormikContextType, FormikProvider } from 'formik'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JourneyFields as Journey } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'
import { GET_LANGUAGES } from '@core/journeys/ui/useLanguagesQuery'

import {
  publishedGlobalTemplate,
  publishedLocalTemplate
} from '../../../../../../JourneyList/journeyListData'
import { TemplateSettingsFormValues } from '../useTemplateSettingsForm'

import { MetadataTabPanel } from './MetadataTabPanel'

describe('MetadataTabPanel', () => {
  afterEach(() => vi.clearAllMocks())

  it('shows published date', () => {
    const handleChange = vi.fn()
    const publishedGlobalTemplateJourney =
      publishedGlobalTemplate as unknown as Journey
    const showFeaturedSettings =
      publishedGlobalTemplateJourney.team?.id === 'jfp-team'
    const { getByRole } = render(
      <MockedProvider>
        <JourneyProvider value={{ journey: publishedGlobalTemplateJourney }}>
          <FormikProvider
            value={
              {
                values: { title: '', description: '', featuredAt: false },
                handleChange
              } as unknown as FormikContextType<TemplateSettingsFormValues>
            }
          >
            <MetadataTabPanel showFeaturedSettings={showFeaturedSettings} />
          </FormikProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    expect(getByRole('textbox', { name: '' })).toHaveValue('01/01/2021')
  })

  it('does not show published date for local template', () => {
    const handleChange = vi.fn()
    const { queryByRole } = render(
      <MockedProvider>
        <JourneyProvider
          value={{ journey: publishedLocalTemplate as unknown as Journey }}
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

    expect(queryByRole('textbox', { name: '' })).not.toBeInTheDocument()
  })

  it('should handle form change', () => {
    const handleChange = vi.fn()
    const publishedGlobalTemplateJourney =
      publishedGlobalTemplate as unknown as Journey
    const showFeaturedSettings =
      publishedGlobalTemplateJourney.team?.id === 'jfp-team'

    const { getByRole } = render(
      <MockedProvider>
        <JourneyProvider value={{ journey: publishedGlobalTemplateJourney }}>
          <FormikProvider
            value={
              {
                values: { title: '', description: '', featuredAt: false },
                handleChange
              } as unknown as FormikContextType<TemplateSettingsFormValues>
            }
          >
            <MetadataTabPanel showFeaturedSettings={showFeaturedSettings} />
          </FormikProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.change(getByRole('textbox', { name: 'Title' }), {
      target: { value: 'My Cool Journey' }
    })

    expect(handleChange).toHaveBeenCalled()
    vi.clearAllMocks()
    expect(handleChange).not.toHaveBeenCalled()

    fireEvent.change(getByRole('textbox', { name: 'Description' }), {
      target: { value: 'My cool description' }
    })

    expect(handleChange).toHaveBeenCalled()
    vi.clearAllMocks()
    expect(handleChange).not.toHaveBeenCalled()

    fireEvent.click(getByRole('checkbox', { name: 'Featured' }))
    expect(handleChange).toHaveBeenCalled()
  })

  it('should not show featured checkbox for local template', () => {
    const handleChange = vi.fn()
    const publishedLocalTemplateJourney =
      publishedLocalTemplate as unknown as Journey
    const showFeaturedSettings =
      publishedLocalTemplateJourney.team?.id === 'jfp-team'
    const { queryByRole } = render(
      <MockedProvider>
        <JourneyProvider value={{ journey: publishedLocalTemplateJourney }}>
          <FormikProvider
            value={
              {
                values: { title: '', description: '', featuredAt: false },
                handleChange
              } as unknown as FormikContextType<TemplateSettingsFormValues>
            }
          >
            <MetadataTabPanel showFeaturedSettings={showFeaturedSettings} />
          </FormikProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    expect(
      queryByRole('checkbox', { name: 'Featured' })
    ).not.toBeInTheDocument()
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
                  __typename: 'LanguageName'
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
                  __typename: 'LanguageName'
                },
                {
                  value: 'French',
                  primary: false,
                  __typename: 'LanguageName'
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
                  __typename: 'LanguageName'
                },
                {
                  value: 'German, Standard',
                  primary: false,
                  __typename: 'LanguageName'
                }
              ]
            }
          ]
        }
      }
    }

    const setFieldValue = vi.fn()
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
