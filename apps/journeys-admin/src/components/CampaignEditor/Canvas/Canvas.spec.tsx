import Button from '@mui/material/Button'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ReactElement, useState } from 'react'

import { CommandProvider, useCommand } from '@core/journeys/ui/CommandProvider'

import { CampaignPageKind } from '../../../../__generated__/globalTypes'
import { campaign } from '../data'

import { Canvas } from './Canvas'
import type { CanvasView } from './Canvas'

function CommandCount(): ReactElement {
  const { state } = useCommand()
  return <span data-testid="CommandCount">{state.commands.length}</span>
}

function ViewHarness(): ReactElement {
  const [view, setView] = useState<CanvasView>('desktop')
  return (
    <CommandProvider>
      <Button onClick={() => setView(view === 'desktop' ? 'phone' : 'desktop')}>
        Toggle view
      </Button>
      <CommandCount />
      <Canvas
        campaign={campaign}
        pageKind={CampaignPageKind.landing}
        previewLanguageId="529"
        view={view}
      />
    </CommandProvider>
  )
}

describe('Canvas', () => {
  async function frameBody(): Promise<HTMLElement | null> {
    const { baseElement } = render(
      <Canvas
        campaign={campaign}
        pageKind={CampaignPageKind.landing}
        previewLanguageId="529"
        view="desktop"
      />
    )
    const iframe = baseElement.getElementsByTagName('iframe')[0]
    await waitFor(() =>
      expect(
        iframe.contentDocument?.body.querySelector(
          '[data-testid="CanvasSection-heroId"]'
        )
      ).not.toBeNull()
    )
    return iframe.contentDocument?.body ?? null
  }

  it('renders the page inside a FramePortal iframe with the editor components', async () => {
    const { baseElement } = render(
      <Canvas
        campaign={campaign}
        pageKind={CampaignPageKind.landing}
        previewLanguageId="529"
        view="desktop"
      />
    )

    const iframe = baseElement.getElementsByTagName('iframe')[0]
    expect(iframe).toBeInTheDocument()
    expect(iframe).toHaveAttribute('width', '100%')
    await waitFor(() =>
      expect(
        iframe.contentDocument?.body.querySelector(
          '[data-testid="CanvasSection-heroId"]'
        )
      ).not.toBeNull()
    )
    const body = iframe.contentDocument?.body
    expect(body?.textContent).toContain('Share the story of Christmas')
    expect(body?.textContent).toContain('Choose your region')
    expect(body?.textContent).toContain('Where the story is spreading')
    // The region page's sections stay on the region page.
    expect(
      body?.querySelector('[data-testid="CanvasSection-regionHeaderId"]')
    ).toBeNull()
  })

  it('renders the Region Page when selected', async () => {
    const { baseElement } = render(
      <Canvas
        campaign={campaign}
        pageKind={CampaignPageKind.regionTemplate}
        previewLanguageId="529"
        view="desktop"
      />
    )

    const iframe = baseElement.getElementsByTagName('iframe')[0]
    await waitFor(() =>
      expect(
        iframe.contentDocument?.body.querySelector(
          '[data-testid="CanvasSection-regionHeaderId"]'
        )
      ).not.toBeNull()
    )
    expect(
      iframe.contentDocument?.body.querySelector(
        '[data-testid="CanvasSection-heroId"]'
      )
    ).toBeNull()
  })

  it('sets the frame to 390 px in Phone view', () => {
    const { baseElement } = render(
      <Canvas
        campaign={campaign}
        pageKind={CampaignPageKind.landing}
        previewLanguageId="529"
        view="phone"
      />
    )

    expect(baseElement.getElementsByTagName('iframe')[0]).toHaveAttribute(
      'width',
      '390'
    )
  })

  it('shows the default-language text when previewing the default language', async () => {
    const body = await frameBody()

    expect(body?.textContent).toContain('Share the story of Christmas')
    expect(body?.textContent).toContain('Choose your region')
    expect(body?.textContent).toContain('Films for the season')
  })

  it('shows the preview language’s text when the preview language is another one', async () => {
    const { baseElement } = render(
      <Canvas
        campaign={campaign}
        pageKind={CampaignPageKind.landing}
        previewLanguageId="496"
        view="desktop"
      />
    )
    const iframe = baseElement.getElementsByTagName('iframe')[0]
    await waitFor(() =>
      expect(
        iframe.contentDocument?.body.querySelector(
          '[data-testid="CanvasSection-heroId"]'
        )
      ).not.toBeNull()
    )
    const body = iframe.contentDocument?.body
    expect(body?.textContent).toContain('Partagez l’histoire de Noël')
    expect(body?.textContent).toContain('Choisissez votre région')
    expect(body?.textContent).toContain('Films de la saison')
    // The default-language text is gone, not merely supplemented.
    expect(body?.textContent).not.toContain('Share the story of Christmas')
    expect(body?.textContent).not.toContain('Films for the season')
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
    const { baseElement } = render(
      <Canvas
        campaign={campaignMissingFrench}
        pageKind={CampaignPageKind.landing}
        previewLanguageId="496"
        view="desktop"
      />
    )
    const iframe = baseElement.getElementsByTagName('iframe')[0]
    await waitFor(() =>
      expect(
        iframe.contentDocument?.body.querySelector(
          '[data-testid="CanvasSection-heroId"]'
        )
      ).not.toBeNull()
    )
    expect(iframe.contentDocument?.body?.textContent).toContain(
      'Share the story of Christmas'
    )
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
})
