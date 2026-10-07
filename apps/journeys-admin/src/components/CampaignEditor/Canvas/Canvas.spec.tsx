import Button from '@mui/material/Button'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ReactElement, useState } from 'react'

import { CampaignPageKind } from '../../../../__generated__/globalTypes'
import { campaign } from '../data'
import {
  CommandProbe,
  SelectionProbe,
  StaticEditor,
  frameBody
} from '../testing'

import { Canvas } from './Canvas'
import type { CanvasView } from './Canvas'

function ViewHarness(): ReactElement {
  const [view, setView] = useState<CanvasView>('desktop')
  return (
    <StaticEditor>
      <Button onClick={() => setView(view === 'desktop' ? 'phone' : 'desktop')}>
        Toggle view
      </Button>
      <CommandProbe />
      <Canvas
        campaign={campaign}
        pageKind={CampaignPageKind.landing}
        previewLanguageId="529"
        view={view}
      />
    </StaticEditor>
  )
}

function renderCanvas(
  pageKind = CampaignPageKind.landing,
  view: CanvasView = 'desktop',
  previewLanguageId = '529',
  canvasCampaign: typeof campaign = campaign
): ReturnType<typeof render> {
  return render(
    <StaticEditor>
      <SelectionProbe />
      <Canvas
        campaign={canvasCampaign}
        pageKind={pageKind}
        previewLanguageId={previewLanguageId}
        view={view}
      />
    </StaticEditor>
  )
}

describe('Canvas', () => {
  it('renders the page inside a FramePortal iframe with the editor components', async () => {
    const { baseElement } = renderCanvas()

    const iframe = baseElement.getElementsByTagName('iframe')[0]
    expect(iframe).toBeInTheDocument()
    expect(iframe).toHaveAttribute('width', '100%')
    const body = await frameBody(baseElement, 'CanvasSection-heroId')
    expect(body.textContent).toContain('Share the story of Christmas')
    expect(body.textContent).toContain('Choose your region')
    expect(body.textContent).toContain('Where the story is spreading')
    // The region page's sections stay on the region page.
    expect(
      body.querySelector('[data-testid="CanvasSection-regionHeaderId"]')
    ).toBeNull()
  })

  it('renders the Region Page when selected', async () => {
    const { baseElement } = renderCanvas(CampaignPageKind.regionTemplate)

    const body = await frameBody(baseElement, 'CanvasSection-regionHeaderId')
    expect(
      body.querySelector('[data-testid="CanvasSection-heroId"]')
    ).toBeNull()
  })

  it('sets the frame to 390 px in Phone view', () => {
    const { baseElement } = renderCanvas(CampaignPageKind.landing, 'phone')

    expect(baseElement.getElementsByTagName('iframe')[0]).toHaveAttribute(
      'width',
      '390'
    )
  })

  it('shows the default-language text when previewing the default language', async () => {
    const { baseElement } = renderCanvas()
    const body = await frameBody(baseElement, 'CanvasSection-heroId')

    expect(body.textContent).toContain('Share the story of Christmas')
    expect(body.textContent).toContain('Choose your region')
    expect(body.textContent).toContain('Films for the season')
  })

  it('shows the preview language’s text when the preview language is another one', async () => {
    const { baseElement } = renderCanvas(
      CampaignPageKind.landing,
      'desktop',
      '496'
    )
    const body = await frameBody(baseElement, 'CanvasSection-heroId')

    expect(body.textContent).toContain('Partagez l’histoire de Noël')
    expect(body.textContent).toContain('Choisissez votre région')
    expect(body.textContent).toContain('Films de la saison')
    // The default-language text is gone, not merely supplemented.
    expect(body.textContent).not.toContain('Share the story of Christmas')
    expect(body.textContent).not.toContain('Films for the season')
  })

  it('keeps the default-language text while the preview language has no translation yet', async () => {
    const campaignMissingFrench = {
      ...campaign,
      blocks: campaign.blocks.map((block) =>
        block.__typename === 'CampaignHeroBlock'
          ? { ...block, titleTranslations: [] }
          : block
      )
    } as typeof campaign
    const { baseElement } = renderCanvas(
      CampaignPageKind.landing,
      'desktop',
      '496',
      campaignMissingFrench
    )
    const body = await frameBody(baseElement, 'CanvasSection-heroId')

    expect(body.textContent).toContain('Share the story of Christmas')
  })

  it('keeps a translated field read-only so an edit never lands on the wrong language', async () => {
    const { baseElement } = renderCanvas(
      CampaignPageKind.landing,
      'desktop',
      '496'
    )
    const body = await frameBody(baseElement, 'CanvasSection-heroId')

    fireEvent.click(body.querySelector('[data-testid="CanvasSection-heroId"]')!)

    expect(body.querySelector('textarea')).toBeNull()
    expect(body.textContent).toContain('Partagez l’histoire de Noël')
  })

  it('treats Desktop/Phone as a view toggle, not a Command', () => {
    const { baseElement } = render(<ViewHarness />)

    fireEvent.click(screen.getByRole('button', { name: 'Toggle view' }))
    expect(baseElement.getElementsByTagName('iframe')[0]).toHaveAttribute(
      'width',
      '390'
    )
    fireEvent.click(screen.getByRole('button', { name: 'Toggle view' }))
    expect(baseElement.getElementsByTagName('iframe')[0]).toHaveAttribute(
      'width',
      '100%'
    )
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('0')
  })

  it('selects a section on click and turns its text into inline inputs', async () => {
    const { baseElement } = renderCanvas()
    const body = await frameBody(baseElement, 'CanvasSection-heroId')

    expect(body.querySelector('textarea')).toBeNull()
    fireEvent.click(body.querySelector('[data-testid="CanvasSection-heroId"]')!)

    expect(screen.getByTestId('SelectionKind')).toHaveTextContent('section')
    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent('heroId')
    await waitFor(() =>
      expect(body.querySelector('textarea[name="title"]')).toHaveValue(
        'Share the story of Christmas'
      )
    )
    expect(body.querySelector('textarea[name="eyebrow"]')).toHaveValue(
      'Christmas 2026'
    )
    expect(body.querySelector('textarea[name="lede"]')).toHaveValue(
      'Pick your region to find a journey in your language, ready to share.'
    )
  })

  it('selects an Extra on click and the campaign row on the empty frame', async () => {
    const { baseElement } = renderCanvas()
    const body = await frameBody(baseElement, 'CanvasExtra-heroButtonId')

    fireEvent.click(
      body.querySelector('[data-testid="CanvasExtra-heroButtonId"]')!
    )
    expect(screen.getByTestId('SelectionKind')).toHaveTextContent('button')
    await waitFor(() =>
      expect(body.querySelector('textarea[name="label"]')).toHaveValue(
        'Choose your region'
      )
    )

    fireEvent.click(
      body.querySelector('[data-testid="CanvasExtra-journeyListNoteId"]')!
    )
    expect(screen.getByTestId('SelectionKind')).toHaveTextContent('text')

    fireEvent.click(body.querySelector('[data-testid="CampaignCanvasPage"]')!)
    expect(screen.getByTestId('SelectionKind')).toHaveTextContent('campaign')
  })
})
