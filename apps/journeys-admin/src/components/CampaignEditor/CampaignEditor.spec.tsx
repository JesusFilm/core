import { MockedProvider } from '@apollo/client/testing/react'
import useMediaQuery from '@mui/material/useMediaQuery'
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GraphQLError } from 'graphql'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'
import { type Mock, type MockedFunction } from 'vitest'

import { CampaignTranslationFilter } from '../../../__generated__/globalTypes'
import { GET_CAMPAIGN } from '../../libs/useCampaignQuery'
import { CAMPAIGN_TRANSLATIONS } from '../../libs/useCampaignTranslationsQuery'
import { CAMPAIGN_UPDATE } from '../../libs/useCampaignUpdateMutation'
import { GET_CURRENT_USER } from '../../libs/useCurrentUserLazyQuery'

import { CampaignEditor, EDITOR_MIN_WIDTH } from './CampaignEditor'
import { CURRENT_USER_ID, campaign } from './data'
import { frameBody } from './testing'

vi.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: vi.fn()
}))

vi.mock('next/router', () => ({
  __esModule: true,
  useRouter: vi.fn()
}))

const mockUseRouter = useRouter as MockedFunction<typeof useRouter>

const currentUserMock = {
  request: { query: GET_CURRENT_USER },
  result: {
    data: {
      me: {
        __typename: 'AuthenticatedUser',
        id: CURRENT_USER_ID,
        email: 'test@example.com'
      }
    }
  }
}

/** Makes the `min-width` media queries answer as a window of this width would. */
function setViewport(width: number): void {
  ;(useMediaQuery as Mock).mockImplementation((query: string) => {
    const minWidth = /min-width:(\d+)px/.exec(query)
    return minWidth != null && width >= Number(minWidth[1])
  })
}

const translationsMock = {
  request: {
    query: CAMPAIGN_TRANSLATIONS,
    variables: {
      campaignId: campaign.id,
      languageId: '496',
      filter: CampaignTranslationFilter.all
    }
  },
  result: { data: { campaignTranslations: [] } }
}

function renderEditor(
  mocks: Array<Record<string, unknown>> = [],
  campaignProp = campaign
): ReturnType<typeof render> {
  return render(
    <MockedProvider mocks={[currentUserMock, ...mocks] as never}>
      <SnackbarProvider>
        <CampaignEditor campaign={campaignProp} />
      </SnackbarProvider>
    </MockedProvider>
  )
}

