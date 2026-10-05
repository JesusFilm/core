import { ThemeProvider } from '@mui/material/styles'
import { render, screen } from '@testing-library/react'

import { CampaignPageKind } from '../../../../__generated__/globalTypes'
import { shouldRenderSection } from '../CampaignPage/shouldRenderSection'
import { CampaignProvider } from '../CampaignProvider'
import { createCampaignTheme } from '../libs/createCampaignTheme'
import { transformCampaignBlocks } from '../libs/transformer'
import { campaignPublic, imageSectionBlock, landingBlocks } from '../testData'
import type { CampaignBlock, CampaignTreeOf } from '../types'

import { CampaignImage } from './CampaignImage'

const theme = createCampaignTheme(campaignPublic.theme, false)

function styleText(): string {
  return Array.from(document.querySelectorAll('style'))
    .map((node) => node.textContent ?? '')
    .join('')
}

function imageTree(
  overrides: Partial<CampaignBlock> = {},
  extraBlocks: CampaignBlock[] = []
): CampaignTreeOf<'CampaignImageBlock'> {
  return transformCampaignBlocks([
    { ...imageSectionBlock, ...overrides } as CampaignBlock,
    ...extraBlocks
  ])[0] as CampaignTreeOf<'CampaignImageBlock'>
}

function renderImage(block: CampaignTreeOf<'CampaignImageBlock'>) {
  return render(
    <ThemeProvider theme={theme}>
      <CampaignProvider
        value={{
          campaign: campaignPublic,
          pageKind: CampaignPageKind.landing,
          region: null
        }}
      >
        <CampaignImage block={block} />
      </CampaignProvider>
    </ThemeProvider>
  )
}

const context = {
  pageKind: CampaignPageKind.landing,
  region: null,
  regions: campaignPublic.regions
}

describe('CampaignImage', () => {
  it('renders the picture inside its band with alt text and its space reserved from width and height', () => {
    renderImage(imageTree())
    const image = screen.getByRole('img', { name: 'A family reading together' })
    expect(image).toHaveAttribute(
      'src',
      'https://imagedelivery.net/accountHash/imageSection/public'
    )
    expect(image).toHaveAttribute('width', '1600')
    expect(image).toHaveAttribute('height', '900')
    expect(styleText()).toContain('aspect-ratio:1600/900')
    expect(
      screen.getByTestId('CampaignSectionBand-imageSectionId')
    ).toBeInTheDocument()
  })

  it('uses empty alt and no size attributes when none are stored', () => {
    renderImage(imageTree({ alt: null, width: null, height: null }))
    const image = screen.getByTestId('CampaignImage')
    expect(image).toHaveAttribute('alt', '')
    expect(image).not.toHaveAttribute('width')
    expect(image).not.toHaveAttribute('height')
  })

  it('renders no picture for an empty section', () => {
    renderImage(imageTree({ src: null }))
    expect(screen.queryByTestId('CampaignImage')).not.toBeInTheDocument()
    expect(
      screen.getByTestId('CampaignSectionBand-imageSectionId')
    ).toBeInTheDocument()
  })

  it('is skipped by the page when empty, and rendered with a picture or an Extra', () => {
    expect(shouldRenderSection(imageTree(), context)).toBe(true)
    expect(shouldRenderSection(imageTree({ src: null }), context)).toBe(false)
    expect(shouldRenderSection(imageTree({ src: '  ' }), context)).toBe(false)
    const note = landingBlocks.find((block) => block.id === 'journeyListNoteId')
    expect(
      shouldRenderSection(
        imageTree({ src: null }, [
          { ...note, parentBlockId: 'imageSectionId' } as CampaignBlock
        ]),
        context
      )
    ).toBe(true)
  })
})
