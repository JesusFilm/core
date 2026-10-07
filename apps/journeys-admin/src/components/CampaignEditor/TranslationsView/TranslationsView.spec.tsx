import { MockedProvider } from '@apollo/client/testing/react'
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'
import { GraphQLError } from 'graphql'

import { CampaignTranslations_campaignTranslations as Row } from '../../../../__generated__/CampaignTranslations'
import {
  CampaignTextField,
  CampaignTextSource,
  CampaignTranslationFilter,
  CampaignTranslationGroup
} from '../../../../__generated__/globalTypes'
import { CAMPAIGN_TRANSLATION_SET } from '../../../libs/useCampaignTranslationSetMutation'
import { CAMPAIGN_TRANSLATIONS } from '../../../libs/useCampaignTranslationsQuery'
import { campaign } from '../data'

import { TranslationsView } from './TranslationsView'

const FRENCH = '496'
const SPANISH = '21028'

function row(overrides: Partial<Row> & Pick<Row, 'group' | 'field'>): Row {
  return {
    __typename: 'CampaignTranslation',
    maxLength: 150,
    defaultValue: '',
    value: null,
    source: null,
    target: {
      __typename: 'CampaignTranslationTarget',
      typename: 'CampaignHeroBlock',
      blockId: null,
      regionId: null,
      stringId: null,
      campaignId: null
    },
    ...overrides
  }
}

const copyLink = row({
  group: CampaignTranslationGroup.interface,
  field: CampaignTextField.value,
  maxLength: 200,
  defaultValue: 'Copy link',
  value: 'Copier le lien',
  source: CampaignTextSource.machine,
  target: {
    __typename: 'CampaignTranslationTarget',
    typename: 'CampaignString',
    blockId: null,
    regionId: null,
    stringId: 'string-copy',
    campaignId: null
  }
})
const heroTitle = row({
  group: CampaignTranslationGroup.landing,
  field: CampaignTextField.title,
  defaultValue: 'Share the story of Christmas',
  value: "Partagez l'histoire de Noël",
  source: CampaignTextSource.machine,
  target: {
    ...copyLink.target,
    typename: 'CampaignHeroBlock',
    blockId: 'heroId',
    stringId: null
  }
})
const heroEyebrow = row({
  group: CampaignTranslationGroup.landing,
  field: CampaignTextField.eyebrow,
  maxLength: 80,
  defaultValue: 'Christmas 2026',
  target: { ...heroTitle.target }
})
const regionIntro = row({
  group: CampaignTranslationGroup.region,
  field: CampaignTextField.intro,
  maxLength: 500,
  defaultValue: 'A Christmas journey chosen by your regional team.',
  value: 'Un voyage de Noël.',
  source: CampaignTextSource.human,
  target: {
    ...heroTitle.target,
    typename: 'CampaignRegionHeaderBlock',
    blockId: 'regionHeaderId'
  }
})
const europe = row({
  group: CampaignTranslationGroup.regions,
  field: CampaignTextField.name,
  maxLength: 60,
  defaultValue: 'Europe',
  target: {
    ...heroTitle.target,
    typename: 'CampaignRegion',
    blockId: null,
    regionId: 'europeRegionId'
  }
})
// Deliberately out of view order: the view must group, not trust the order.
const rows = [europe, regionIntro, heroEyebrow, heroTitle, copyLink]

function listMock(
  languageId: string,
  result: Row[] = rows
): Record<string, unknown> {
  return {
    request: {
      query: CAMPAIGN_TRANSLATIONS,
      variables: {
        campaignId: campaign.id,
        languageId,
        filter: CampaignTranslationFilter.all
      }
    },
    result: { data: { campaignTranslations: result } }
  }
}

