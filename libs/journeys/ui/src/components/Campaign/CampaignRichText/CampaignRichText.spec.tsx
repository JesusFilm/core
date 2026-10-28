import { ThemeProvider } from '@mui/material/styles'
import { render, screen } from '@testing-library/react'

import { CampaignPageKind } from '../../../../__generated__/globalTypes'
import { shouldRenderSection } from '../CampaignPage/shouldRenderSection'
import { CampaignProvider } from '../CampaignProvider'
import { createCampaignTheme } from '../libs/createCampaignTheme'
import { transformCampaignBlocks } from '../libs/transformer'
import { LANDING_PAGE_ID, campaignPublic, section } from '../testData'
import type { CampaignTreeOf } from '../types'

import { CampaignRichText, splitParagraphs } from './CampaignRichText'

const theme = createCampaignTheme(campaignPublic.theme, false)

function richTextTree(
  overrides: Partial<
    Pick<CampaignTreeOf<'CampaignRichTextBlock'>, 'title' | 'richTextContent'>
  > = {}
): CampaignTreeOf<'CampaignRichTextBlock'> {
  return transformCampaignBlocks([
    section('CampaignRichTextBlock', {
      id: 'richTextId',
      pageId: LANDING_PAGE_ID,
      parentOrder: 0,
      title: 'Our story',
      richTextContent: 'First paragraph.\n\nSecond paragraph.',
      ...overrides
    })
  ])[0]
}

function renderRichText(block: CampaignTreeOf<'CampaignRichTextBlock'>) {
  return render(
    <ThemeProvider theme={theme}>
      <CampaignProvider
        value={{
          campaign: campaignPublic,
          pageKind: CampaignPageKind.landing,
          region: null
        }}
      >
        <CampaignRichText block={block} />
      </CampaignProvider>
    </ThemeProvider>
  )
}

describe('splitParagraphs', () => {
  it('splits on blank lines', () => {
    expect(splitParagraphs('One.\n\nTwo.\n\n\nThree.')).toEqual([
      'One.',
      'Two.',
      'Three.'
    ])
  })

  it('treats a whitespace-only line as blank and trims each paragraph', () => {
    expect(splitParagraphs('  One.  \n   \n  Two.  ')).toEqual(['One.', 'Two.'])
  })

  it('keeps a single line break inside a paragraph', () => {
    expect(splitParagraphs('Line one\nline two')).toEqual([
      'Line one\nline two'
    ])
  })

  it('skips empty paragraphs', () => {
    expect(splitParagraphs('\n\n\n')).toEqual([])
    expect(splitParagraphs('')).toEqual([])
    expect(splitParagraphs(null)).toEqual([])
  })
})

describe('CampaignRichText', () => {
  it('renders the title and one paragraph per blank-line-separated block', () => {
    renderRichText(richTextTree())

    expect(
      screen.getByRole('heading', { name: 'Our story' })
    ).toBeInTheDocument()
    const paragraphs = screen.getAllByTestId('CampaignRichTextParagraph')
    expect(paragraphs.map((paragraph) => paragraph.textContent)).toEqual([
      'First paragraph.',
      'Second paragraph.'
    ])
  })

  it('renders nothing for an empty title and skips empty paragraphs', () => {
    renderRichText(
      richTextTree({ title: '', richTextContent: 'Only one.\n\n \n\n' })
    )

    expect(screen.queryByTestId('CampaignTitle')).not.toBeInTheDocument()
    expect(screen.getAllByTestId('CampaignRichTextParagraph')).toHaveLength(1)
  })

  describe('shouldRenderSection', () => {
    const context = {
      pageKind: CampaignPageKind.landing,
      region: null,
      regions: campaignPublic.regions
    }

    it('renders with a title or any paragraph', () => {
      expect(
        shouldRenderSection(
          richTextTree({ title: null, richTextContent: 'Text' }),
          context
        )
      ).toBe(true)
      expect(
        shouldRenderSection(
          richTextTree({ title: 'Title', richTextContent: null }),
          context
        )
      ).toBe(true)
    })

    it('is skipped with no title, no paragraph and no extras', () => {
      expect(
        shouldRenderSection(
          richTextTree({ title: ' ', richTextContent: '\n\n' }),
          context
        )
      ).toBe(false)
    })
  })
})
