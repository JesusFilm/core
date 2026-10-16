import { ThemeProvider } from '@mui/material/styles'
import { render, screen, within } from '@testing-library/react'

import {
  CampaignBackgroundKind,
  CampaignColumnsRatio,
  CampaignPageKind
} from '../../../../__generated__/globalTypes'
import { shouldRenderSection } from '../CampaignPage/shouldRenderSection'
import { CampaignProvider } from '../CampaignProvider'
import { createCampaignTheme } from '../libs/createCampaignTheme'
import { cssRulesFor } from '../libs/cssRulesFor'
import { transformCampaignBlocks } from '../libs/transformer'
import {
  LANDING_PAGE_ID,
  campaignPublic,
  columnSlot,
  section
} from '../testData'
import type { CampaignTreeOf } from '../types'

import { CampaignColumns } from './CampaignColumns'

const theme = createCampaignTheme(campaignPublic.theme, false)

/** Matches `declaration` inside the media rule that starts at a breakpoint. */
function mediaDeclaration(
  breakpoint: 'xs' | 'md',
  declaration: string
): RegExp {
  const width = theme.breakpoints.values[breakpoint]
  const escaped = declaration.replace(/[()]/g, (character) => `\\${character}`)
  return new RegExp(`@media\\(min-width:${width}px\\)[^{]*\\{[^@]*${escaped}`)
}

function blocksFor({
  ratio = CampaignColumnsRatio.equal,
  left = true,
  right = true,
  leftBackground = CampaignBackgroundKind.none
}: {
  ratio?: CampaignColumnsRatio
  left?: boolean
  right?: boolean
  leftBackground?: CampaignBackgroundKind
} = {}) {
  return [
    section('CampaignColumnsBlock', {
      id: 'columnsId',
      pageId: LANDING_PAGE_ID,
      parentOrder: 0,
      ratio
    }),
    columnSlot({
      id: 'slotLeftId',
      parentBlockId: 'columnsId',
      parentOrder: 0
    }),
    columnSlot({
      id: 'slotRightId',
      parentBlockId: 'columnsId',
      parentOrder: 1
    }),
    ...(left
      ? [
          section('CampaignRichTextBlock', {
            id: 'leftRichTextId',
            pageId: LANDING_PAGE_ID,
            parentBlockId: 'slotLeftId',
            parentOrder: 0,
            title: 'Left title',
            richTextContent: 'Left text',
            backgroundKind: leftBackground
          })
        ]
      : []),
    ...(right
      ? [
          section('CampaignHeroBlock', {
            id: 'rightHeroId',
            pageId: LANDING_PAGE_ID,
            parentBlockId: 'slotRightId',
            parentOrder: 0,
            eyebrow: null,
            title: 'Right title',
            lede: null,
            align: null,
            mediaBlockId: null
          })
        ]
      : [])
  ]
}

function columnsTree(
  options?: Parameters<typeof blocksFor>[0]
): CampaignTreeOf<'CampaignColumnsBlock'> {
  return transformCampaignBlocks(
    blocksFor(options)
  )[0] as CampaignTreeOf<'CampaignColumnsBlock'>
}

function renderColumns(block: CampaignTreeOf<'CampaignColumnsBlock'>) {
  return render(
    <ThemeProvider theme={theme}>
      <CampaignProvider
        value={{
          campaign: campaignPublic,
          pageKind: CampaignPageKind.landing,
          region: null
        }}
      >
        <CampaignColumns block={block} />
      </CampaignProvider>
    </ThemeProvider>
  )
}

