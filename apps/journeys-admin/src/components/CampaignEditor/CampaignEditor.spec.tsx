import { MockedProvider } from '@apollo/client/testing/react'
import useMediaQuery from '@mui/material/useMediaQuery'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { GraphQLError } from 'graphql'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'
import { type Mock, type MockedFunction } from 'vitest'

import { CAMPAIGN_UPDATE } from '../../libs/useCampaignUpdateMutation'
import { GET_CURRENT_USER } from '../../libs/useCurrentUserLazyQuery'

import { CampaignEditor } from './CampaignEditor'
import { CURRENT_USER_ID, campaign } from './data'
import { firstRunHintKey } from './FirstRunHint'

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

  it('opens on the landing page, Desktop view, default language, campaign row visible, nothing selected', () => {
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
    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument()
    expect(baseElement.getElementsByTagName('iframe')).toHaveLength(1)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
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

    fireEvent.click(screen.getByRole('button', { name: 'Settings' }))
    const title = screen.getByLabelText('Title')
    fireEvent.change(title, { target: { value: 'Easter 2027' } })
    expect(title).toHaveValue('Easter 2027')
    fireEvent.blur(title)

    expect(await screen.findByText('campaign not found')).toBeInTheDocument()
    await waitFor(() => expect(title).toHaveValue('Christmas 2026'))
  })

  it('offers Delete campaign to the manager', async () => {
    renderEditor()

    fireEvent.click(screen.getByRole('button', { name: 'Settings' }))
    expect(
      await screen.findByRole('button', { name: 'Delete campaign' })
    ).toBeInTheDocument()
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
