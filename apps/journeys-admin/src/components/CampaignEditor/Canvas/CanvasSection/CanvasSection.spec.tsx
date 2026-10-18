import {
  RenderResult,
  fireEvent,
  render,
  screen,
  waitFor
} from '@testing-library/react'
import { ReactElement } from 'react'

import { transformCampaignBlocks } from '@core/journeys/ui/Campaign'
import { headerLogoBlock } from '@core/journeys/ui/Campaign/testData'

import { GetCampaign_campaign as Campaign } from '../../../../../__generated__/GetCampaign'
import { CampaignPageKind } from '../../../../../__generated__/globalTypes'
import { CAMPAIGN_STRING_UPDATE } from '../../../../libs/useCampaignStringUpdateMutation'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { campaign, campaignWithColumns, campaignWithRegions } from '../../data'
import { newSectionBlock } from '../../sectionTypes'
import { SelectionProbe, StaticEditor, frameBody } from '../../testing'
import { Canvas } from '../Canvas'

import { CanvasBlock, CanvasSection } from './CanvasSection'

function chromeBlock(
  source: Campaign,
  typename: 'CampaignHeaderBlock' | 'CampaignFooterBlock'
): CanvasBlock {
  const chrome = transformCampaignBlocks(
    source.blocks.filter(
      (block) => block.pageId == null && block.regionId == null
    )
  )
  return chrome.find((block) => block.__typename === typename) as CanvasBlock
}

const withLogo: Campaign = {
  ...campaign,
  blocks: [
    ...campaign.blocks.map((block) =>
      block.id === 'headerId'
        ? { ...block, logoBlockId: 'headerLogoId' }
        : block
    ),
    headerLogoBlock as never
  ]
}

const withoutNavButtons: Campaign = {
  ...campaign,
  blocks: campaign.blocks.filter((block) => block.parentBlockId !== 'headerId')
}

const withHeaderText: Campaign = {
  ...campaign,
  blocks: campaign.blocks.map((block) =>
    block.id === 'navResourcesId'
      ? ({
          ...block,
          __typename: 'CampaignTypographyBlock',
          content: 'Not a nav button'
        } as never)
      : block
  )
}

const oneLanguage: Campaign = {
  ...campaign,
  languages: campaign.languages.slice(0, 1)
}

function SelectBlockButton({ blockId }: { blockId: string }): ReactElement {
  const { selectBlock } = useCampaignEditor()
  return (
    <button type="button" onClick={() => selectBlock(blockId)}>
      Select {blockId}
    </button>
  )
}

function renderChrome(
  typename: 'CampaignHeaderBlock' | 'CampaignFooterBlock',
  source: Campaign = campaign,
  selectedBlockId?: string
): RenderResult {
  return render(
    <StaticEditor
      campaignProp={source}
      initialState={{ selectedBlockId, previewLanguageId: '529' }}
    >
      <SelectionProbe />
      <SelectBlockButton blockId="footerId" />
      <CanvasSection block={chromeBlock(source, typename)} />
    </StaticEditor>
  )
}

