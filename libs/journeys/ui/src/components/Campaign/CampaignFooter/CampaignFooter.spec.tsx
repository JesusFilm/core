import { ThemeProvider } from '@mui/material/styles'
import { render, screen, within } from '@testing-library/react'

import {
  CampaignBackgroundKind,
  CampaignPageKind
} from '../../../../__generated__/globalTypes'
import { campaignChromeTrees } from '../CampaignPage/campaignChromeTrees'
import { CampaignProvider } from '../CampaignProvider'
import { createCampaignTheme } from '../libs/createCampaignTheme'
import {
  campaignPublic,
  chromeBlocks,
  eurRegion,
  footerBlock
} from '../testData'
import type { CampaignBlock, CampaignPublic, CampaignRegion } from '../types'

import { CampaignFooter } from './CampaignFooter'

const theme = createCampaignTheme(campaignPublic.theme, false)

function withFooter(
  overrides: Partial<CampaignBlock> = {},
  chrome: CampaignBlock[] = chromeBlocks
): CampaignPublic {
  const footer = { ...footerBlock, ...overrides } as typeof footerBlock
  return {
    ...campaignPublic,
    footer,
    chrome: chrome.map((block) => (block.id === footer.id ? footer : block))
  }
}

function renderFooter(
  campaign: CampaignPublic = campaignPublic,
  pageKind = CampaignPageKind.landing,
  region: CampaignRegion | null = null
) {
  const { footer } = campaignChromeTrees(campaign)
  return render(
    <ThemeProvider theme={theme}>
      <CampaignProvider value={{ campaign, pageKind, region }}>
        <CampaignFooter block={footer} />
      </CampaignProvider>
    </ThemeProvider>
  )
}

function styleText(): string {
  return Array.from(document.querySelectorAll('style'))
    .map((node) => node.textContent ?? '')
    .join('')
}

function emotionClass(element: Element): string {
  const name = Array.from(element.classList).find((candidate) =>
    candidate.startsWith('css-')
  )
  if (name == null) throw new Error('no emotion class')
  return name.replace(/[-]/g, '\\-')
}

/** The element's emotion rule body under the `min-width` media query. */
function mediaRule(element: Element, minWidth: number): string {
  return (
    styleText().match(
      new RegExp(
        `@media \\(min-width:${minWidth}px\\)[^{]*\\{\\.${emotionClass(element)}\\{([^}]*)\\}`
      )
    )?.[1] ?? ''
  )
}

describe('CampaignFooter', () => {
  it('renders typography children as lines and button children as links', () => {
    renderFooter()
    const footer = screen.getByTestId('CampaignFooter')
    expect(footer.tagName).toBe('FOOTER')
    expect(footer.id).toBe('footerId')
    expect(
      within(screen.getByTestId('CampaignFooterLines')).getByTestId(
        'CampaignTypography'
      )
    ).toHaveTextContent('© 2026 Jesus Film Project')
    const links = within(
      screen.getByTestId('CampaignFooterLinks')
    ).getAllByRole('link')
    expect(links.map((link) => link.textContent)).toEqual([
      'Terms of Use',
      'Your Privacy'
    ])
    expect(links[0]).toHaveAttribute(
      'href',
      'https://www.cru.org/us/en/about/terms-of-use.html'
    )
  })

  it('orders lines and links by parentOrder', () => {
    const chrome = chromeBlocks.map((block) => {
      if (block.id === 'footerTermsId') return { ...block, parentOrder: 5 }
      if (block.id === 'footerPrivacyId') return { ...block, parentOrder: 1 }
      return block
    })
    renderFooter(withFooter({}, chrome))
    const links = within(
      screen.getByTestId('CampaignFooterLinks')
    ).getAllByRole('link')
    expect(links.map((link) => link.textContent)).toEqual([
      'Your Privacy',
      'Terms of Use'
    ])
  })

  it('renders an empty footer as a thin band', () => {
    renderFooter(withFooter({}, [footerBlock]))
    const footer = screen.getByTestId('CampaignFooter')
    expect(footer).toHaveAttribute('data-empty', 'true')
    expect(screen.queryByTestId('CampaignFooterRow')).not.toBeInTheDocument()
    expect(footer).toHaveStyle({ minHeight: '16px' })
  })

  it('treats children with no text as empty', () => {
    const chrome = chromeBlocks.map((block) => {
      if (
        block.__typename === 'CampaignTypographyBlock' &&
        block.parentBlockId === 'footerId'
      )
        return { ...block, content: '' }
      if (
        block.__typename === 'CampaignButtonBlock' &&
        block.parentBlockId === 'footerId'
      )
        return { ...block, label: ' ' }
      return block
    })
    renderFooter(withFooter({}, chrome))
    expect(screen.getByTestId('CampaignFooter')).toHaveAttribute(
      'data-empty',
      'true'
    )
  })

  it('stacks vertically below md and sits side by side from md up', () => {
    renderFooter()
    const row = screen.getByTestId('CampaignFooterRow')
    expect(mediaRule(row, 0)).toContain('flex-direction:column')
    expect(mediaRule(row, 600)).toContain('flex-direction:row')
    const links = screen.getByTestId('CampaignFooterLinks')
    expect(mediaRule(links, 0)).toContain('flex-direction:column')
    expect(mediaRule(links, 600)).toContain('flex-direction:row')
  })

  it('paints the band from the band table like any section', () => {
    renderFooter(
      withFooter({ backgroundKind: CampaignBackgroundKind.contrast })
    )
    const footer = screen.getByTestId('CampaignFooter')
    expect(footer.style.getPropertyValue('--campaign-band-background')).toBe(
      '#26262E'
    )
    expect(footer.style.getPropertyValue('--campaign-band-text')).toBe(
      '#FFFFFF'
    )
    expect(screen.getByTestId('CampaignTypography')).toHaveStyle({
      color: '#FFFFFF'
    })
  })

  it('renders the same on a region page', () => {
    renderFooter(campaignPublic, CampaignPageKind.regionTemplate, eurRegion)
    const links = within(
      screen.getByTestId('CampaignFooterLinks')
    ).getAllByRole('link')
    expect(links.map((link) => link.textContent)).toEqual([
      'Terms of Use',
      'Your Privacy'
    ])
  })
})
