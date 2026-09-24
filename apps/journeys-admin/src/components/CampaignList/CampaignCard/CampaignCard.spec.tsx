import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { CampaignStatus } from '../../../../__generated__/globalTypes'
import { makeCampaign } from '../../../libs/campaignFields/campaignFixture'

import { CampaignCard } from './CampaignCard'

describe('CampaignCard', () => {
  it('shows the title, draft chip, public url, counts and edit link', () => {
    render(
      <SnackbarProvider>
        <CampaignCard campaign={makeCampaign()} />
      </SnackbarProvider>
    )
    expect(screen.getByText('World Cup 2026')).toBeInTheDocument()
    expect(screen.getByText('Draft')).toBeInTheDocument()
    expect(screen.getByTestId('CampaignCardPublicUrl')).toHaveTextContent(
      'https://your.nextstep.is/campaign/world-cup-2026'
    )
    expect(
      screen.getByText('1 share journeys · 0 templates', { exact: false })
    ).toBeInTheDocument()
    expect(screen.getByTestId('CampaignCardEdit')).toHaveAttribute(
      'href',
      '/campaigns/campaign-1'
    )
  })

  it('offers Publish for a draft and disables opening the public page', () => {
    const onPublish = vi.fn()
    render(
      <SnackbarProvider>
        <CampaignCard campaign={makeCampaign()} onPublish={onPublish} />
      </SnackbarProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Campaign actions' }))
    expect(
      screen.getByRole('menuitem', { name: 'Open public page' })
    ).toHaveAttribute('aria-disabled', 'true')
    fireEvent.click(screen.getByRole('menuitem', { name: 'Publish' }))
    expect(onPublish).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'campaign-1' })
    )
  })

  it('offers Unpublish and Delete for a live campaign', () => {
    const onUnpublish = vi.fn()
    const onDelete = vi.fn()
    render(
      <SnackbarProvider>
        <CampaignCard
          campaign={makeCampaign({
            status: CampaignStatus.published,
            publishedAt: '2026-06-03T00:00:00.000Z'
          })}
          onUnpublish={onUnpublish}
          onDelete={onDelete}
        />
      </SnackbarProvider>
    )
    expect(screen.getByText('Live')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Campaign actions' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Unpublish' }))
    expect(onUnpublish).toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Campaign actions' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Delete' }))
    expect(onDelete).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'campaign-1' })
    )
  })

  it('blocks Publish with the custom-domain reason', () => {
    render(
      <SnackbarProvider>
        <CampaignCard
          campaign={makeCampaign()}
          canPublish={false}
          publishBlockedReason="No custom domains"
        />
      </SnackbarProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Campaign actions' }))
    expect(screen.getByRole('menuitem', { name: 'Publish' })).toHaveAttribute(
      'aria-disabled',
      'true'
    )
  })

  it('copies the public link', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })
    render(
      <SnackbarProvider>
        <CampaignCard campaign={makeCampaign()} />
      </SnackbarProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Copy link' }))
    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith(
        'https://your.nextstep.is/campaign/world-cup-2026'
      )
    )
    expect(
      await screen.findByText('Link copied to clipboard')
    ).toBeInTheDocument()
  })
})