describe('CanvasSection header', () => {
  describe('CanvasBrandMark', () => {
    it('shows the campaign title while there is no logo', () => {
      renderChrome('CampaignHeaderBlock')

      expect(screen.getByTestId('CanvasBrandMarkTitle')).toHaveTextContent(
        'Christmas 2026'
      )
      expect(
        screen.queryByTestId('CanvasBrandMarkLogo')
      ).not.toBeInTheDocument()
    })

    it('shows the logo with its alt text once one is set', () => {
      renderChrome('CampaignHeaderBlock', withLogo)

      const logo = screen.getByTestId('CanvasBrandMarkLogo')
      expect(logo).toHaveAttribute('src', headerLogoBlock.src)
      expect(logo).toHaveAttribute('alt', 'Christmas logo')
      expect(
        screen.queryByTestId('CanvasBrandMarkTitle')
      ).not.toBeInTheDocument()
    })
  })

  describe('CanvasHeaderRow', () => {
    it('lays out the Brand Mark, the nav buttons and the language select', () => {
      renderChrome('CampaignHeaderBlock')

      const row = screen.getByTestId('CanvasHeaderRow')
      expect(row).toContainElement(screen.getByTestId('CanvasBrandMark'))
      expect(row).toContainElement(screen.getByTestId('CanvasHeaderNav'))
      expect(row).toContainElement(screen.getByTestId('CanvasLanguageSelect'))
      expect(screen.getByTestId('CanvasExtra-navHomeId')).toHaveTextContent(
        'Home'
      )
      expect(
        screen.getByTestId('CanvasExtra-navResourcesId')
      ).toHaveTextContent('Resources')
    })

    it('shows the language box without a chevron, and clicking it selects the Header block', () => {
      renderChrome('CampaignHeaderBlock')

      const box = screen.getByTestId('CanvasLanguageSelect')
      expect(box).toHaveTextContent('English')
      expect(box.querySelector('svg')).toBeNull()

      fireEvent.click(box)

      expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
        'headerId'
      )
    })

    it('hides the language select for a single-language campaign', () => {
      renderChrome('CampaignHeaderBlock', oneLanguage)

      expect(
        screen.queryByTestId('CanvasLanguageSelect')
      ).not.toBeInTheDocument()
    })

    it('renders no nav and no menu icon without nav buttons', () => {
      renderChrome('CampaignHeaderBlock', withoutNavButtons)

      expect(screen.queryByTestId('CanvasHeaderNav')).not.toBeInTheDocument()
      expect(
        screen.queryByTestId('CanvasHeaderMenuButton')
      ).not.toBeInTheDocument()
    })

    it('renders only buttons in the nav', () => {
      renderChrome('CampaignHeaderBlock', withHeaderText)

      expect(screen.getByTestId('CanvasExtra-navHomeId')).toBeInTheDocument()
      expect(
        screen.queryByTestId('CanvasExtra-navResourcesId')
      ).not.toBeInTheDocument()
      expect(screen.queryByText('Not a nav button')).not.toBeInTheDocument()
    })

    it('opens the nav behind the menu icon and closes it again', () => {
      renderChrome('CampaignHeaderBlock')
      const menu = screen.getByRole('button', { name: 'Menu' })
      expect(menu).toHaveAttribute('aria-expanded', 'false')
      expect(screen.getByTestId('CanvasHeaderNav')).toHaveAttribute(
        'data-open',
        'false'
      )

      fireEvent.click(menu)
      expect(menu).toHaveAttribute('aria-expanded', 'true')
      expect(screen.getByTestId('CanvasHeaderNav')).toHaveAttribute(
        'data-open',
        'true'
      )

      fireEvent.click(menu)
      expect(menu).toHaveAttribute('aria-expanded', 'false')
    })

    it('selecting the menu icon does not select the header', () => {
      renderChrome('CampaignHeaderBlock')

      fireEvent.click(screen.getByRole('button', { name: 'Menu' }))

      expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent('')
    })

    it('opens the nav for a selected nav button so it can be outlined and scrolled to', () => {
      renderChrome('CampaignHeaderBlock', campaign, 'navHomeId')

      expect(screen.getByTestId('CanvasHeaderNav')).toHaveAttribute(
        'data-open',
        'true'
      )
      expect(screen.getByTestId('CanvasExtra-navHomeId')).toHaveAttribute(
        'data-selected',
        'true'
      )
      expect(screen.getByRole('button', { name: 'Menu' })).toHaveAttribute(
        'aria-expanded',
        'true'
      )
    })

    it('closing the menu over a selected nav button selects the header', () => {
      renderChrome('CampaignHeaderBlock', campaign, 'navHomeId')

      fireEvent.click(screen.getByRole('button', { name: 'Menu' }))

      expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
        'headerId'
      )
      expect(screen.getByTestId('CanvasHeaderNav')).toHaveAttribute(
        'data-open',
        'false'
      )
    })

    it('closes the menu when the selection leaves the header', () => {
      renderChrome('CampaignHeaderBlock')
      const menu = screen.getByRole('button', { name: 'Menu' })
      fireEvent.click(menu)
      expect(menu).toHaveAttribute('aria-expanded', 'true')

      fireEvent.click(screen.getByRole('button', { name: 'Select footerId' }))

      expect(menu).toHaveAttribute('aria-expanded', 'false')
    })

    it('keeps the menu open while a nav button stays selected', () => {
      renderChrome('CampaignHeaderBlock', campaign, 'navHomeId')

      fireEvent.click(screen.getByTestId('CanvasExtra-navResourcesId'))

      expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
        'navResourcesId'
      )
      expect(screen.getByRole('button', { name: 'Menu' })).toHaveAttribute(
        'aria-expanded',
        'true'
      )
    })

    it('has no scroll margin, so selecting the sticky header does not scroll the frame up', () => {
      renderChrome('CampaignHeaderBlock')

      expect(screen.getByTestId('CanvasSection-headerId')).not.toHaveStyle({
        scrollMarginTop: '64px'
      })
    })

    it('sticks to the top of the page', () => {
      renderChrome('CampaignHeaderBlock')

      expect(screen.getByTestId('CanvasSection-headerId')).toHaveStyle({
        position: 'sticky',
        top: '0px'
      })
    })
  })
})

