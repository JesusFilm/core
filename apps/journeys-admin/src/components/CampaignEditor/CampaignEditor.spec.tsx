import { MockedProvider } from '@apollo/client/testing/react'
import useMediaQuery from '@mui/material/useMediaQuery'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { GraphQLError } from 'graphql'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'
import { type Mock, type MockedFunction } from 'vitest'

import { CampaignTranslationFilter } from '../../../__generated__/globalTypes'
import { CAMPAIGN_TRANSLATIONS } from '../../libs/useCampaignTranslationsQuery'
import { CAMPAIGN_UPDATE } from '../../libs/useCampaignUpdateMutation'
import { GET_CURRENT_USER } from '../../libs/useCurrentUserLazyQuery'

import { CampaignEditor } from './CampaignEditor'
import { CURRENT_USER_ID, campaign } from './data'
import { firstRunHintKey } from './FirstRunHint'
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
    ;(useMediaQuery as Mock).mockReturnValue(true)
    mockUseRouter.mockReturnValue({ push: vi.fn() } as unknown as NextRouter)
  })

  it('shows the larger-screen message and no canvas below 980 px', () => {
    ;(useMediaQuery as Mock).mockReturnValue(false)

    const { baseElement } = renderEditor()

    expect(useMediaQuery).toHaveBeenCalledWith('(min-width:980px)')
    expect(screen.getByText('Open this on a larger screen')).toBeInTheDocument()
    expect(screen.queryByTestId('CampaignCanvas')).not.toBeInTheDocument()
    expect(baseElement.getElementsByTagName('iframe')).toHaveLength(0)
  })

  it('opens on the landing page, Desktop view, default language, the Inspector showing the Theme, nothing selected', () => {
    const { baseElement } = renderEditor()

    expect(screen.getByRole('combobox', { name: /^Page/ })).toHaveTextContent(
      'Landing page'
    )
    expect(screen.getByRole('button', { name: 'Desktop' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(
      screen.getByRole('combobox', { name: /^Preview language/ })
    ).toHaveTextContent('English')
    expect(screen.getByTestId('CampaignBottomBar')).toBeInTheDocument()
    expect(screen.getByTestId('CampaignInspector')).toHaveAttribute(
      'data-selection',
      'campaign'
    )
    expect(screen.getByTestId('CampaignThemePanel')).toBeInTheDocument()
    expect(baseElement.getElementsByTagName('iframe')).toHaveLength(1)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens the Translations view inline in the Inspector from the campaign row', async () => {
    renderEditor([
      {
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
    ])

    fireEvent.click(screen.getByRole('button', { name: 'Translations' }))

    expect(await screen.findByTestId('TranslationsView')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Settings' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
    expect(
      within(screen.getByTestId('CampaignInspector')).getByTestId(
        'TranslationsView'
      )
    ).toBeInTheDocument()
    expect(document.querySelector('.MuiDrawer-root')).toBeNull()
  })

  it('shows the dismissible first-run hint once per campaign through localStorage', () => {
    const { unmount } = renderEditor()

    const hint = screen.getByTestId('CampaignFirstRunHint')
    expect(hint).toHaveTextContent(
      'Click any text to edit it. Add your regions in the region switcher.'
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByTestId('CampaignFirstRunHint')).not.toBeInTheDocument()
    expect(localStorage.getItem(firstRunHintKey(campaign.id))).toBe('true')

    unmount()
    renderEditor()
    expect(screen.queryByTestId('CampaignFirstRunHint')).not.toBeInTheDocument()
  })

  it('shows the hint again for another campaign', () => {
    localStorage.setItem(firstRunHintKey(campaign.id), 'true')

    renderEditor([], { ...campaign, id: 'otherCampaignId' })

    expect(screen.getByTestId('CampaignFirstRunHint')).toBeInTheDocument()
  })

  it('surfaces a failed mutation as the error snackbar and rolls the value back', async () => {
    renderEditor([
      {
        request: {
          query: CAMPAIGN_UPDATE,
          variables: { id: 'campaignId', input: { title: 'Easter 2027' } }
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
    fireEvent.change(title, { target: { value: 'Easter 2027' } })
    expect(title).toHaveValue('Easter 2027')
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
