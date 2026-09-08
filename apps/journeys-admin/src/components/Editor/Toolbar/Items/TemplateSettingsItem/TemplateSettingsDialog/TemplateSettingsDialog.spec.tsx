import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing/react'
import { fireEvent, render, waitFor, within } from '@testing-library/react'
import { GraphQLError } from 'graphql'
import { SnackbarProvider } from 'notistack'
import { ReactElement } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import {
  defaultJourney,
  publishedLocalTemplate
} from '@core/journeys/ui/TemplateView/data'
import { GET_LANGUAGES } from '@core/journeys/ui/useLanguagesQuery'
import { GET_TAGS } from '@core/journeys/ui/useTagsQuery'

import { JOURNEY_SETTINGS_UPDATE } from '../../../../../../libs/useJourneyUpdateMutation/useJourneyUpdateMutation'

import {
  JOURNEY_CUSTOMIZATION_DESCRIPTION_UPDATE,
  JOURNEY_FEATURE_UPDATE,
  TemplateSettingsDialog
} from './TemplateSettingsDialog'

vi.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('TemplateSettingsDialog', () => {
  const onClose = vi.fn()

  beforeEach(() => vi.clearAllMocks())

  it('should update field data and close dialog on submit', async () => {
    // NES-1678: strategy section UI removed. The form still carries
    // `strategySlug` from `journey.strategySlug` through to the mutation
    // input (round-trip), so the mock here mirrors the journey's empty
    // initial value rather than asserting on a user-edited Canva URL.
    const updatedJourney = {
      title: 'New Title',
      description: 'New Description',
      strategySlug: '',
      creatorDescription: null,
      languageId: '529'
    }

    const result = vi.fn(() => ({
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

    const result2 = vi.fn(() => ({
      data: {
        journeyCustomizationDescriptionUpdate: {
          id: defaultJourney.id,
          __typename: 'Journey',
          journeyCustomizationDescription: 'New Description'
        }
      }
    }))

    const result3 = vi.fn(() => ({
      data: {
        journeyFeature: {
          id: defaultJourney.id,
          __typename: 'Journey',
          featuredAt: Date.now()
        }
      }
    }))

    const tagResult = vi.fn(() => ({
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

    const { getByRole, getAllByRole } = render(
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
              renderMode: 'admin'
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

    const result = vi.fn(() => ({
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
              renderMode: 'admin'
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

  // NES-1678: the previous `should update case study to a google slides
  // embed link` and `should validate on invalid embed url` tests were
  // removed alongside the strategy section UI. The form still carries
  // `strategySlug` through to the mutation input, but there's no editing
  // surface left and no validation rule to assert against.

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
              renderMode: 'admin'
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
              renderMode: 'admin'
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
              renderMode: 'admin'
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

  it('should not render categories tab for local template', () => {
    const { queryByRole } = render(
      <MockedProvider>
        <JourneyProvider value={{ journey: publishedLocalTemplate }}>
          <TemplateSettingsDialog open onClose={onClose} />
        </JourneyProvider>
      </MockedProvider>
    )
    expect(queryByRole('tab', { name: 'Categories' })).not.toBeInTheDocument()
  })

  // QA-564: the checkbox was uncontrolled (defaultChecked), so its visual
  // state could diverge from Formik's — a cache-driven reinitialize would
  // reset values.featured while the box still displayed the user's tick,
  // making Save skip journeyFeature and report success without saving.
  it('keeps the featured checkbox in sync with journey.featuredAt', async () => {
    const tree = (featuredAt: string | null): ReactElement => (
      <MockedProvider mocks={[]}>
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: { ...defaultJourney, featuredAt },
              renderMode: 'admin'
            }}
          >
            <TemplateSettingsDialog open onClose={onClose} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    const { getByRole, rerender } = render(tree(null))
    expect(getByRole('checkbox')).not.toBeChecked()

    rerender(tree('2026-08-20T00:00:00.000Z'))
    await waitFor(() => expect(getByRole('checkbox')).toBeChecked())
  })

  // QA-564: the reported symptom — user ticks the box, a cache-driven
  // reinitialize resets Formik's values, and the (previously uncontrolled)
  // box kept displaying the tick, so Save saw "no change" and skipped
  // journeyFeature while reporting success. The controlled box must snap
  // back so display and form state never diverge.
  it('snaps the checkbox back when a reinitialize resets the form mid-edit', async () => {
    const tree = (journey: typeof defaultJourney): ReactElement => (
      <MockedProvider mocks={[]}>
        <SnackbarProvider>
          <JourneyProvider value={{ journey, renderMode: 'admin' }}>
            <TemplateSettingsDialog open onClose={onClose} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    const { getByRole, rerender } = render(tree(defaultJourney))
    fireEvent.click(getByRole('checkbox'))
    expect(getByRole('checkbox')).toBeChecked()

    // A translation-poll/cache update changes another field while
    // featuredAt is still null — enableReinitialize resets the form.
    rerender(tree({ ...defaultJourney, title: 'Updated Title' }))
    await waitFor(() => expect(getByRole('checkbox')).not.toBeChecked())
  })

  // QA-564: mutations run via Promise.allSettled so one failure cannot
  // silently drop the others — a journeyFeature rejection must not lose the
  // user's customization edit.
  it('still saves the customization description when journeyFeature fails', async () => {
    const journeyUpdateResult = vi.fn(() => ({
      data: {
        journeyUpdate: {
          __typename: 'Journey',
          id: defaultJourney.id,
          title: defaultJourney.title,
          description: defaultJourney.description
        }
      }
    }))
    const customizationResult = vi.fn(() => ({
      data: { journeyCustomizationFieldPublisherUpdate: [] }
    }))

    const { getByRole, getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_SETTINGS_UPDATE,
              variables: {
                id: defaultJourney.id,
                input: {
                  title: defaultJourney.title,
                  description: defaultJourney.description,
                  strategySlug: null,
                  tagIds: [],
                  creatorDescription: null,
                  languageId: '529'
                }
              }
            },
            result: journeyUpdateResult
          },
          {
            request: {
              query: JOURNEY_CUSTOMIZATION_DESCRIPTION_UPDATE,
              variables: { journeyId: defaultJourney.id, string: '' }
            },
            result: customizationResult
          },
          {
            request: {
              query: JOURNEY_FEATURE_UPDATE,
              variables: { id: defaultJourney.id, feature: true }
            },
            // GraphQL error, not a network error — models the real ACL
            // rejection shape and exercises the generic-message branch.
            result: {
              errors: [
                new GraphQLError('user is not allowed to update featured date')
              ]
            }
          }
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider
            value={{ journey: defaultJourney, renderMode: 'admin' }}
          >
            <TemplateSettingsDialog open onClose={onClose} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('checkbox'))
    fireEvent.click(getByRole('button', { name: 'Save' }))

    await waitFor(() =>
      expect(
        getByText('Something went wrong, please reload the page and try again')
      ).toBeInTheDocument()
    )
    expect(customizationResult).toHaveBeenCalled()
    expect(journeyUpdateResult).toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })

  // QA-564: the cache.modify patch replaced the GetPublisherTemplate refetch
  // and is what keeps journey.journeyCustomizationDescription fresh — without
  // it, saving then reopening the dialog shows the pre-save description.
  it('patches journeyCustomizationDescription into the Journey cache entity on save', async () => {
    const cache = new InMemoryCache()
    cache.restore({
      [`Journey:${defaultJourney.id}`]: {
        __typename: 'Journey',
        id: defaultJourney.id,
        journeyCustomizationDescription: 'stale cache value'
      }
    })

    const journeyWithDescription = {
      ...defaultJourney,
      journeyCustomizationDescription: 'Share this with {{ name }}'
    }
    const customizationResult = vi.fn(() => ({
      data: { journeyCustomizationFieldPublisherUpdate: [] }
    }))

    const { getByRole } = render(
      <MockedProvider
        cache={cache}
        mocks={[
          {
            request: {
              query: JOURNEY_SETTINGS_UPDATE,
              variables: {
                id: defaultJourney.id,
                input: {
                  title: defaultJourney.title,
                  description: defaultJourney.description,
                  strategySlug: null,
                  tagIds: [],
                  creatorDescription: null,
                  languageId: '529'
                }
              }
            },
            result: {
              data: {
                journeyUpdate: {
                  __typename: 'Journey',
                  id: defaultJourney.id,
                  title: defaultJourney.title,
                  description: defaultJourney.description
                }
              }
            }
          },
          {
            request: {
              query: JOURNEY_CUSTOMIZATION_DESCRIPTION_UPDATE,
              variables: {
                journeyId: defaultJourney.id,
                string: 'Share this with {{ name }}'
              }
            },
            result: customizationResult
          }
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider
            value={{ journey: journeyWithDescription, renderMode: 'admin' }}
          >
            <TemplateSettingsDialog open onClose={onClose} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(customizationResult).toHaveBeenCalled())
    await waitFor(() =>
      expect(
        cache.extract()[`Journey:${defaultJourney.id}`]
          ?.journeyCustomizationDescription
      ).toBe('Share this with {{ name }}')
    )
  })
})
