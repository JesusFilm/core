import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SnackbarProvider } from 'notistack'

import {
  CREATE_COUNTRY_LANGUAGE,
  DELETE_COUNTRY_LANGUAGE,
  LanguageCountryLinks,
  SEARCH_COUNTRIES,
  UPDATE_COUNTRY_LANGUAGE
} from './LanguageCountryLinks'

const countryLanguages = [
  {
    id: 'country-language-1',
    speakers: 100,
    displaySpeakers: 90,
    primary: true,
    suggested: false,
    order: 1,
    country: {
      id: 'CN',
      name: [{ value: 'China', primary: true, __typename: 'CountryName' }],
      __typename: 'Country'
    },
    __typename: 'CountryLanguage'
  }
]

const searchCountriesMock: MockedResponse = {
  request: {
    query: SEARCH_COUNTRIES,
    variables: { term: 'United', nameLanguageId: '529' }
  },
  result: {
    data: {
      countries: [
        {
          id: 'US',
          name: [
            {
              value: 'United States',
              primary: true,
              __typename: 'CountryName'
            }
          ],
          __typename: 'Country'
        }
      ]
    }
  }
}

const searchChinaMock: MockedResponse = {
  request: {
    query: SEARCH_COUNTRIES,
    variables: { term: 'China', nameLanguageId: '529' }
  },
  result: {
    data: {
      countries: [countryLanguages[0].country]
    }
  }
}

function renderLinks(mocks: MockedResponse[] = [], onChanged = vi.fn()) {
  render(
    <MockedProvider mocks={mocks}>
      <SnackbarProvider>
        <LanguageCountryLinks
          languageId="20615"
          countryLanguages={countryLanguages}
          onChanged={onChanged}
        />
      </SnackbarProvider>
    </MockedProvider>
  )

  return { onChanged }
}

async function searchCountry(term: string): Promise<void> {
  const user = userEvent.setup()
  await user.click(screen.getByRole('combobox', { name: 'Add country' }))
  await user.keyboard(term)

  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 350))
  })
}

