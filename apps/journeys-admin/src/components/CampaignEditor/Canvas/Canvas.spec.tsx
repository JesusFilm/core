import Button from '@mui/material/Button'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ReactElement, useState } from 'react'

import {
  CampaignPageKind,
  CampaignTextSource
} from '../../../../__generated__/globalTypes'
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
        view={view}
      />
    </StaticEditor>
  )
}

function renderCanvas(
  pageKind = CampaignPageKind.landing,
  view: CanvasView = 'desktop'
): ReturnType<typeof render> {
  return render(
    <StaticEditor>
      <SelectionProbe />
      <Canvas campaign={campaign} pageKind={pageKind} view={view} />
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

describe('Canvas preview language', () => {
  const translated: typeof campaign = {
    ...campaign,
    blocks: campaign.blocks.map((block) =>
      block.__typename === 'CampaignHeroBlock'
        ? {
            ...block,
            titleTranslations: [
              {
                __typename: 'TranslatedValue',
                languageId: '496',
                value: "Partagez l'histoire de Noël",
                source: CampaignTextSource.human
              }
            ]
          }
        : block
    )
  }

  it('renders the campaign text in the preview language the top bar chose, falling back to the default where no translation exists', async () => {
    const { baseElement } = render(
      <StaticEditor
        campaignProp={translated}
        initialState={{ previewLanguageId: '496' }}
      >
        <Canvas
          campaign={translated}
          pageKind={CampaignPageKind.landing}
          view="desktop"
        />
      </StaticEditor>
    )

    const body = await frameBody(baseElement, 'CanvasSection-heroId')
    const hero = body.querySelector('[data-testid="CanvasSection-heroId"]')
    expect(hero?.textContent).toContain("Partagez l'histoire de Noël")
    expect(hero?.textContent).not.toContain('Share the story of Christmas')
    // The untranslated eyebrow shows the default-language fallback, marked.
    const eyebrow = hero?.querySelector('[data-testid="InlineText-eyebrow"]')
    expect(eyebrow).toHaveTextContent('Christmas 2026')
    expect(eyebrow).toHaveAttribute('data-fallback', 'true')
  })

  it('sets the frame direction from the preview language', async () => {
    const arabic: typeof campaign = {
      ...campaign,
      languages: [
        ...campaign.languages,
        {
          __typename: 'CampaignLanguage',
          id: 'campaignLanguageArId',
          languageId: '22658',
          order: 2,
          language: {
            __typename: 'Language',
            id: '22658',
            bcp47: 'ar',
            name: [
              { __typename: 'LanguageName', value: 'العربية', primary: true }
            ]
          }
        }
      ]
    }
    const { baseElement } = render(
      <StaticEditor
        campaignProp={arabic}
        initialState={{ previewLanguageId: '22658' }}
      >
        <Canvas
          campaign={arabic}
          pageKind={CampaignPageKind.landing}
          view="desktop"
        />
      </StaticEditor>
    )
    await frameBody(baseElement, 'CanvasSection-heroId')
    const iframe = baseElement.getElementsByTagName('iframe')[0]
    expect(iframe.contentDocument?.documentElement).toHaveAttribute(
      'dir',
      'rtl'
    )
  })
})