function setMock(
  row: Row,
  languageId: string,
  value: string,
  response: Array<{ languageId: string; value: string }> | string
): Record<string, unknown> {
  return {
    request: {
      query: CAMPAIGN_TRANSLATION_SET,
      variables: {
        input: {
          target: { blockId: row.target.blockId },
          field: row.field,
          languageId,
          value
        }
      }
    },
    result: vi.fn(() =>
      typeof response === 'string'
        ? {
            errors: [
              new GraphQLError(response, {
                extensions: { code: 'BAD_USER_INPUT', field: row.field }
              })
            ]
          }
        : {
            data: {
              campaignTranslationSet: response.map((entry) => ({
                __typename: 'TranslatedValue',
                source: CampaignTextSource.human,
                ...entry
              }))
            }
          }
    )
  }
}

function renderView(
  mocks: Array<Record<string, unknown>>,
  campaignProp = campaign
): ReturnType<typeof render> {
  return render(
    <MockedProvider mocks={mocks as never}>
      <TranslationsView campaign={campaignProp} initialLanguageId={FRENCH} />
    </MockedProvider>
  )
}

function visibleRows(): string[] {
  return screen
    .queryAllByTestId(/^TranslationRow-/)
    .map((element) => element.getAttribute('data-testid') as string)
}