describe('LanguageCountryLinks', () => {
  it('should render linked countries', () => {
    renderLinks()

    expect(screen.getByText('China')).toBeInTheDocument()
    expect(screen.getByText('CN')).toBeInTheDocument()
    expect(
      screen.getByRole('spinbutton', { name: 'Speakers for CN' })
    ).toHaveValue(100)
    expect(
      screen.getByRole('spinbutton', { name: 'Display speakers for CN' })
    ).toHaveValue(90)
    expect(
      screen.getByRole('checkbox', { name: 'Primary for CN' })
    ).toBeChecked()
    expect(
      screen.getByRole('checkbox', { name: 'Suggested for CN' })
    ).not.toBeChecked()
    expect(screen.getByRole('button', { name: 'Save' })).toHaveClass(
      'MuiButton-colorSecondary'
    )
    expect(screen.getByRole('button', { name: 'Add' })).toHaveClass(
      'MuiButton-colorSecondary'
    )
  })

  it('should order spoken links by speakers before suggested links by order', () => {
    render(
      <MockedProvider mocks={[]}>
        <SnackbarProvider>
          <LanguageCountryLinks
            languageId="20615"
            countryLanguages={[
              {
                ...countryLanguages[0],
                id: 'country-language-suggested-low',
                speakers: 1,
                suggested: true,
                order: 1,
                country: {
                  id: 'BR',
                  name: [
                    {
                      value: 'Brazil',
                      primary: true
                    }
                  ]
                }
              },
              {
                ...countryLanguages[0],
                id: 'country-language-spoken-low',
                speakers: 25,
                suggested: false,
                order: null,
                country: {
                  id: 'US',
                  name: [
                    {
                      value: 'United States',
                      primary: true
                    }
                  ]
                }
              },
              {
                ...countryLanguages[0],
                id: 'country-language-suggested-high',
                speakers: 1,
                suggested: true,
                order: 5,
                country: {
                  id: 'IN',
                  name: [
                    {
                      value: 'India',
                      primary: true
                    }
                  ]
                }
              },
              {
                ...countryLanguages[0],
                id: 'country-language-spoken-high',
                speakers: 200,
                suggested: false,
                order: null,
                country: {
                  id: 'CN',
                  name: [
                    {
                      value: 'China',
                      primary: true
                    }
                  ]
                }
              }
            ]}
            onChanged={vi.fn()}
          />
        </SnackbarProvider>
      </MockedProvider>
    )

    const countryCells = screen
      .getAllByRole('row')
      .slice(1)
      .map((row) => row.querySelector('td')?.textContent)

    expect(countryCells).toEqual([
      'ChinaCN',
      'United StatesUS',
      'IndiaIN',
      'BrazilBR'
    ])
  })

  it('should update a country language link', async () => {
    const onChanged = vi.fn().mockResolvedValue(undefined)
    renderLinks(
      [
        {
          request: {
            query: UPDATE_COUNTRY_LANGUAGE,
            variables: {
              input: {
                id: 'country-language-1',
                speakers: 150,
                displaySpeakers: 90,
                primary: false,
                suggested: false,
                order: 1
              }
            }
          },
          result: {
            data: {
              countryLanguageUpdate: {
                id: 'country-language-1',
                speakers: 150,
                displaySpeakers: 90,
                primary: false,
                suggested: false,
                order: 1,
                __typename: 'CountryLanguage'
              }
            }
          }
        }
      ],
      onChanged
    )

    fireEvent.change(
      screen.getByRole('spinbutton', { name: 'Speakers for CN' }),
      {
        target: { value: '150' }
      }
    )
    fireEvent.click(screen.getByRole('checkbox', { name: 'Primary for CN' }))
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('Country link saved')).toBeInTheDocument()
    expect(onChanged).toHaveBeenCalled()
  })

  it('should add a country language link from country search', async () => {
    const onChanged = vi.fn().mockResolvedValue(undefined)
    renderLinks(
      [
        searchCountriesMock,
        {
          request: {
            query: CREATE_COUNTRY_LANGUAGE,
            variables: {
              input: {
                languageId: '20615',
                countryId: 'US',
                speakers: 250,
                displaySpeakers: null,
                primary: false,
                suggested: false,
                order: null
              }
            }
          },
          result: {
            data: {
              countryLanguageCreate: {
                id: 'country-language-2',
                speakers: 250,
                displaySpeakers: null,
                primary: false,
                suggested: false,
                order: null,
                country: { id: 'US', __typename: 'Country' },
                __typename: 'CountryLanguage'
              }
            }
          }
        }
      ],
      onChanged
    )

    await searchCountry('United')
    fireEvent.click(await screen.findByText('United States'))
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Speakers' }), {
      target: { value: '250' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Add' }))

    expect(await screen.findByText('Country link added')).toBeInTheDocument()
    expect(onChanged).toHaveBeenCalled()
  })

  it('should disable existing country options for the current suggested value', async () => {
    renderLinks([searchChinaMock])

    await searchCountry('China')

    expect(
      await screen.findByRole('option', { name: /China CN/ })
    ).toHaveAttribute('aria-disabled', 'true')
  })

  it('should delete a country language link after confirmation', async () => {
    const onChanged = vi.fn().mockResolvedValue(undefined)
    renderLinks(
      [
        {
          request: {
            query: DELETE_COUNTRY_LANGUAGE,
            variables: { id: 'country-language-1' }
          },
          result: {
            data: {
              countryLanguageDelete: {
                id: 'country-language-1',
                __typename: 'CountryLanguage'
              }
            }
          }
        }
      ],
      onChanged
    )

    fireEvent.click(screen.getByRole('button', { name: 'Delete CN' }))
    expect(await screen.findByText('Remove Country Link')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Remove' }))

    expect(await screen.findByText('Country link removed')).toBeInTheDocument()
    expect(onChanged).toHaveBeenCalled()
  })
})
