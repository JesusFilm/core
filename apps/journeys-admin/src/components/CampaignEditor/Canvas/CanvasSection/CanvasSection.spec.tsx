import { RenderResult, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactElement } from 'react'

import { transformCampaignBlocks } from '@core/journeys/ui/Campaign'
import { headerLogoBlock } from '@core/journeys/ui/Campaign/testData'

import { GetCampaign_campaign as Campaign } from '../../../../../__generated__/GetCampaign'
import {
  CampaignPageKind,
  CampaignStringKey
} from '../../../../../__generated__/globalTypes'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { campaign, campaignWithColumns, campaignWithRegions } from '../../data'
import { SelectionProbe, StaticEditor, frameBody } from '../../testing'
import { newSectionBlock } from '../../utils/sectionTypes'
import { Canvas } from '../Canvas'
import type { CanvasBlock } from '../canvasBlock'

import { CanvasSection } from './CanvasSection'

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

function withAllRegions(source: Campaign, value: string): Campaign {
  return {
    ...source,
    strings: source.strings.map((string) =>
      string.key === CampaignStringKey.allRegions
        ? { ...string, value }
        : string
    )
  }
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
  describe('CanvasAllRegionsChip', () => {
    function renderRegionHeader(source: Campaign): void {
      render(
        <StaticEditor
          campaignProp={source}
          initialState={{
            pageKind: CampaignPageKind.regionTemplate,
            regionId: 'eurRegionId',
            previewLanguageId: '529'
          }}
        >
          <CanvasSection block={chromeBlock(source, 'CampaignHeaderBlock')} />
        </StaticEditor>
      )
    }

    it('shows the allRegions string on a Region Page', () => {
      renderRegionHeader(campaignWithRegions)

      const chip = screen.getByTestId('CanvasAllRegionsChip')
      expect(screen.getByTestId('CanvasHeaderRow')).toContainElement(chip)
      expect(chip).toHaveTextContent('All regions')
    })

    it('shows an edited allRegions string', () => {
      renderRegionHeader(
        withAllRegions(campaignWithRegions, 'Toutes les régions')
      )

      expect(screen.getByTestId('CanvasAllRegionsChip')).toHaveTextContent(
        'Toutes les régions'
      )
    })

    it('leaves the chip empty for a blank allRegions string', () => {
      renderRegionHeader(withAllRegions(campaignWithRegions, '  '))

      expect(screen.getByTestId('CanvasAllRegionsChip')).toHaveTextContent(/^$/)
    })

    it('shows no chip on the landing page', () => {
      renderChrome('CampaignHeaderBlock', campaignWithRegions)

      expect(
        screen.queryByTestId('CanvasAllRegionsChip')
      ).not.toBeInTheDocument()
    })
  })

  describe('CanvasBrandMark', () => {
    it('shows the campaign title while there is no logo', () => {
      renderChrome('CampaignHeaderBlock')

      expect(screen.getByTestId('CanvasBrandMarkTitle')).toHaveTextContent(
        'Outreach 2026'
      )
      expect(
        screen.queryByTestId('CanvasBrandMarkLogo')
      ).not.toBeInTheDocument()
    })

    it('shows the logo with its alt text once one is set', () => {
      renderChrome('CampaignHeaderBlock', withLogo)

      const logo = screen.getByTestId('CanvasBrandMarkLogo')
      expect(logo).toHaveAttribute('src', headerLogoBlock.src)
      expect(logo).toHaveAttribute('alt', 'Outreach logo')
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

    it('spaces its lines as the public footer does', () => {
      const copyright = campaign.blocks.find(
        (block) => block.id === 'footerCopyrightId'
      )
      const twoLines: Campaign = {
        ...campaign,
        blocks: [
          ...campaign.blocks,
          { ...copyright, id: 'footerSecondLineId', parentOrder: 3 } as never
        ]
      }
      renderChrome('CampaignFooterBlock', twoLines)

      expect(screen.getByTestId('CanvasExtra-footerSecondLineId')).toHaveStyle({
        marginTop: '4px'
      })
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
      expect(screen.getByTestId('CanvasSection-footerId')).toHaveStyle({
        minHeight: '16px'
      })
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
        block.id === 'eurLineId' ? { ...block, ...overrides } : block
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

describe('CanvasSection body text', () => {
  function bodySection(
    typename: 'CampaignRichTextBlock' | 'CampaignFeaturedMediaBlock',
    fields: Record<string, string>
  ): CanvasBlock {
    return {
      ...newSectionBlock(typename, {
        id: 'bodyTextId',
        campaignId: campaign.id,
        pageId: 'landingPageId',
        parentOrder: 0
      }),
      ...fields,
      children: [],
      cover: null,
      media: null
    } as unknown as CanvasBlock
  }

  function renderSection(block: CanvasBlock): RenderResult {
    return render(
      <StaticEditor initialState={{ previewLanguageId: '529' }}>
        <CanvasSection block={block} />
      </StaticEditor>
    )
  }

  it('shows Rich Text as one paragraph per blank-line run', () => {
    renderSection(
      bodySection('CampaignRichTextBlock', {
        richTextContent: 'First.\n\nSecond.'
      })
    )

    expect(
      screen
        .getAllByTestId('InlineTextParagraph')
        .map((paragraph) => paragraph.textContent)
    ).toEqual(['First.', 'Second.'])
  })

  it('shows Featured Media bullets as a list', () => {
    renderSection(
      bodySection('CampaignFeaturedMediaBlock', {
        bullets: 'Free to share\nIn over 1,800 languages'
      })
    )

    expect(screen.getByTestId('InlineText-bullets').tagName).toBe('UL')
    expect(
      screen.getAllByRole('listitem').map((item) => item.textContent)
    ).toEqual(['Free to share', 'In over 1,800 languages'])
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

describe('CanvasSection button label', () => {
  const hero = transformCampaignBlocks(campaign.blocks).find(
    (block) => block.id === 'heroId'
  ) as CanvasBlock

  it('inserts a line break on Enter instead of committing', async () => {
    render(
      <StaticEditor
        initialState={{
          selectedBlockId: 'heroButtonId',
          previewLanguageId: '529'
        }}
      >
        <CanvasSection block={hero} />
      </StaticEditor>
    )

    const input = screen.getByRole('textbox', { name: 'Button' })
    expect(input.tagName).toBe('TEXTAREA')

    await userEvent.type(input, '{Enter}now')

    expect(input).toHaveValue('Choose your region\nnow')
  })
})

describe('CanvasSection keyboard', () => {
  const hero = transformCampaignBlocks(campaign.blocks).find(
    (block) => block.id === 'heroId'
  ) as CanvasBlock

  function renderHero(): void {
    render(
      <StaticEditor initialState={{ previewLanguageId: '529' }}>
        <SelectionProbe />
        <CanvasSection block={hero} />
      </StaticEditor>
    )
  }

  it('makes the section focusable and labelled, without a button role', () => {
    renderHero()

    const section = screen.getByTestId('CanvasSection-heroId')
    expect(section).toHaveAttribute('tabindex', '0')
    expect(section).toHaveAttribute('aria-label', 'Hero')
    expect(section).not.toHaveAttribute('role')
  })

  it.each(['Enter', ' '])('selects the section on %j', (key) => {
    renderHero()

    fireEvent.keyDown(screen.getByTestId('CanvasSection-heroId'), { key })

    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent('heroId')
  })

  it.each(['Enter', ' '])(
    'selects an Extra, a button, on %j and not its section',
    (key) => {
      renderHero()
      const extra = screen.getByTestId('CanvasExtra-heroButtonId')
      expect(extra).toHaveAttribute('role', 'button')
      expect(extra).toHaveAttribute('tabindex', '0')

      fireEvent.keyDown(extra, { key })

      expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
        'heroButtonId'
      )
    }
  )
})