describe('CampaignColumns', () => {
  it('renders the section in each slot, left slot first', () => {
    renderColumns(columnsTree())

    const left = screen.getByTestId('CampaignColumnSlot-slotLeftId')
    const right = screen.getByTestId('CampaignColumnSlot-slotRightId')
    expect(within(left).getByText('Left title')).toBeInTheDocument()
    expect(within(right).getByText('Right title')).toBeInTheDocument()
    expect(
      left.compareDocumentPosition(right) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
  })

  it.each([
    [CampaignColumnsRatio.equal, 'minmax(0,1fr)minmax(0,1fr)'],
    [CampaignColumnsRatio.wideLeft, 'minmax(0,2fr)minmax(0,1fr)'],
    [CampaignColumnsRatio.wideRight, 'minmax(0,1fr)minmax(0,2fr)']
  ])(
    'lays out the %s ratio at md and up, one column below',
    (ratio, columns) => {
      renderColumns(columnsTree({ ratio }))

      const rules = cssRulesFor(screen.getByTestId('CampaignColumns'))
      expect(rules).toContain('display:grid')
      expect(rules).toMatch(
        mediaDeclaration('xs', 'grid-template-columns:minmax(0,1fr);')
      )
      expect(rules).toMatch(
        mediaDeclaration('md', `grid-template-columns:${columns};`)
      )
    }
  )

  it('leaves an empty slot as space at md and up and collapses it below', () => {
    renderColumns(columnsTree({ right: false }))

    const empty = screen.getByTestId('CampaignColumnSlot-slotRightId')
    expect(empty).toBeEmptyDOMElement()
    const rules = cssRulesFor(empty)
    expect(rules).toMatch(mediaDeclaration('xs', 'display:none'))
    expect(rules).toMatch(mediaDeclaration('md', 'display:block'))
    expect(
      screen.getByTestId('CampaignColumnSlot-slotLeftId')
    ).not.toBeEmptyDOMElement()
  })

  it('does not wrap a section in a slot in a page container', () => {
    renderColumns(columnsTree())

    const left = screen.getByTestId('CampaignColumnSlot-slotLeftId')
    expect(left.querySelector('.MuiContainer-root')).toBeNull()
    expect(
      screen
        .getByTestId('CampaignSectionBand-columnsId')
        .querySelectorAll('.MuiContainer-root')
    ).toHaveLength(1)
  })

  it('pads and rounds a section in a slot that has a background', () => {
    renderColumns(
      columnsTree({ leftBackground: CampaignBackgroundKind.surface })
    )

    const rules = cssRulesFor(
      screen.getByTestId('CampaignSectionBand-leftRichTextId')
    )
    expect(rules).toMatch(mediaDeclaration('xs', 'padding:12px'))
    expect(rules).toMatch(mediaDeclaration('md', 'padding:16px'))
    expect(rules).toContain(`border-radius:${theme.shape.borderRadius}px`)
  })

  it('does not pad a section in a slot that has no background', () => {
    renderColumns(columnsTree())

    const rules = cssRulesFor(
      screen.getByTestId('CampaignSectionBand-rightHeroId')
    )
    expect(rules).not.toContain('padding:12px')
    expect(rules).not.toContain('border-radius')
  })

  describe('shouldRenderSection', () => {
    const context = {
      pageKind: CampaignPageKind.landing,
      region: null,
      regions: campaignPublic.regions
    }

    it('renders when either slot holds a section that renders', () => {
      expect(shouldRenderSection(columnsTree({ right: false }), context)).toBe(
        true
      )
      expect(shouldRenderSection(columnsTree({ left: false }), context)).toBe(
        true
      )
    })

    it('is skipped when both slots are empty and there are no extras', () => {
      expect(
        shouldRenderSection(columnsTree({ left: false, right: false }), context)
      ).toBe(false)
    })

    it('is skipped when the only sections in its slots would be skipped', () => {
      const tree = transformCampaignBlocks([
        ...blocksFor({ left: false, right: false }),
        section('CampaignRichTextBlock', {
          id: 'blankId',
          pageId: LANDING_PAGE_ID,
          parentBlockId: 'slotLeftId',
          parentOrder: 0,
          title: null,
          richTextContent: ''
        })
      ])[0] as CampaignTreeOf<'CampaignColumnsBlock'>

      expect(shouldRenderSection(tree, context)).toBe(false)
    })
  })
})
