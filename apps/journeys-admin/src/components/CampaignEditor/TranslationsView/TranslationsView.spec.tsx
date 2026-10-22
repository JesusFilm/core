import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'
import { GraphQLError } from 'graphql'
import { ComponentProps, ReactElement } from 'react'

import { CAMPAIGN_AI_TRANSLATE_SUBSCRIPTION } from '@core/journeys/ui/useCampaignAiTranslateSubscription'

import { CampaignTranslations_campaignTranslations as Row } from '../../../../__generated__/CampaignTranslations'
import {
  CampaignTextField,
  CampaignTextSource,
  CampaignTranslationFilter,
  CampaignTranslationGroup
} from '../../../../__generated__/globalTypes'
import { CAMPAIGN_TRANSLATION_SET } from '../../../libs/useCampaignTranslationSetMutation'
import {
  CAMPAIGN_TRANSLATIONS,
  rowKey
} from '../../../libs/useCampaignTranslationsQuery'
import {
  CampaignEditorState,
  useCampaignEditor
} from '../CampaignEditorProvider'
import { campaign } from '../data'
import { SelectionProbe, StaticEditor } from '../testing'

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
    needsReview: false,
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
  defaultValue: 'Share the story of Outreach',
  value: "Partagez l'histoire de Campagne",
  source: CampaignTextSource.machine,
  needsReview: true,
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
  defaultValue: 'Outreach 2026',
  target: { ...heroTitle.target }
})
const regionIntro = row({
  group: CampaignTranslationGroup.region,
  field: CampaignTextField.intro,
  maxLength: 500,
  defaultValue: 'A Outreach journey chosen by your regional team.',
  value: 'Un voyage de Campagne.',
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

/** A control that selects a block, as a click on the canvas would. */
function SelectBlockButton({ id }: { id: string }): ReactElement {
  const { selectBlock } = useCampaignEditor()
  return <button onClick={() => selectBlock(id)}>select {id}</button>
}

function renderView(
  mocks: Array<Record<string, unknown>>,
  campaignProp = campaign,
  viewProps: Partial<ComponentProps<typeof TranslationsView>> = {},
  initialState?: Partial<CampaignEditorState>
): ReturnType<typeof render> {
  return render(
    <StaticEditor
      mocks={mocks}
      campaignProp={campaignProp}
      initialState={initialState}
    >
      <SelectionProbe />
      <SelectBlockButton id="regionHeaderId" />
      <TranslationsView
        campaign={campaignProp}
        initialLanguageId={FRENCH}
        {...viewProps}
      />
    </StaticEditor>
  )
}

function visibleRows(): string[] {
  return screen
    .queryAllByTestId(/^TranslationRow-/)
    .map((element) => element.getAttribute('data-testid') as string)
}

describe('TranslationsView', () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn()
  })

  describe('the canvas and the list point at each other', () => {
    it('selects the line’s block on the canvas from its target button', async () => {
      renderView([listMock(FRENCH)])
      await screen.findByTestId('TranslationGroup-landing')

      fireEvent.click(
        within(
          screen.getByTestId(`TranslationRow-${rowKey(heroTitle)}`)
        ).getByRole('button', { name: 'Show on the canvas' })
      )

      expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent('heroId')
      expect(screen.getByTestId('PageKind')).toHaveTextContent('landing')
    })

    it('selects the section that shows an interface phrase, and a region card', async () => {
      renderView([listMock(FRENCH)])
      await screen.findByTestId('TranslationGroup-interface')

      fireEvent.click(
        within(
          screen.getByTestId(`TranslationRow-${rowKey(copyLink)}`)
        ).getByRole('button', { name: 'Show on the canvas' })
      )
      expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
        'regionShareId'
      )

      fireEvent.click(
        within(
          screen.getByTestId(`TranslationRow-${rowKey(europe)}`)
        ).getByRole('button', { name: 'Show on the canvas' })
      )
      expect(screen.getByTestId('SelectedRegionId')).toHaveTextContent(
        'europeRegionId'
      )
    })

    it('marks the lines of the selected block and scrolls to the first', async () => {
      renderView(
        [listMock(FRENCH)],
        campaign,
        {},
        {
          selectedBlockId: 'heroId'
        }
      )
      await screen.findByTestId('TranslationGroup-landing')

      expect(
        screen.getByTestId(`TranslationRow-${rowKey(heroEyebrow)}`)
      ).toHaveAttribute('data-selected', 'true')
      expect(
        screen.getByTestId(`TranslationRow-${rowKey(heroTitle)}`)
      ).toHaveAttribute('data-selected', 'true')
      expect(
        screen.getByTestId(`TranslationRow-${rowKey(copyLink)}`)
      ).not.toHaveAttribute('data-selected')
      await waitFor(() =>
        expect(Element.prototype.scrollIntoView).toHaveBeenCalled()
      )
    })

    it('widens the filter to All when it hid the lines of what was just selected', async () => {
      renderView([listMock(FRENCH)])
      await screen.findByTestId('TranslationGroup-region')
      fireEvent.click(screen.getByRole('button', { name: 'Missing' }))
      expect(
        screen.queryByTestId(`TranslationRow-${rowKey(regionIntro)}`)
      ).toBeNull()

      fireEvent.click(
        screen.getByRole('button', { name: 'select regionHeaderId' })
      )

      expect(
        await screen.findByTestId(`TranslationRow-${rowKey(regionIntro)}`)
      ).toHaveAttribute('data-selected', 'true')
      expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute(
        'aria-pressed',
        'true'
      )
    })
  })

  it('reads the list again once default-language text changes, so new text lands in its place', async () => {
    const newExtra = row({
      group: CampaignTranslationGroup.landing,
      field: CampaignTextField.content,
      maxLength: 500,
      defaultValue: 'A new line of text',
      target: {
        ...heroTitle.target,
        typename: 'CampaignTypographyBlock',
        blockId: 'newTextId'
      }
    })
    const mocks = [listMock(FRENCH), listMock(FRENCH, [...rows, newExtra])]
    const { rerender } = renderView(mocks)
    await screen.findByTestId('TranslationGroup-landing')
    expect(
      screen.queryByTestId(`TranslationRow-${rowKey(newExtra)}`)
    ).toBeNull()

    const changed = {
      ...campaign,
      blocks: campaign.blocks.map((block) =>
        block.id === 'heroId' ? { ...block, title: 'A new hero title' } : block
      )
    }
    rerender(
      <StaticEditor mocks={mocks} campaignProp={changed}>
        <SelectionProbe />
        <SelectBlockButton id="regionHeaderId" />
        <TranslationsView campaign={changed} initialLanguageId={FRENCH} />
      </StaticEditor>
    )

    expect(
      await screen.findByTestId(
        `TranslationRow-${rowKey(newExtra)}`,
        {},
        {
          timeout: 4000
        }
      )
    ).toBeInTheDocument()
  })

  it('does not read the list again for a translation edit, which the row writes itself', async () => {
    const mocks = [listMock(FRENCH)]
    const { rerender } = renderView(mocks)
    await screen.findByTestId('TranslationGroup-landing')

    const translated = {
      ...campaign,
      blocks: campaign.blocks.map((block) =>
        block.id === 'heroId'
          ? {
              ...block,
              titleTranslations: [
                {
                  __typename: 'TranslatedValue' as const,
                  languageId: FRENCH,
                  value: 'Un titre écrit',
                  source: CampaignTextSource.human
                }
              ]
            }
          : block
      )
    }
    rerender(
      <StaticEditor mocks={mocks} campaignProp={translated}>
        <SelectionProbe />
        <SelectBlockButton id="regionHeaderId" />
        <TranslationsView campaign={translated} initialLanguageId={FRENCH} />
      </StaticEditor>
    )
    await act(() => new Promise((resolve) => setTimeout(resolve, 2000)))

    // A second read would have no mock and would surface as an error.
    expect(screen.queryByRole('alert')).toBeNull()
    expect(
      screen.getByTestId(`TranslationRow-${rowKey(heroTitle)}`)
    ).toBeInTheDocument()
  })

  it('shows the one-time notice that promoted machine values lost their flag, and closes it', async () => {
    const onPromotionNoticeClose = vi.fn()
    renderView([listMock(FRENCH)], campaign, {
      showPromotionNotice: true,
      onPromotionNoticeClose
    })

    const notice = screen.getByTestId('TranslationsPromotionNotice')
    expect(notice).toHaveTextContent('no longer marked as machine-translated')
    fireEvent.click(within(notice).getByRole('button', { name: 'Close' }))
    expect(onPromotionNoticeClose).toHaveBeenCalled()
    await screen.findByTestId('TranslationGroup-interface')
  })

  it('shows no notice by default', async () => {
    renderView([listMock(FRENCH)])

    await screen.findByTestId('TranslationGroup-interface')
    expect(
      screen.queryByTestId('TranslationsPromotionNotice')
    ).not.toBeInTheDocument()
  })

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
    expect(screen.getByText('Share the story of Outreach')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Hero · Title' })).toHaveValue(
      "Partagez l'histoire de Campagne"
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
    ['Needs review', 1],
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
    const write = setMock(heroTitle, FRENCH, 'Partagez Campagne', [
      { languageId: FRENCH, value: 'Partagez Campagne' }
    ])
    renderView([listMock(FRENCH), write])
    await screen.findByTestId('TranslationGroup-landing')
    fireEvent.click(screen.getByRole('button', { name: 'Needs review' }))
    expect(visibleRows()).toHaveLength(1)

    const field = screen.getByRole('textbox', { name: 'Hero · Title' })
    fireEvent.change(field, { target: { value: '  Partagez Campagne ' } })
    fireEvent.blur(field)

    await waitFor(() => expect(write.result).toHaveBeenCalled())
    await waitFor(() => expect(visibleRows()).toHaveLength(0))
    fireEvent.click(screen.getByRole('button', { name: 'Edited' }))
    const edited = screen.getByTestId(
      'TranslationRow-CampaignHeroBlock:heroId:title'
    )
    expect(within(edited).getByText('Edited')).toBeInTheDocument()
    expect(within(edited).getByRole('textbox')).toHaveValue('Partagez Campagne')
  })

  it('moves a missing line to Edited once it is written', async () => {
    const write = setMock(heroEyebrow, FRENCH, 'Campagne 2026', [
      { languageId: FRENCH, value: 'Campagne 2026' }
    ])
    renderView([listMock(FRENCH), write])
    await screen.findByTestId('TranslationGroup-landing')
    fireEvent.click(screen.getByRole('button', { name: 'Missing' }))

    const field = screen.getByRole('textbox', { name: 'Hero · Eyebrow' })
    fireEvent.change(field, { target: { value: 'Campagne 2026' } })
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
    const write = setMock(
      heroTitle,
      FRENCH,
      "Partagez l'histoire de Campagne",
      []
    )
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
    expect(field).toHaveValue("Partagez l'histoire de Campagne")
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

  it('sets the field language and reading direction from the selected language', async () => {
    const withArabic = {
      ...campaign,
      languages: campaign.languages.map((language) =>
        language.languageId === FRENCH
          ? { ...language, language: { ...language.language, bcp47: 'ar' } }
          : language
      )
    }
    renderView([listMock(FRENCH)], withArabic)
    await screen.findByTestId('TranslationGroup-interface')

    const field = screen.getByRole('textbox', { name: 'Region · Name' })
    expect(field).toHaveAttribute('dir', 'rtl')
    expect(field).toHaveAttribute('lang', 'ar')
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

  describe('Machine-translate missing', () => {
    function sweepMock(
      languageId: string,
      outcome: 'complete' | 'error' = 'complete'
    ): Record<string, unknown> & { result: ReturnType<typeof vi.fn> } {
      return {
        request: {
          query: CAMPAIGN_AI_TRANSLATE_SUBSCRIPTION,
          variables: { campaignId: campaign.id, languageId, mode: 'missing' }
        },
        delay: 20,
        ...(outcome === 'error'
          ? { error: new Error('Translation failed') }
          : {}),
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

    it('runs the subscription in mode missing for the selected language, shows progress and reads the result', async () => {
      const sweep = sweepMock(FRENCH)
      const translated = {
        ...heroEyebrow,
        value: 'Campagne 2026',
        source: CampaignTextSource.machine
      }
      renderView([listMock(FRENCH), sweep, listMock(FRENCH, [translated])])
      await screen.findByTestId('TranslationGroup-interface')
      expect(sweep.result).not.toHaveBeenCalled()

      fireEvent.click(
        screen.getByRole('button', { name: 'Machine-translate missing' })
      )

      expect(
        await screen.findByTestId('TranslationsProgress')
      ).toHaveTextContent('Starting translation...')
      expect(
        screen.getByRole('button', { name: 'Machine-translate missing' })
      ).toBeDisabled()
      await waitFor(() => expect(sweep.result).toHaveBeenCalledTimes(1))
      await waitFor(() =>
        expect(screen.queryByTestId('TranslationsProgress')).toBeNull()
      )
      await waitFor(() =>
        expect(
          screen.getByRole('textbox', { name: 'Hero · Eyebrow' })
        ).toHaveValue('Campagne 2026')
      )
      expect(
        screen.getByRole('button', { name: 'Machine-translate missing' })
      ).toBeEnabled()
    })

    it('does not run again after an edit', async () => {
      const sweep = sweepMock(FRENCH)
      const write = setMock(heroTitle, FRENCH, 'Partagez Campagne', [
        { languageId: FRENCH, value: 'Partagez Campagne' }
      ])
      renderView([listMock(FRENCH), sweep, listMock(FRENCH), write])
      await screen.findByTestId('TranslationGroup-interface')
      fireEvent.click(
        screen.getByRole('button', { name: 'Machine-translate missing' })
      )
      await waitFor(() => expect(sweep.result).toHaveBeenCalledTimes(1))
      await waitFor(() =>
        expect(screen.queryByTestId('TranslationsProgress')).toBeNull()
      )

      const field = await screen.findByRole('textbox', { name: 'Hero · Title' })
      fireEvent.change(field, { target: { value: 'Partagez Campagne' } })
      fireEvent.blur(field)

      await waitFor(() => expect(write.result).toHaveBeenCalled())
      expect(sweep.result).toHaveBeenCalledTimes(1)
      expect(screen.queryByTestId('TranslationsProgress')).toBeNull()
    })

    it('shows the failure and lets the author try again', async () => {
      renderView([listMock(FRENCH), sweepMock(FRENCH, 'error')])
      await screen.findByTestId('TranslationGroup-interface')

      fireEvent.click(
        screen.getByRole('button', { name: 'Machine-translate missing' })
      )

      expect(
        await screen.findByTestId('TranslationsTranslateError')
      ).toHaveTextContent('Translation failed')
      expect(screen.queryByTestId('TranslationsProgress')).toBeNull()
      expect(
        screen.getByRole('button', { name: 'Machine-translate missing' })
      ).toBeEnabled()
    })

    it('marks a language the model does not support manual only, with no button', async () => {
      const manualOnly = {
        ...campaign,
        languages: [
          ...campaign.languages,
          {
            __typename: 'CampaignLanguage' as const,
            id: 'campaignLanguageManualId',
            languageId: '9999999',
            order: 2,
            language: {
              __typename: 'Language' as const,
              id: '9999999',
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
        ]
      }
      renderView([listMock('9999999')], manualOnly, {
        initialLanguageId: '9999999'
      })

      expect(
        await screen.findByTestId('TranslationsManualOnly')
      ).toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: 'Machine-translate missing' })
      ).toBeNull()
    })
  })
})