describe('CanvasSection footer', () => {
  describe('CanvasFooterRow', () => {
    it('keeps clear of the sticky header when scrolled to', () => {
      renderChrome('CampaignFooterBlock')

      expect(screen.getByTestId('CanvasSection-footerId')).toHaveStyle({
        scrollMarginTop: '64px'
      })
    })

    it('shows the lines on the left and the links on the right', () => {
      renderChrome('CampaignFooterBlock')

      const row = screen.getByTestId('CanvasFooterRow')
      expect(screen.getByTestId('CanvasFooterLines')).toHaveTextContent(
        '© 2026 Jesus Film Project'
      )
      expect(row).toContainElement(screen.getByTestId('CanvasFooterLinks'))
      expect(screen.getByTestId('CanvasFooterLinks')).toHaveTextContent(
        'Terms of Use'
      )
      expect(screen.getByTestId('CanvasFooterLinks')).toHaveTextContent(
        'Your Privacy'
      )
      expect(
        screen.getByTestId('CanvasFooterLinks').nextElementSibling
      ).toBeNull()
    })

    it('renders no row for a footer without children', () => {
      const emptyFooter: Campaign = {
        ...campaign,
        blocks: campaign.blocks.filter(
          (block) => block.parentBlockId !== 'footerId'
        )
      }
      renderChrome('CampaignFooterBlock', emptyFooter)

      expect(screen.queryByTestId('CanvasFooterRow')).not.toBeInTheDocument()
      expect(screen.getByTestId('CanvasSection-footerId')).toBeInTheDocument()
    })

    it('selects a footer link on click', () => {
      renderChrome('CampaignFooterBlock')

      fireEvent.click(screen.getByTestId('CanvasExtra-footerTermsId'))

      expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
        'footerTermsId'
      )
    })
  })
})

describe('CanvasSection journey list strings', () => {
  const journeyList = transformCampaignBlocks(campaign.blocks).find(
    (block) => block.id === 'landingJourneyListId'
  ) as CanvasBlock
  const noJourneys = campaign.strings.find(
    (string) => string.key === 'noJourneys'
  )

  function stringMock(value: string) {
    return {
      request: {
        query: CAMPAIGN_STRING_UPDATE,
        variables: { campaignId: campaign.id, key: 'noJourneys', value }
      },
      result: vi.fn(() => ({
        data: {
          campaignStringUpdate: {
            __typename: 'CampaignString',
            id: noJourneys?.id,
            key: 'noJourneys',
            value
          }
        }
      }))
    }
  }

  it('lists the noJourneys string under the Campaign strings of the selected Journey list', () => {
    render(
      <StaticEditor
        initialState={{
          selectedBlockId: 'landingJourneyListId',
          previewLanguageId: '529'
        }}
      >
        <CanvasSection block={journeyList} />
      </StaticEditor>
    )

    expect(screen.getByText('Campaign strings')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'noJourneys' })).toHaveValue(
      'Journeys for this region are coming soon'
    )
  })

  it('saves an edit to the noJourneys string through campaignStringUpdate', async () => {
    const mock = stringMock('Coming soon')
    render(
      <StaticEditor
        mocks={[mock]}
        initialState={{
          selectedBlockId: 'landingJourneyListId',
          previewLanguageId: '529'
        }}
      >
        <CanvasSection block={journeyList} />
      </StaticEditor>
    )

    const input = screen.getByRole('textbox', { name: 'noJourneys' })
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'Coming soon' } })

    await waitFor(() => expect(mock.result).toHaveBeenCalled())
  })
})

describe('CanvasSection campaign strings', () => {
  const journeyList = transformCampaignBlocks(campaign.blocks).find(
    (block) => block.id === 'landingJourneyListId'
  ) as CanvasBlock

  it('keeps the Campaign strings label on a section that is not selected', () => {
    render(
      <StaticEditor initialState={{ previewLanguageId: '529' }}>
        <CanvasSection block={journeyList} />
      </StaticEditor>
    )

    expect(screen.getByText('Campaign strings')).toBeInTheDocument()
    expect(
      screen.getByTestId('InlineText-string-noJourneys')
    ).toBeInTheDocument()
  })
})