describe('TranslationsView', () => {
  it('groups every line Interface, Landing page, Region page and Regions', async () => {
    renderView([listMock(FRENCH)])

    await screen.findByTestId('TranslationGroup-interface')
    expect(
      screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
    ).toEqual(['Interface', 'Landing page', 'Region page', 'Regions'])
    expect(
      within(screen.getByTestId('TranslationGroup-landing')).getAllByTestId(
        /^TranslationRow-/
      )
    ).toHaveLength(2)
    expect(screen.getByText('Share the story of Christmas')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Hero · Title' })).toHaveValue(
      "Partagez l'histoire de Noël"
    )
    expect(
      screen.getByRole('textbox', { name: 'Interface phrase · Wording' })
    ).toHaveValue('Copier le lien')
    expect(screen.getByRole('textbox', { name: 'Region · Name' })).toHaveValue(
      ''
    )
  })

  it.each([
    ['All', 5],
    ['Needs review', 2],
    ['Machine-translated', 2],
    ['Missing', 2],
    ['Edited', 1]
  ])('filters %s to %i lines', async (label, count) => {
    renderView([listMock(FRENCH)])
    await screen.findByTestId('TranslationGroup-interface')

    fireEvent.click(screen.getByRole('button', { name: label }))

    expect(visibleRows()).toHaveLength(count)
    expect(screen.getByRole('button', { name: label })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })

  it('hides a group with no lines under the filter', async () => {
    renderView([listMock(FRENCH)])
    await screen.findByTestId('TranslationGroup-interface')

    fireEvent.click(screen.getByRole('button', { name: 'Edited' }))

    expect(screen.queryByTestId('TranslationGroup-landing')).toBeNull()
    expect(screen.getByTestId('TranslationGroup-region')).toBeInTheDocument()
  })

  it('writes a human translation on leaving the field and flips the line to Edited live', async () => {
    const write = setMock(heroTitle, FRENCH, 'Partagez Noël', [
      { languageId: FRENCH, value: 'Partagez Noël' }
    ])
    renderView([listMock(FRENCH), write])
    await screen.findByTestId('TranslationGroup-landing')
    fireEvent.click(screen.getByRole('button', { name: 'Needs review' }))
    expect(visibleRows()).toHaveLength(2)

    const field = screen.getByRole('textbox', { name: 'Hero · Title' })
    fireEvent.change(field, { target: { value: '  Partagez Noël ' } })
    fireEvent.blur(field)

    await waitFor(() => expect(write.result).toHaveBeenCalled())
    await waitFor(() => expect(visibleRows()).toHaveLength(1))
    fireEvent.click(screen.getByRole('button', { name: 'Edited' }))
    const edited = screen.getByTestId(
      'TranslationRow-CampaignHeroBlock:heroId:title'
    )
    expect(within(edited).getByText('Edited')).toBeInTheDocument()
    expect(within(edited).getByRole('textbox')).toHaveValue('Partagez Noël')
  })

  it('moves a missing line to Edited once it is written', async () => {
    const write = setMock(heroEyebrow, FRENCH, 'Noël 2026', [
      { languageId: FRENCH, value: 'Noël 2026' }
    ])
    renderView([listMock(FRENCH), write])
    await screen.findByTestId('TranslationGroup-landing')
    fireEvent.click(screen.getByRole('button', { name: 'Missing' }))

    const field = screen.getByRole('textbox', { name: 'Hero · Eyebrow' })
    fireEvent.change(field, { target: { value: 'Noël 2026' } })
    fireEvent.blur(field)

    await waitFor(() => expect(write.result).toHaveBeenCalled())
    await waitFor(() => expect(visibleRows()).toHaveLength(1))
    expect(screen.queryByRole('textbox', { name: 'Hero · Eyebrow' })).toBeNull()
  })

  it('clears the line when the field is emptied', async () => {
    const write = setMock(heroTitle, FRENCH, '', [])
    renderView([listMock(FRENCH), write])
    await screen.findByTestId('TranslationGroup-landing')

    const field = screen.getByRole('textbox', { name: 'Hero · Title' })
    fireEvent.change(field, { target: { value: '' } })
    fireEvent.blur(field)

    await waitFor(() => expect(write.result).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('button', { name: 'Missing' }))
    await waitFor(() => expect(visibleRows()).toHaveLength(3))
  })

  it('does not write when the text is unchanged', async () => {
    const write = setMock(heroTitle, FRENCH, "Partagez l'histoire de Noël", [])
    renderView([listMock(FRENCH), write])
    await screen.findByTestId('TranslationGroup-landing')

    fireEvent.blur(screen.getByRole('textbox', { name: 'Hero · Title' }))

    expect(write.result).not.toHaveBeenCalled()
  })

  it("shows the API's message verbatim and restores the text when a write is refused", async () => {
    const write = setMock(
      heroTitle,
      FRENCH,
      'x'.repeat(10),
      'title must be at most 150 characters'
    )
    renderView([listMock(FRENCH), write])
    await screen.findByTestId('TranslationGroup-landing')

    const field = screen.getByRole('textbox', { name: 'Hero · Title' })
    fireEvent.change(field, { target: { value: 'x'.repeat(10) } })
    fireEvent.blur(field)

    expect(
      await screen.findByText('title must be at most 150 characters')
    ).toBeInTheDocument()
    expect(field).toHaveValue("Partagez l'histoire de Noël")
  })

  it('reads another language when it is picked', async () => {
    const withSpanish = {
      ...campaign,
      languages: [
        ...campaign.languages,
        {
          __typename: 'CampaignLanguage' as const,
          id: 'campaignLanguageEsId',
          languageId: SPANISH,
          order: 2,
          language: {
            __typename: 'Language' as const,
            id: SPANISH,
            bcp47: 'es',
            name: [
              {
                __typename: 'LanguageName' as const,
                value: 'Español',
                primary: true
              }
            ]
          }
        }
      ]
    }
    renderView(
      [
        listMock(FRENCH),
        listMock(SPANISH, [
          { ...europe, value: 'Europa', source: CampaignTextSource.human }
        ])
      ],
      withSpanish
    )
    await screen.findByTestId('TranslationGroup-interface')

    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Language' }))
    fireEvent.click(await screen.findByRole('option', { name: 'Español' }))

    await waitFor(() =>
      expect(
        screen.getByRole('textbox', { name: 'Region · Name' })
      ).toHaveValue('Europa')
    )
    expect(visibleRows()).toHaveLength(1)
  })

  it('offers the default language nothing and asks for a language first', () => {
    renderView([], { ...campaign, languages: [campaign.languages[0]] })

    expect(
      screen.getByText(
        'Add a language to the campaign to start translating it.'
      )
    ).toBeInTheDocument()
    expect(screen.queryByRole('combobox')).toBeNull()
  })
})
