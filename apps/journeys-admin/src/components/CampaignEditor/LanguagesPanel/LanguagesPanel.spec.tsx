import { MockedProvider } from '@apollo/client/testing/react'
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'
import { GraphQLError } from 'graphql'
import { ReactElement } from 'react'

import { CommandProvider, useCommand } from '@core/journeys/ui/CommandProvider'
import { GET_LANGUAGES } from '@core/journeys/ui/useLanguagesQuery'

import { GetCampaign_campaign as Campaign } from '../../../../__generated__/GetCampaign'
import { CAMPAIGN_LANGUAGE_ADD } from '../../../libs/useCampaignLanguageAddMutation'
import { CAMPAIGN_LANGUAGE_REMOVE } from '../../../libs/useCampaignLanguageRemoveMutation'
import { campaign } from '../data'

import { LanguagesPanel, languageNames } from './LanguagesPanel'

const SPANISH = '21028'

const languagesMock = {
  request: { query: GET_LANGUAGES, variables: { languageId: '529' } },
  result: {
    data: {
      languages: [
        {
          __typename: 'Language',
          id: '529',
          slug: 'english',
          name: [
            { __typename: 'LanguageName', value: 'English', primary: true }
          ]
        },
        {
          __typename: 'Language',
          id: '496',
          slug: 'french',
          name: [
            { __typename: 'LanguageName', value: 'Français', primary: true },
            { __typename: 'LanguageName', value: 'French', primary: false }
          ]
        },
        {
          __typename: 'Language',
          id: SPANISH,
          slug: 'spanish',
          name: [
            { __typename: 'LanguageName', value: 'Español', primary: true },
            { __typename: 'LanguageName', value: 'Spanish', primary: false }
          ]
        }
      ]
    }
  }
}

const spanishRow = {
  __typename: 'CampaignLanguage',
  id: 'campaignLanguageEsId',
  languageId: SPANISH,
  order: 2,
  language: {
    __typename: 'Language',
    id: SPANISH,
    bcp47: 'es',
    name: [
      { __typename: 'LanguageName', value: 'Español', primary: true },
      { __typename: 'LanguageName', value: 'Spanish', primary: false }
    ]
  }
}

const addResult = vi.fn(() => ({
  data: {
    campaignLanguageAdd: {
      __typename: 'Campaign',
      id: campaign.id,
      languages: [...campaign.languages, spanishRow]
    }
  }
}))

const addMock = {
  request: {
    query: CAMPAIGN_LANGUAGE_ADD,
    variables: { campaignId: campaign.id, languageId: SPANISH }
  },
  result: addResult
}

function removeMock(languageId: string, error?: string) {
  return {
    request: {
      query: CAMPAIGN_LANGUAGE_REMOVE,
      variables: { campaignId: campaign.id, languageId }
    },
    result: vi.fn(() =>
      error != null
        ? {
            errors: [
              new GraphQLError(error, {
                extensions: { code: 'CONFLICT', field: 'languageId' }
              })
            ]
          }
        : {
            data: {
              campaignLanguageRemove: {
                __typename: 'Campaign',
                id: campaign.id,
                languages: campaign.languages.filter(
                  (language) => language.languageId !== languageId
                )
              }
            }
          }
    )
  }
}

function CommandProbe(): ReactElement {
  const { state } = useCommand()
  return <span data-testid="CommandCount">{state.commands.length}</span>
}

function renderPanel(
  mocks: Array<Record<string, unknown>>,
  campaignProp: Campaign = campaign
): ReturnType<typeof render> {
  return render(
    <MockedProvider mocks={[languagesMock, ...mocks] as never}>
      <CommandProvider>
        <CommandProbe />
        <LanguagesPanel campaign={campaignProp} />
      </CommandProvider>
    </MockedProvider>
  )
}

describe('LanguagesPanel', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lists the campaign languages in order by autonym, marking the default, with Remove disabled on it', () => {
    renderPanel([])
    const list = screen.getByTestId('CampaignLanguagesList')
    const rows = within(list).getAllByRole('listitem')
    expect(rows.map((row) => row.textContent)).toEqual([
      'EnglishDefault',
      'Français'
    ])
    expect(
      screen.getByRole('button', { name: 'Remove English' })
    ).toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'Remove Français' })
    ).toBeEnabled()
  })

  it('shows the autonym with the English name beside it', () => {
    expect(languageNames(spanishRow as Campaign['languages'][number])).toEqual({
      autonym: 'Español',
      localName: 'Spanish'
    })
    expect(languageNames(campaign.languages[0])).toEqual({
      autonym: 'English',
      localName: undefined
    })
  })

  it('adds a language through the language autocomplete with campaignLanguageAdd, offering only languages the campaign lacks, and adds no Command', async () => {
    renderPanel([addMock])
    const input = await screen.findByRole('combobox')
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'Span' } })

    const options = await screen.findAllByRole('option')
    expect(options).toHaveLength(1)
    expect(options[0]).toHaveTextContent('Español')
    expect(options[0]).toHaveTextContent('Spanish')

    fireEvent.click(options[0])
    await waitFor(() => expect(addResult).toHaveBeenCalled())
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('0')
  })

  it('removes a non-default language through campaignLanguageRemove', async () => {
    const remove = removeMock('496')
    renderPanel([remove])

    fireEvent.click(screen.getByRole('button', { name: 'Remove Français' }))

    await waitFor(() => expect(remove.result).toHaveBeenCalled())
    expect(screen.queryByTestId('CampaignLanguagesError')).toBeNull()
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('0')
  })

  it("shows the API's CONFLICT message verbatim when a removal is refused", async () => {
    const message = 'languageId is the last language and cannot be removed'
    const remove = removeMock('496', message)
    renderPanel([remove])

    fireEvent.click(screen.getByRole('button', { name: 'Remove Français' }))

    expect(
      await screen.findByTestId('CampaignLanguagesError')
    ).toHaveTextContent(message)
  })
})
