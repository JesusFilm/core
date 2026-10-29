import { MockLink } from '@apollo/client/testing'
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'
import { GraphQLError } from 'graphql'
import { ReactElement } from 'react'

import { CAMPAIGN_AI_TRANSLATE_SUBSCRIPTION } from '@core/journeys/ui/useCampaignAiTranslateSubscription'
import { GET_LANGUAGES } from '@core/journeys/ui/useLanguagesQuery'

import { GetCampaign_campaign as Campaign } from '../../../../__generated__/GetCampaign'
import { CAMPAIGN_LANGUAGE_ADD } from '../../../libs/useCampaignLanguageAddMutation'
import { CAMPAIGN_LANGUAGE_REMOVE } from '../../../libs/useCampaignLanguageRemoveMutation'
import { useCampaignEditor } from '../CampaignEditorProvider'
import { campaign } from '../data'
import {
  CommandProbe,
  SpyMock,
  StaticEditor,
  holdRequests,
  landRequests
} from '../testing'

import { LanguagesPanel, languageNames } from './LanguagesPanel'

const SPANISH = '21028'
const MANUAL_ONLY = '9999999'

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
        },
        {
          __typename: 'Language',
          id: MANUAL_ONLY,
          slug: 'rare',
          name: [{ __typename: 'LanguageName', value: 'Rare', primary: true }]
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

function sweepMock(languageId: string): SpyMock {
  return {
    request: {
      query: CAMPAIGN_AI_TRANSLATE_SUBSCRIPTION,
      variables: { campaignId: campaign.id, languageId, mode: 'missing' }
    },
    delay: 20,
    result: vi.fn(() => ({
      data: {
        campaignAiTranslateSubscription: {
          __typename: 'CampaignAiTranslateProgress',
          progress: 100,
          message: 'Translation completed!',
          translatedCount: 1,
          campaign: {
            __typename: 'Campaign',
            id: campaign.id,
            titleTranslations: []
          }
        }
      }
    }))
  }
}

function PreviewLanguageProbe(): ReactElement {
  const {
    state: { previewLanguageId }
  } = useCampaignEditor()
  return <span data-testid="PreviewLanguageId">{previewLanguageId}</span>
}

function renderPanel(
  mocks: MockLink.MockedResponse[],
  campaignProp: Campaign = campaign
): ReturnType<typeof render> {
  return render(
    <StaticEditor mocks={[languagesMock, ...mocks]} campaign={campaignProp}>
      <CommandProbe />
      <PreviewLanguageProbe />
      <LanguagesPanel campaign={campaignProp} />
    </StaticEditor>
  )
}

describe('LanguagesPanel', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lists the campaign languages in order by autonym, marking the default, with Remove disabled on it', () => {
    renderPanel([])
    const list = screen.getByTestId('CampaignLanguagesList')
    const rows = within(list).getAllByRole('listitem')
    expect(rows.map((row) => row.textContent)).toEqual([
      'EnglishDefault · Previewing',
      'Français'
    ])
    expect(
      screen.getByRole('button', { name: 'Remove English' })
    ).toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'Remove Français' })
    ).toBeEnabled()
  })

  it('previews a language from its row, marking it, without adding a Command', () => {
    renderPanel([])
    expect(screen.getByTestId('CampaignLanguage-529')).toHaveTextContent(
      'Previewing'
    )

    fireEvent.click(screen.getByRole('button', { name: 'Preview Français' }))

    expect(screen.getByTestId('PreviewLanguageId')).toHaveTextContent('496')
    expect(screen.getByTestId('CampaignLanguage-496')).toHaveTextContent(
      'Previewing'
    )
    expect(screen.getByTestId('CampaignLanguage-529')).not.toHaveTextContent(
      'Previewing'
    )
    expect(
      screen.getByRole('button', { name: 'Preview Français' })
    ).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('0')
  })

  it('keeps the Preview Language when a language is added', async () => {
    renderPanel([addMock, sweepMock(SPANISH)])
    const input = await screen.findByRole('combobox')
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'Span' } })
    fireEvent.click((await screen.findAllByRole('option'))[0])

    await waitFor(() => expect(addResult).toHaveBeenCalled())
    expect(screen.getByTestId('PreviewLanguageId')).toHaveTextContent('529')
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
    renderPanel([addMock, sweepMock(SPANISH)])
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

  it('asks before removing a language, naming what goes with it, and sends nothing yet', async () => {
    const remove = removeMock('496')
    renderPanel([remove])

    await holdRequests(() =>
      fireEvent.click(screen.getByRole('button', { name: 'Remove Français' }))
    )

    const dialog = screen.getByTestId('LanguageRemoveDialog')
    expect(dialog).toHaveTextContent('Remove Français?')
    expect(dialog).toHaveTextContent(
      'Every translation into Français is deleted.'
    )
    expect(dialog).toHaveTextContent('This cannot be undone.')
    await landRequests()
    expect(remove.result).not.toHaveBeenCalled()
  })

  it('removes a non-default language through campaignLanguageRemove once confirmed', async () => {
    const remove = removeMock('496')
    renderPanel([remove])

    fireEvent.click(screen.getByRole('button', { name: 'Remove Français' }))
    fireEvent.click(
      within(screen.getByTestId('LanguageRemoveDialog')).getByRole('button', {
        name: 'Remove'
      })
    )

    await waitFor(() => expect(remove.result).toHaveBeenCalled())
    await waitFor(() =>
      expect(
        screen.queryByTestId('LanguageRemoveDialog')
      ).not.toBeInTheDocument()
    )
    expect(screen.queryByTestId('CampaignLanguagesError')).toBeNull()
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('0')
  })

  it('does not remove the language when the confirmation is cancelled', async () => {
    const remove = removeMock('496')
    renderPanel([remove])

    fireEvent.click(screen.getByRole('button', { name: 'Remove Français' }))
    fireEvent.click(
      within(screen.getByTestId('LanguageRemoveDialog')).getByRole('button', {
        name: 'Cancel'
      })
    )

    await waitFor(() =>
      expect(
        screen.queryByTestId('LanguageRemoveDialog')
      ).not.toBeInTheDocument()
    )
    expect(remove.result).not.toHaveBeenCalled()
    expect(screen.getByTestId('CampaignLanguage-496')).toBeInTheDocument()
  })

  it("shows the API's CONFLICT message verbatim when a removal is refused", async () => {
    const message = 'languageId is the last language and cannot be removed'
    const remove = removeMock('496', message)
    renderPanel([remove])

    fireEvent.click(screen.getByRole('button', { name: 'Remove Français' }))
    fireEvent.click(
      within(screen.getByTestId('LanguageRemoveDialog')).getByRole('button', {
        name: 'Remove'
      })
    )

    expect(
      await screen.findByTestId('CampaignLanguagesError')
    ).toHaveTextContent(message)
  })

  describe('machine translation of a new language', () => {
    const manualOnlyRow = {
      __typename: 'CampaignLanguage' as const,
      id: 'campaignLanguageRareId',
      languageId: MANUAL_ONLY,
      order: 2,
      language: {
        __typename: 'Language' as const,
        id: MANUAL_ONLY,
        bcp47: null,
        name: [
          {
            __typename: 'LanguageName' as const,
            value: 'Rare',
            primary: true
          }
        ]
      }
    }

    async function addLanguage(name: string): Promise<void> {
      const input = await screen.findByRole('combobox')
      fireEvent.focus(input)
      fireEvent.change(input, { target: { value: name } })
      fireEvent.click(await screen.findByRole('option'))
    }

    it('runs the missing sweep for an added language, with progress', async () => {
      const sweep = sweepMock(SPANISH)
      renderPanel([addMock, sweep])

      await addLanguage('Span')

      expect(
        await screen.findByTestId('CampaignLanguageSweep')
      ).toHaveTextContent('Starting translation...')
      await waitFor(() => expect(sweep.result).toHaveBeenCalledTimes(1))
      await waitFor(() =>
        expect(screen.queryByTestId('CampaignLanguageSweep')).toBeNull()
      )
      expect(screen.queryByTestId('CampaignLanguagesError')).toBeNull()
    })

    it('shows a failed sweep and keeps the language', async () => {
      renderPanel([
        addMock,
        {
          ...sweepMock(SPANISH),
          result: undefined,
          error: new Error('Translation failed')
        }
      ])

      await addLanguage('Span')

      expect(
        await screen.findByTestId('CampaignLanguagesError')
      ).toHaveTextContent('Translation failed')
      expect(screen.queryByTestId('CampaignLanguageSweep')).toBeNull()
    })

    it('adds a language the model does not support without a sweep, marked manual only', async () => {
      const rareAdd = {
        request: {
          query: CAMPAIGN_LANGUAGE_ADD,
          variables: { campaignId: campaign.id, languageId: MANUAL_ONLY }
        },
        result: vi.fn(() => ({
          data: {
            campaignLanguageAdd: {
              __typename: 'Campaign',
              id: campaign.id,
              languages: [...campaign.languages, manualOnlyRow]
            }
          }
        }))
      }
      const sweep = sweepMock(MANUAL_ONLY)
      renderPanel([rareAdd, sweep])

      await addLanguage('Rare')

      await waitFor(() => expect(rareAdd.result).toHaveBeenCalled())
      expect(screen.queryByTestId('CampaignLanguageSweep')).toBeNull()
      expect(sweep.result).not.toHaveBeenCalled()
    })

    it('marks listed languages the model does not support as manual only', () => {
      renderPanel([], {
        ...campaign,
        languages: [...campaign.languages, manualOnlyRow]
      })

      expect(
        screen.getByTestId(`CampaignLanguage-${MANUAL_ONLY}`)
      ).toHaveTextContent('RareManual only')
      expect(screen.getByTestId('CampaignLanguage-496')).not.toHaveTextContent(
        'Manual only'
      )
    })
  })
})
