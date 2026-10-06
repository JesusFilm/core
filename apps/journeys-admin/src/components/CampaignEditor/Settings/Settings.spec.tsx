import { MockedProvider } from '@apollo/client/testing/react'
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'
import { GraphQLError } from 'graphql'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'
import { ReactElement } from 'react'
import { type MockedFunction } from 'vitest'

import { CommandProvider, useCommand } from '@core/journeys/ui/CommandProvider'

import { GetCampaign_campaign as Campaign } from '../../../../__generated__/GetCampaign'
import { CAMPAIGN_DELETE } from '../../../libs/useCampaignDeleteMutation'
import { CAMPAIGN_UPDATE } from '../../../libs/useCampaignUpdateMutation'
import { campaign, publishedCampaign } from '../data'

import { Settings, shapeSlug } from './Settings'

vi.mock('next/router', () => ({
  __esModule: true,
  useRouter: vi.fn()
}))

const mockUseRouter = useRouter as MockedFunction<typeof useRouter>

function CommandCount(): ReactElement {
  const { state } = useCommand()
  return <span data-testid="CommandCount">{state.commands.length}</span>
}

interface RenderOptions {
  campaign?: Campaign
  isManager?: boolean
  mocks?: Array<Record<string, unknown>>
}

function renderSettings({
  campaign: campaignProp = campaign,
  isManager = true,
  mocks = []
}: RenderOptions = {}): void {
  render(
    <MockedProvider mocks={mocks as never}>
      <SnackbarProvider>
        <CommandProvider>
          <CommandCount />
          <Settings campaign={campaignProp} isManager={isManager} />
        </CommandProvider>
      </SnackbarProvider>
    </MockedProvider>
  )
}

describe('Settings', () => {
  const mockPush = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseRouter.mockReturnValue({ push: mockPush } as unknown as NextRouter)
  })

  it('shows the draft status copy', () => {
    renderSettings()

    expect(screen.getByTestId('CampaignStatusCopy')).toHaveTextContent(
      'Draft. Edits are saved as you make them; nothing is public until you publish.'
    )
  })

  it('shows the published status copy', () => {
    renderSettings({ campaign: publishedCampaign })

    expect(screen.getByTestId('CampaignStatusCopy')).toHaveTextContent(
      'Published. Edits are saved as you make them and reach the public page shortly.'
    )
  })

  it('shows the permanent root-domain address and the current public address', () => {
    renderSettings()

    expect(
      screen.getByText(
        'Permanent address: https://your.nextstep.is/campaign/christmas-2026'
      )
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Current public address: https://your.nextstep.is/campaign/christmas-2026'
      )
    ).toBeInTheDocument()
  })

  it('saves the title through campaignUpdate on commit without adding a Command', async () => {
    const result = vi.fn(() => ({
      data: {
        campaignUpdate: {
          __typename: 'Campaign',
          id: 'campaignId',
          title: 'Easter 2027',
          slug: 'christmas-2026'
        }
      }
    }))
    renderSettings({
      mocks: [
        {
          request: {
            query: CAMPAIGN_UPDATE,
            variables: { id: 'campaignId', input: { title: 'Easter 2027' } }
          },
          result
        }
      ]
    })

    const title = screen.getByLabelText('Title')
    fireEvent.change(title, { target: { value: ' Easter 2027 ' } })
    fireEvent.blur(title)

    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('0')
  })

  it('shapes the slug as typed and saves it through campaignUpdate', async () => {
    const result = vi.fn(() => ({
      data: {
        campaignUpdate: {
          __typename: 'Campaign',
          id: 'campaignId',
          title: 'Christmas 2026',
          slug: 'xmas-2026'
        }
      }
    }))
    renderSettings({
      mocks: [
        {
          request: {
            query: CAMPAIGN_UPDATE,
            variables: { id: 'campaignId', input: { slug: 'xmas-2026' } }
          },
          result
        }
      ]
    })

    const slug = screen.getByLabelText('Slug')
    fireEvent.change(slug, { target: { value: 'Xmas 2026!' } })
    expect(slug).toHaveValue('xmas-2026-')
    fireEvent.blur(slug)

    expect(slug).toHaveValue('xmas-2026')
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('0')
  })

  it("shows the API's BAD_USER_INPUT message verbatim on the slug field", async () => {
    renderSettings({
      mocks: [
        {
          request: {
            query: CAMPAIGN_UPDATE,
            variables: { id: 'campaignId', input: { slug: 'campaign' } }
          },
          result: {
            errors: [
              new GraphQLError('slug "campaign" is reserved', {
                extensions: { code: 'BAD_USER_INPUT', field: 'slug' }
              })
            ]
          }
        }
      ]
    })

    const slug = screen.getByLabelText('Slug')
    fireEvent.change(slug, { target: { value: 'campaign' } })
    fireEvent.blur(slug)

    expect(
      await screen.findByText('slug "campaign" is reserved')
    ).toBeInTheDocument()
  })

  it('keeps the field on the rejected value while the API error is shown', async () => {
    renderSettings({
      mocks: [
        {
          request: {
            query: CAMPAIGN_UPDATE,
            variables: { id: 'campaignId', input: { slug: 'campaign' } }
          },
          result: {
            errors: [
              new GraphQLError('slug "campaign" is reserved', {
                extensions: { code: 'BAD_USER_INPUT', field: 'slug' }
              })
            ]
          }
        }
      ]
    })

    const slug = screen.getByLabelText('Slug')
    fireEvent.change(slug, { target: { value: 'campaign' } })
    fireEvent.blur(slug)

    // The optimistic value rolled back in the cache, but the field still shows
    // what the error describes.
    expect(
      await screen.findByText('slug "campaign" is reserved')
    ).toBeInTheDocument()
    expect(slug).toHaveValue('campaign')
  })

  it('rejects an empty title before calling the API', () => {
    renderSettings()

    const title = screen.getByLabelText('Title')
    fireEvent.change(title, { target: { value: '   ' } })
    fireEvent.blur(title)

    expect(screen.getByText('Title is required')).toBeInTheDocument()
  })

  it('has no Save button, Unsaved chip or save indicator', () => {
    renderSettings()

    expect(
      screen.queryByRole('button', { name: 'Save' })
    ).not.toBeInTheDocument()
    expect(screen.queryByText('Unsaved')).not.toBeInTheDocument()
    expect(screen.queryByText(/Saving/)).not.toBeInTheDocument()
  })

  it('offers Delete campaign to managers and confirms before campaignDelete', async () => {
    const result = vi.fn(() => ({
      data: { campaignDelete: { __typename: 'Campaign', id: 'campaignId' } }
    }))
    renderSettings({
      mocks: [
        {
          request: { query: CAMPAIGN_DELETE, variables: { id: 'campaignId' } },
          result
        }
      ]
    })

    fireEvent.click(screen.getByRole('button', { name: 'Delete campaign' }))
    const dialog = screen.getByTestId('CampaignDeleteDialog')
    expect(result).not.toHaveBeenCalled()

    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/campaigns'))
  })

  it('does not offer Delete campaign to members', () => {
    renderSettings({ isManager: false })

    expect(
      screen.queryByRole('button', { name: 'Delete campaign' })
    ).not.toBeInTheDocument()
  })

  describe('shapeSlug', () => {
    it('lowercases, swaps invalid runs for one dash and clips leading dashes', () => {
      expect(shapeSlug('  Xmas 2026!! ')).toBe('xmas-2026-')
      expect(shapeSlug('--Easter')).toBe('easter')
    })
  })
})