describe('CanvasSection region header', () => {
  const regionHeader = {
    ...newSectionBlock('CampaignRegionHeaderBlock', {
      id: 'regionHeaderId',
      campaignId: campaign.id,
      pageId: 'regionPageId',
      parentOrder: 0
    }),
    children: [],
    cover: null,
    media: null,
    logo: null
  } as unknown as CanvasBlock

  it('shows the previewed region’s name and its lines, read-only', () => {
    render(
      <StaticEditor
        campaignProp={campaignWithRegions}
        initialState={{
          pageKind: CampaignPageKind.regionTemplate,
          regionId: 'eurRegionId',
          previewLanguageId: '529'
        }}
      >
        <CanvasSection block={regionHeader} />
      </StaticEditor>
    )

    expect(screen.getByTestId('CampaignRegionName')).toHaveTextContent('Europe')
    expect(screen.getByTestId('CanvasRegionLine')).toHaveTextContent('EUR')
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  function withLine(
    overrides: Record<string, unknown>
  ): typeof campaignWithRegions {
    return {
      ...campaignWithRegions,
      blocks: campaignWithRegions.blocks.map((block) =>
        block.id === 'eurLineId'
          ? ({ ...block, ...overrides } as typeof block)
          : block
      )
    }
  }

  function renderHeader(
    campaignProp: typeof campaignWithRegions,
    previewLanguageId: string
  ): void {
    render(
      <StaticEditor
        campaignProp={campaignProp}
        initialState={{
          pageKind: CampaignPageKind.regionTemplate,
          regionId: 'eurRegionId',
          previewLanguageId
        }}
      >
        <CanvasSection block={regionHeader} />
      </StaticEditor>
    )
  }

  it('shows a line in the previewed language, falling back to the default text', () => {
    renderHeader(
      withLine({
        contentTranslations: [
          {
            __typename: 'TranslatedValue',
            languageId: '496',
            value: 'EUR en français',
            source: 'human'
          }
        ]
      }),
      '496'
    )

    expect(screen.getByTestId('CanvasRegionLine')).toHaveTextContent(
      'EUR en français'
    )
  })

  it('falls back to the default text when the line has no translation', () => {
    renderHeader(withLine({}), '496')

    expect(screen.getByTestId('CanvasRegionLine')).toHaveTextContent('EUR')
  })

  it('colours a heading line with the band heading colour and body text with the text colour', () => {
    renderHeader(withLine({ typographyVariant: 'h3', color: null }), '529')
    expect(screen.getByTestId('CanvasRegionLine')).toHaveStyle({
      color: 'var(--campaign-band-heading)'
    })
  })

  it('colours a body line with the band text colour', () => {
    renderHeader(withLine({ typographyVariant: 'body1', color: null }), '529')
    expect(screen.getByTestId('CanvasRegionLine')).toHaveStyle({
      color: 'var(--campaign-band-text)'
    })
  })
})

describe('CanvasSection rich text in a column slot', () => {
  const emptyRichText: Campaign = {
    ...campaignWithColumns,
    blocks: campaignWithColumns.blocks.map((block) =>
      block.id === 'slotRichTextId'
        ? ({ ...block, title: null, richTextContent: null } as typeof block)
        : block
    )
  }

  function renderColumns(selectedBlockId?: string): RenderResult {
    return render(
      <StaticEditor
        campaignProp={emptyRichText}
        initialState={{ selectedBlockId, previewLanguageId: '529' }}
      >
        <SelectionProbe />
        <Canvas
          campaign={emptyRichText}
          pageKind={CampaignPageKind.landing}
          view="desktop"
        />
      </StaticEditor>
    )
  }

  it('shows the Title and Your text placeholders while empty and not selected', async () => {
    const { baseElement } = renderColumns()
    const body = await frameBody(baseElement, 'CanvasColumns-columnsId')

    expect(
      body.querySelector(
        '[data-testid="CanvasColumnSlot-slotLeftId"] [data-testid="InlineText-title"]'
      )
    ).toHaveTextContent('Title')
    expect(
      body.querySelector(
        '[data-testid="CanvasColumnSlot-slotLeftId"] [data-testid="InlineText-richTextContent"]'
      )
    ).toHaveTextContent('Your text')
  })

  it('selects the Rich text, not the Column, when the slot is clicked', async () => {
    const { baseElement } = renderColumns()
    const body = await frameBody(baseElement, 'CanvasColumns-columnsId')

    fireEvent.click(
      body.querySelector(
        '[data-testid="CanvasColumnSlot-slotLeftId"]'
      ) as Element
    )

    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
      'slotRichTextId'
    )
  })
})
