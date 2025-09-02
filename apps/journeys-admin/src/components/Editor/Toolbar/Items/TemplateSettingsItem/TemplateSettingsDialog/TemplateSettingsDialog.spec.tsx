import { MockedProvider } from '@apollo/client/testing'
import {
  fireEvent,
  getByTestId,
  render,
  waitFor,
  within
} from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'
import { GET_LANGUAGES } from '@core/journeys/ui/useLanguagesQuery'
import { GET_TAGS } from '@core/journeys/ui/useTagsQuery'

import { JOURNEY_SETTINGS_UPDATE } from '../../../../../../libs/useJourneyUpdateMutation/useJourneyUpdateMutation'

import {
  JOURNEY_CUSTOMIZATION_DESCRIPTION_UPDATE,
  JOURNEY_FEATURE_UPDATE,
  TemplateSettingsDialog
} from './TemplateSettingsDialog'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('TemplateSettingsDialog', () => {
  const onClose = jest.fn()

  beforeEach(() => jest.clearAllMocks())

  it('should update field data and close dialog on submit', async () => {
    const updatedJourney = {
      title: 'New Title',
      description: 'New Description',
      strategySlug: 'https://www.canva.com/design/DAFvDBw1z1A/view',
      creatorDescription: null,
      languageId: '529'
    }

    const result = jest.fn(() => ({
      data: {
        journeyUpdate: {
          ...defaultJourney,
          __typename: 'Journey',
          id: defaultJourney.id,
          ...updatedJourney,
          tags: [{ __typename: 'Tag', id: 'tagId' }],
          language: {
            __typename: 'Language',
            id: '529',
            bcp47: 'en',
            iso3: 'eng',
            name: [
              {
                __typename: 'LanguageName',
                value: 'English',
                primary: true
              }
            ]
          },
          website: null,
          showShareButton: null,
          showLikeButton: null,
          showDislikeButton: null,
          displayTitle: null,
          menuButtonIcon: null,
          menuStepBlock: null
        }
      }
    }))

    const result2 = jest.fn(() => ({
      data: {
        journeyCustomizationDescriptionUpdate: {
          id: defaultJourney.id,
          __typename: 'Journey',
          journeyCustomizationDescription: 'New Description'
        }
      }
    }))

    const result3 = jest.fn(() => ({
      data: {
        journeyFeature: {
          id: defaultJourney.id,
          __typename: 'Journey',
          featuredAt: Date.now()
        }
      }
    }))

    const tagResult = jest.fn(() => ({
      data: {
        tags: [
          {
            __typename: 'Tag',
            id: 'parentTagId',
            service: null,
            parentId: null,
            name: [
              {
                value: 'Felt Needs',
                primary: true
              }
            ]
          },
          {
            __typename: 'Tag',
            id: 'tagId',
            service: null,
            parentId: 'parentTagId',
            name: [
              {
                value: 'Acceptance',
                primary: true
              }
            ]
          }
        ]
      }
    }))

    const { getByRole, getAllByRole, getByTestId } = render(
      <MockedProvider
        mocks={[
          {
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
                    slug: 'en',
                    name: [
                      {
                        __typename: 'LanguageName',
                        value: 'English',
                        primary: true
                      }
                    ]
                  },
                  {
                    __typename: 'Language',
                    id: '496',
                    slug: 'fr',
                    name: [
                      {
                        __typename: 'LanguageName',
                        value: 'Français',
                        primary: true
                      },
                      {
                        __typename: 'LanguageName',
                        value: 'French',
                        primary: false
                      }
                    ]
                  }
                ]
              }
            }
          },
          {
            request: {
              query: GET_TAGS
            },
            result: tagResult
          },
          {
            request: {
              query: JOURNEY_SETTINGS_UPDATE,
              variables: {
                id: defaultJourney.id,
                input: {
                  ...updatedJourney,
                  tagIds: ['tagId'],
                  creatorDescription: '',
                  languageId: '529'
                }
              }
            },
            result
          },
          {
            request: {
              query: JOURNEY_CUSTOMIZATION_DESCRIPTION_UPDATE,
              variables: {
                journeyId: defaultJourney.id,
                string: ''
              }
            },
            result: result2
          },
          {
            request: {
              query: JOURNEY_FEATURE_UPDATE,
              variables: {
                id: defaultJourney.id,
                feature: true
              }
            },
            result: result3
          }
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: {
                ...defaultJourney,
                creatorDescription: '',
                strategySlug: ''
              },
              variant: 'admin'
            }}
          >
            <TemplateSettingsDialog open onClose={onClose} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.change(getAllByRole('textbox')[0], {
      target: { value: 'New Title' }
    })
    fireEvent.change(getAllByRole('textbox')[1], {
      target: { value: 'New Description' }
    })
    fireEvent.click(getByRole('checkbox'))

    fireEvent.click(getByRole('tab', { name: 'About' }))

    fireEvent.change(
      getByTestId('StrategySlugEdit')?.querySelector(
        'input'
      ) as HTMLInputElement,
      {
        target: { value: 'https://www.canva.com/design/DAFvDBw1z1A/view' }
      }
    )

    fireEvent.click(getByRole('tab', { name: 'Categories' }))

    await waitFor(() => {
      expect(getByRole('combobox')).toBeInTheDocument()
    })

    fireEvent.click(getAllByRole('button', { name: 'Open' })[0])
    fireEvent.click(
      within(getByRole('option', { name: 'Acceptance' })).getByRole('checkbox')
    )

    fireEvent.click(getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(result).toHaveBeenCalled()
      expect(result2).toHaveBeenCalled()
      expect(result3).toHaveBeenCalled()
      expect(onClose).toHaveBeenCalled()
    })
  })

  it('should change and update template language', async () => {
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
              slug: 'en',
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
              slug: 'fr',
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
              slug: 'de',
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

    const result = jest.fn(() => ({
      data: {
        journeyUpdate: {
          ...defaultJourney,
          __typename: 'Journey',
          id: defaultJourney.id,
          tags: [{ __typename: 'Tag', id: 'tagId' }],
          language: {
            __typename: 'Language',
            id: '496',
            bcp47: 'fr',
            iso3: 'fra',
            name: [
              {
                __typename: 'LanguageName',
                value: 'Français',
                primary: true
              },
              {
                __typename: 'LanguageName',
                value: 'French',
                primary: false
              }
            ]
          },
          website: null,
          showShareButton: null,
          showLikeButton: null,
          showDislikeButton: null,
          displayTitle: null,
          menuButtonIcon: null,
          menuStepBlock: null
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          getLanguagesMock,
          {
            request: { query: GET_TAGS },
            result: { data: { tags: [] } }
          },
          {
            request: {
              query: JOURNEY_SETTINGS_UPDATE,
              variables: {
                id: 'journey-id',
                input: {
                  title: 'Journey Heading',
                  description: 'Description',
                  strategySlug: null,
                  tagIds: [],
                  creatorDescription: null,
                  languageId: '496'
                }
              }
            },
            result
          }
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: defaultJourney,
              variant: 'admin'
            }}
          >
            <TemplateSettingsDialog open onClose={onClose} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.focus(getByRole('combobox'))
    fireEvent.keyDown(getByRole('combobox'), { key: 'ArrowDown' })
    await waitFor(() =>
      expect(getByRole('option', { name: 'English' })).toBeInTheDocument()
    )
    fireEvent.click(getByRole('option', { name: 'French Français' }))
    fireEvent.click(getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should update case study to a google slides embed link', async () => {
    const updatedJourney = {
      title: defaultJourney.title,
      description: defaultJourney.description,
      strategySlug:
        'https://docs.google.com/presentation/d/e/2PACX-1vR9RRy1myecVCtOG06olCS7M4h2eEsVDrNdp_17Z1KjRpY0HieSnK5SFEWjDaE6LZR9kBbVm4hQOsr7/pub?start=false&loop=false&delayms=3000',
      tagIds: [],
      creatorDescription: null,
      languageId: '529'
    }

    const result = jest.fn(() => ({
      data: {
        journeyUpdate: {
          ...defaultJourney,
          __typename: 'Journey',
          id: defaultJourney.id,
          ...updatedJourney,
          language: defaultJourney.language,
          tags: defaultJourney.tags,
          website: null,
          showShareButton: null,
          showLikeButton: null,
          showDislikeButton: null,
          displayTitle: null,
          menuButtonIcon: null,
          menuStepBlock: null
        }
      }
    }))

    const result2 = jest.fn(() => ({
      data: {
        journeyCustomizationDescriptionUpdate: {
          id: defaultJourney.id,
          __typename: 'Journey',
          journeyCustomizationDescription: ''
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
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
                    slug: 'en',
                    name: [
                      {
                        __typename: 'LanguageName',
                        value: 'English',
                        primary: true
                      }
                    ]
                  }
                ]
              }
            }
          },
          {
            request: { query: GET_TAGS },
            result: { data: { tags: [] } }
          },
          {
            request: {
              query: JOURNEY_SETTINGS_UPDATE,
              variables: {
                id: defaultJourney.id,
                input: updatedJourney
              }
            },
            result
          },
          {
            request: {
              query: JOURNEY_CUSTOMIZATION_DESCRIPTION_UPDATE,
              variables: {
                journeyId: defaultJourney.id,
                string: ''
              }
            },
            result: result2
          }
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: defaultJourney,
              variant: 'admin'
            }}
          >
            <TemplateSettingsDialog open onClose={onClose} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('tab', { name: 'About' }))

    fireEvent.change(getByRole('textbox', { name: 'Paste URL here' }), {
      target: {
        value:
          'https://docs.google.com/presentation/d/e/2PACX-1vR9RRy1myecVCtOG06olCS7M4h2eEsVDrNdp_17Z1KjRpY0HieSnK5SFEWjDaE6LZR9kBbVm4hQOsr7/pub?start=false&loop=false&delayms=3000'
      }
    })

    fireEvent.click(getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(result).toHaveBeenCalled()
    })
    expect(onClose).toHaveBeenCalled()
  })

  it('should validate on invalid embed url', async () => {
    const { getByRole, getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: { query: GET_LANGUAGES, variables: { languageId: '529' } },
            result: {
              data: {
                languages: [
                  {
                    __typename: 'Language',
                    id: '529',
                    slug: 'en',
                    name: [
                      {
                        __typename: 'LanguageName',
                        value: 'English',
                        primary: true
                      }
                    ]
                  }
                ]
              }
            }
          }
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: {
                ...defaultJourney,
                creatorDescription: '',
                strategySlug: ''
              },
              variant: 'admin'
            }}
          >
            <TemplateSettingsDialog open onClose={onClose} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('tab', { name: 'About' }))
    const textField = getByRole('textbox', { name: 'Paste URL here' })
    fireEvent.change(textField, {
      target: { value: 'www.canva.com/123' }
    })
    fireEvent.submit(getByRole('textbox', { name: 'Paste URL here' }))

    await waitFor(() =>
      expect(getByText('Invalid embed link')).toBeInTheDocument()
    )
  })

  it('shows error alert when any field fails to update', async () => {
    const { getByRole, getByText, getAllByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: { query: GET_LANGUAGES, variables: { languageId: '529' } },
            result: {
              data: {
                languages: [
                  {
                    __typename: 'Language',
                    id: '529',
                    slug: 'en',
                    name: [
                      {
                        __typename: 'LanguageName',
                        value: 'English',
                        primary: true
                      }
                    ]
                  }
                ]
              }
            }
          },
          {
            request: {
              query: JOURNEY_SETTINGS_UPDATE,
              variables: {
                id: defaultJourney.id,
                input: {
                  title: 'New Title',
                  description: 'New Description'
                }
              }
            },
            result: {
              data: {
                journeyUpdate: {
                  id: defaultJourney.id,
                  __typename: 'Journey',
                  title: 'New Title',
                  description: 'New Description'
                }
              }
            }
          }
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: defaultJourney,
              variant: 'admin'
            }}
          >
            <TemplateSettingsDialog open onClose={onClose} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.change(getAllByRole('textbox')[1], {
      target: { value: 'New Description' }
    })
    fireEvent.click(getByRole('button', { name: 'Save' }))
    await waitFor(() =>
      expect(
        getByText('Field update failed. Reload the page or try again.')
      ).toBeInTheDocument()
    )
  })

  it('calls on close and resets form when dialog is closed', async () => {
    const { getByRole, getAllByRole } = render(
      <MockedProvider mocks={[]}>
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: defaultJourney,
              variant: 'admin'
            }}
          >
            <TemplateSettingsDialog open onClose={onClose} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.change(getAllByRole('textbox')[0], {
      target: { value: 'some title that wont be saved' }
    })
    expect(getAllByRole('textbox')[0]).toHaveValue(
      'some title that wont be saved'
    )

    fireEvent.change(getAllByRole('textbox')[1], {
      target: { value: 'some description that wont be saved' }
    })
    expect(getAllByRole('textbox')[1]).toHaveValue(
      'some description that wont be saved'
    )

    fireEvent.click(getByRole('button', { name: 'Cancel' }))

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled()
      expect(getAllByRole('textbox')[1]).toHaveValue(defaultJourney.description)
      expect(getAllByRole('textbox')[0]).toHaveValue(defaultJourney.title)
    })
  })

  it('switches between tabs', async () => {
    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: { query: GET_LANGUAGES, variables: { languageId: '529' } },
            result: {
              data: {
                languages: [
                  {
                    __typename: 'Language',
                    id: '529',
                    slug: 'en',
                    name: [
                      {
                        __typename: 'LanguageName',
                        value: 'English',
                        primary: true
                      }
                    ]
                  }
                ]
              }
            }
          },
          {
            request: { query: GET_TAGS },
            result: { data: { tags: [] } }
          }
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: defaultJourney,
              variant: 'admin'
            }}
          >
            <TemplateSettingsDialog open onClose={onClose} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('tab', { name: 'Categories' }))

    await waitFor(() => {
      expect(getByRole('tab', { selected: true })).toHaveTextContent(
        'Categories'
      )
    })
  })
})