describe('CampaignEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    setViewport(EDITOR_MIN_WIDTH)
    mockUseRouter.mockReturnValue({ push: vi.fn() } as unknown as NextRouter)
  })

  it('shows the larger-screen message and no canvas below 1280 px', () => {
    setViewport(EDITOR_MIN_WIDTH - 1)

    const { baseElement } = renderEditor()

    expect(useMediaQuery).toHaveBeenCalledWith('(min-width:1280px)')
    expect(screen.getByText('Open this on a larger screen')).toBeInTheDocument()
    expect(
      screen.getByText(
        'The campaign editor needs a window at least 1280 pixels wide.'
      )
    ).toBeInTheDocument()
    expect(screen.queryByTestId('CampaignCanvas')).not.toBeInTheDocument()
    expect(baseElement.getElementsByTagName('iframe')).toHaveLength(0)
  })

  it('renders fully at 1280 px: rail, canvas and Inspector, with no top bar, no bottom bar and no drawer', () => {
    const { baseElement } = renderEditor()

    expect(screen.getByTestId('CampaignLeftRail')).toBeInTheDocument()
    expect(screen.queryByTestId('CampaignBottomBar')).not.toBeInTheDocument()
    expect(screen.getByTestId('CampaignInspector')).toHaveAttribute(
      'data-selection',
      'campaign'
    )
    expect(screen.getByTestId('CampaignThemePanel')).toBeInTheDocument()
    expect(screen.queryByTestId('CampaignTopBar')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Desktop' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(baseElement.getElementsByTagName('iframe')).toHaveLength(1)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens on the Add panel and shows one panel at a time', () => {
    renderEditor()
    expect(screen.getAllByTestId('CampaignLeftPanel')).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Add' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )

    fireEvent.click(screen.getByRole('button', { name: 'Pages' }))
    expect(screen.getByTestId('CampaignPagesPanel')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Localize' }))
    expect(screen.getAllByTestId('CampaignLeftPanel')).toHaveLength(1)
    expect(screen.queryByTestId('CampaignPagesPanel')).not.toBeInTheDocument()
    expect(screen.getByTestId('CampaignLocalizePanel')).toBeInTheDocument()
  })

  it.each([EDITOR_MIN_WIDTH, 1440, 1920])(
    'docks the panel beside the rail at %i px, so the canvas never moves when the rail switches panels',
    (width) => {
      setViewport(width)
      renderEditor()
      const rail = screen.getByTestId('CampaignLeftRail')
      const canvas = screen.getByTestId('CampaignCanvas')
      const panel = screen.getByTestId('CampaignLeftPanel')
      expect(panel.parentElement).toBe(rail.parentElement)
      expect(panel.previousElementSibling).toBe(rail)
      expect(panel).not.toHaveStyle({ position: 'absolute' })

      fireEvent.click(screen.getByRole('button', { name: 'Pages' }))

      expect(screen.getByTestId('CampaignLeftPanel').parentElement).toBe(
        rail.parentElement
      )
      expect(screen.getByTestId('CampaignCanvas')).toBe(canvas)
    }
  )

  it('keeps the canvas banner at the canvas edge whichever panel is open', () => {
    renderEditor()
    expect(screen.getByTestId('CampaignCanvasBanner')).toHaveStyle({
      left: '0px'
    })

    fireEvent.click(screen.getByRole('button', { name: 'Pages' }))

    expect(screen.getByTestId('CampaignCanvasBanner')).toHaveStyle({
      left: '0px'
    })
  })

  it('tabs from the rail to the open panel, then the frame, then the Inspector', () => {
    renderEditor()
    fireEvent.click(screen.getByRole('button', { name: 'Pages' }))

    const inOrder = [
      screen.getByTestId('CampaignLeftRail'),
      screen.getByTestId('CampaignLeftPanel'),
      screen.getByTestId('CampaignCanvas'),
      screen.getByTestId('CampaignInspector')
    ]
    inOrder
      .slice(1)
      .forEach((element, index) =>
        expect(
          inOrder[index].compareDocumentPosition(element) &
            Node.DOCUMENT_POSITION_FOLLOWING
        ).toBeTruthy()
      )
  })

  it('switches page and Preview Language from the Pages panel', () => {
    renderEditor()
    fireEvent.click(screen.getByRole('button', { name: 'Pages' }))

    expect(
      screen.getByRole('button', { name: 'Landing page' })
    ).toHaveAttribute('aria-current', 'page')
    expect(
      screen.getByRole('combobox', { name: 'Preview language' })
    ).toHaveTextContent('English')

    fireEvent.click(screen.getByRole('button', { name: 'Region page' }))
    expect(screen.getByRole('button', { name: 'Region page' })).toHaveAttribute(
      'aria-current',
      'page'
    )

    fireEvent.mouseDown(
      screen.getByRole('combobox', { name: 'Preview language' })
    )
    fireEvent.click(screen.getByRole('option', { name: 'Français' }))
    expect(
      screen.getByRole('combobox', { name: 'Preview language' })
    ).toHaveTextContent('Français')
  })

  it('shows the Pages panel with P and keeps it on a second P, never while typing', () => {
    renderEditor()

    fireEvent.keyDown(document.body, { key: 'p', code: 'KeyP' })
    expect(screen.getByTestId('CampaignPagesPanel')).toBeInTheDocument()
    fireEvent.keyDown(document.body, { key: 'p', code: 'KeyP' })
    expect(screen.getByTestId('CampaignPagesPanel')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('tab', { name: 'Settings' }))
    const title = screen.getByLabelText('Title')
    title.focus()
    fireEvent.keyDown(title, { key: 'a', code: 'KeyA' })
    expect(screen.getByTestId('CampaignPagesPanel')).toBeInTheDocument()
    expect(screen.queryByTestId('CampaignAddPanel')).not.toBeInTheDocument()
  })

  it('shows the Add panel with A in the shell and inside the frame, never while typing', async () => {
    const { baseElement } = renderEditor()
    const body = await frameBody(baseElement, 'CanvasSection-heroId')
    const frameDocument = body.ownerDocument

    fireEvent.keyDown(document.body, { key: 'p', code: 'KeyP' })
    expect(screen.queryByTestId('CampaignAddPanel')).not.toBeInTheDocument()
    fireEvent.keyDown(document.body, { key: 'a', code: 'KeyA' })
    expect(screen.getByTestId('CampaignAddPanel')).toBeInTheDocument()
    fireEvent.keyDown(frameDocument.body, { key: 'p', code: 'KeyP' })
    expect(screen.queryByTestId('CampaignAddPanel')).not.toBeInTheDocument()
    fireEvent.keyDown(frameDocument.body, { key: 'a', code: 'KeyA' })
    expect(screen.getByTestId('CampaignAddPanel')).toBeInTheDocument()

    fireEvent.keyDown(document.body, { key: 'p', code: 'KeyP' })
    fireEvent.click(screen.getByRole('tab', { name: 'Settings' }))
    const title = screen.getByLabelText('Title')
    title.focus()
    fireEvent.keyDown(title, { key: 'a', code: 'KeyA' })
    expect(screen.queryByTestId('CampaignAddPanel')).not.toBeInTheDocument()
  })

  it('shows the Navigator panel with Z in the shell and inside the frame, never while typing', async () => {
    const { baseElement } = renderEditor()
    const body = await frameBody(baseElement, 'CanvasSection-heroId')

    fireEvent.keyDown(document.body, { key: 'z', code: 'KeyZ' })
    expect(screen.getByTestId('Navigator')).toBeInTheDocument()
    fireEvent.keyDown(body.ownerDocument.body, { key: 'z', code: 'KeyZ' })
    expect(screen.getByTestId('Navigator')).toBeInTheDocument()
    fireEvent.keyDown(body.ownerDocument.body, { key: 'p', code: 'KeyP' })
    expect(screen.queryByTestId('Navigator')).not.toBeInTheDocument()
    fireEvent.keyDown(body.ownerDocument.body, { key: 'z', code: 'KeyZ' })
    expect(screen.getByTestId('Navigator')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Pages' }))
    fireEvent.click(screen.getByRole('tab', { name: 'Settings' }))
    const title = screen.getByLabelText('Title')
    title.focus()
    fireEvent.keyDown(title, { key: 'z', code: 'KeyZ' })
    expect(screen.queryByTestId('Navigator')).not.toBeInTheDocument()
    expect(screen.getByTestId('CampaignPagesPanel')).toBeInTheDocument()
  })

  it('shows the picked row in the Inspector and expands the tree to a block picked on the canvas', async () => {
    const { baseElement } = renderEditor()
    const body = await frameBody(baseElement, 'CanvasSection-heroId')
    fireEvent.click(screen.getByRole('button', { name: 'Navigator' }))
    const scrollIntoView = vi.fn()
    ;(body.querySelector('#footerId') as HTMLElement).scrollIntoView =
      scrollIntoView

    fireEvent.click(
      screen
        .getByTestId('NavigatorRow-footerId')
        .querySelector('.MuiTreeItem-content') as HTMLElement
    )
    expect(screen.getByTestId('CampaignInspectorLabel')).toHaveTextContent(
      'Footer'
    )
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest' })

    fireEvent.click(
      body.querySelector('[data-testid="CanvasExtra-heroButtonId"]')!
    )
    expect(screen.getByTestId('NavigatorRow-heroButtonId')).toBeInTheDocument()
  })

  it('steps the selection up on Escape and leaves the open panel alone', async () => {
    const { baseElement } = renderEditor()
    const body = await frameBody(baseElement, 'CanvasSection-heroId')
    fireEvent.click(body.querySelector('[data-testid="CanvasSection-heroId"]')!)
    fireEvent.click(screen.getByRole('button', { name: 'Pages' }))
    expect(screen.getByTestId('CampaignInspectorLabel')).toHaveTextContent(
      'Hero'
    )

    await userEvent.keyboard('{Escape}')
    expect(screen.getByTestId('CampaignPagesPanel')).toBeInTheDocument()
    expect(screen.getByTestId('CampaignInspectorLabel')).toHaveTextContent(
      'Campaign'
    )
  })

  it('opens the Translations tab of the Localize panel from the rail', async () => {
    renderEditor([translationsMock])

    fireEvent.click(screen.getByRole('button', { name: 'Localize' }))
    expect(screen.getByRole('tab', { name: 'Languages' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
    fireEvent.click(screen.getByRole('tab', { name: 'Translations' }))

    expect(
      within(screen.getByTestId('CampaignLocalizePanel')).getByTestId(
        'TranslationsView'
      )
    ).toBeInTheDocument()
    expect(document.querySelector('.MuiDrawer-root')).toBeNull()
  })

  it('opens Localize on Translations with the promotion notice after the default language changes', async () => {
    const swapped = vi.fn(() => ({
      data: {
        campaignUpdate: {
          __typename: 'Campaign',
          id: 'campaignId',
          title: 'Outreach 2026',
          slug: 'outreach-2026'
        }
      }
    }))
    renderEditor([
      {
        request: {
          query: CAMPAIGN_UPDATE,
          variables: { id: 'campaignId', input: { defaultLanguageId: '496' } }
        },
        result: swapped
      },
      {
        request: { query: GET_CAMPAIGN, variables: { id: 'campaignId' } },
        result: { data: { campaign } }
      },
      translationsMock
    ])

    fireEvent.click(screen.getByRole('tab', { name: 'Settings' }))
    fireEvent.mouseDown(
      screen.getByRole('combobox', { name: 'Default language' })
    )
    fireEvent.click(screen.getByRole('option', { name: 'Français' }))
    const dialog = screen.getByTestId('CampaignDefaultLanguageDialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Change' }))

    expect(
      await screen.findByTestId('TranslationsPromotionNotice')
    ).toBeInTheDocument()
    expect(screen.getByTestId('CampaignLocalizePanel')).toBeInTheDocument()
    expect(
      await screen.findByRole('tab', { name: 'Translations' })
    ).toHaveAttribute('aria-selected', 'true')
    await waitFor(() => expect(swapped).toHaveBeenCalled())
  })

  it('leaves S to the Default language select while it is open', async () => {
    renderEditor()

    fireEvent.click(screen.getByRole('tab', { name: 'Settings' }))
    fireEvent.mouseDown(
      screen.getByRole('combobox', { name: 'Default language' })
    )
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    await userEvent.keyboard('s')

    expect(screen.getByTestId('CampaignSettings')).toBeInTheDocument()
    expect(screen.queryByTestId('CampaignThemePanel')).not.toBeInTheDocument()
  })

  it('floats the first-run hint in the canvas banner, taking no layout height', () => {
    renderEditor()

    expect(
      within(screen.getByTestId('CampaignCanvasBanner')).getByTestId(
        'CampaignFirstRunHint'
      )
    ).toHaveTextContent(
      'Pick anything on the page or in the Navigator, then change it in the Inspector.'
    )
    expect(screen.getByTestId('CampaignCanvasBanner')).toHaveStyle({
      position: 'absolute'
    })
  })

  it('surfaces a failed mutation as the error snackbar and rolls the value back', async () => {
    renderEditor([
      {
        request: {
          query: CAMPAIGN_UPDATE,
          variables: { id: 'campaignId', input: { title: 'Outreach 2027' } }
        },
        result: {
          errors: [
            new GraphQLError('campaign not found', {
              extensions: { code: 'NOT_FOUND' }
            })
          ]
        }
      }
    ])

    fireEvent.click(screen.getByRole('tab', { name: 'Settings' }))
    const title = screen.getByLabelText('Title')
    fireEvent.change(title, { target: { value: 'Outreach 2027' } })
    expect(title).toHaveValue('Outreach 2027')
    fireEvent.blur(title)

    expect(await screen.findByText('campaign not found')).toBeInTheDocument()
  })

  it('shows the Theme in the Inspector when nothing is selected', async () => {
    renderEditor()

    expect(await screen.findByTestId('CampaignThemePanel')).toHaveAttribute(
      'data-preset',
      'light'
    )
    expect(screen.getByRole('button', { name: 'Light' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })

  it('offers Delete campaign to the manager', async () => {
    renderEditor()

    fireEvent.click(screen.getByRole('tab', { name: 'Settings' }))
    expect(
      await screen.findByRole('button', { name: 'Delete campaign' })
    ).toBeInTheDocument()
  })

  it('swaps the Inspector’s content on selection without a drawer or a dimmed canvas', async () => {
    const { baseElement } = renderEditor()
    const body = await frameBody(baseElement, 'CanvasSection-heroId')

    fireEvent.click(body.querySelector('[data-testid="CanvasSection-heroId"]')!)

    expect(screen.getByTestId('CampaignStylePanel')).toHaveAttribute(
      'data-block-id',
      'heroId'
    )
    expect(screen.getByTestId('CampaignInspectorLabel')).toHaveTextContent(
      'Hero'
    )

    fireEvent.click(
      body.querySelector('[data-testid="CanvasExtra-heroButtonId"]')!
    )

    expect(screen.getByTestId('CampaignInspectorLabel')).toHaveTextContent(
      'Button'
    )
    expect(screen.queryByTestId('CampaignStylePanel')).not.toBeInTheDocument()
    expect(document.querySelector('.MuiDrawer-root')).toBeNull()
    expect(document.querySelector('.MuiBackdrop-root')).toBeNull()
  })

  it('switches the Inspector tab with D and S in the shell and inside the frame, and not while typing', async () => {
    const { baseElement } = renderEditor()
    const body = await frameBody(baseElement, 'CanvasSection-heroId')
    const frameDocument = body.ownerDocument
    const selected = (): string | null =>
      screen
        .getAllByRole('tab')
        .find((tab) => tab.getAttribute('aria-selected') === 'true')
        ?.textContent ?? null
    expect(selected()).toBe('Style')

    fireEvent.keyDown(document.body, { key: 'd', code: 'KeyD' })
    expect(selected()).toBe('Settings')
    fireEvent.keyDown(frameDocument.body, { key: 's', code: 'KeyS' })
    expect(selected()).toBe('Style')
    fireEvent.keyDown(frameDocument.body, { key: 'd', code: 'KeyD' })
    expect(selected()).toBe('Settings')

    const title = screen.getByLabelText('Title')
    title.focus()
    fireEvent.keyDown(title, { key: 's', code: 'KeyS' })
    expect(selected()).toBe('Settings')
  })

  it('shows a loading state until the campaign arrives', () => {
    render(
      <MockedProvider mocks={[currentUserMock]}>
        <SnackbarProvider>
          <CampaignEditor />
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('CampaignEditorLoading')).toBeInTheDocument()
  })
})
