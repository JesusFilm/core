import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'

import { PublicCampaignPage } from './PublicCampaignPage'
import {
  makeCampaignData,
  mockShareJourney,
  mockShareJourneySpanish
} from './publicCampaignPageData.mock'

describe('PublicCampaignPage', () => {
  describe('journey variant', () => {
    it('renders the hero copy, share panel, templates and country views', () => {
      render(<PublicCampaignPage data={makeCampaignData()} />)

      expect(screen.getByTestId('PublicCampaignPage')).toBeInTheDocument()
      expect(
        screen.getByRole('heading', {
          level: 1,
          name: 'Share the Gospel during the World Cup'
        })
      ).toBeInTheDocument()
      expect(screen.getByText('World Cup 2026 · Outreach')).toBeInTheDocument()
      expect(
        screen.getByText('Every match, every nation, every soul.')
      ).toBeInTheDocument()
      expect(screen.getByTestId('CampaignSharePanel')).toBeInTheDocument()
      expect(screen.getByTestId('CampaignTemplatesSection')).toBeInTheDocument()
      expect(screen.getByText('Sample Template')).toBeInTheDocument()
      expect(screen.getByTestId('CampaignCountryViews')).toBeInTheDocument()
      // Top country appears in the summary tile and again as the first row.
      expect(screen.getAllByText('Comoros')).toHaveLength(2)
      expect(screen.getByText('47,415')).toBeInTheDocument()
      const rows = within(
        screen.getByTestId('CampaignCountryViewsList')
      ).getAllByRole('listitem')
      expect(rows).toHaveLength(3)
      expect(rows[0]).toHaveTextContent('01')
      expect(rows[0]).toHaveTextContent('Comoros')
      expect(rows[0]).toHaveTextContent('8,588')
    })

    it('selects the first share journey and switches link + preview on language change', async () => {
      render(<PublicCampaignPage data={makeCampaignData()} />)

      const link = screen.getByLabelText('Share link')
      expect(link).toHaveValue('https://your.nextstep.is/you-belong-english')
      const frame = screen.getByTestId('CampaignJourneyFrame')
      expect(frame.querySelector('iframe')).toHaveAttribute(
        'src',
        'https://your.nextstep.is/embed/you-belong-english?expand=false'
      )

      fireEvent.mouseDown(screen.getByRole('combobox'))
      fireEvent.click(
        await screen.findByRole('option', { name: 'Spanish (Español)' })
      )

      await waitFor(() =>
        expect(link).toHaveValue('https://your.nextstep.is/you-belong-spanish')
      )
      expect(frame.querySelector('iframe')).toHaveAttribute(
        'src',
        'https://your.nextstep.is/embed/you-belong-spanish?expand=false'
      )
    })

    it('copies the share link to the clipboard', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined)
      Object.assign(navigator, { clipboard: { writeText } })
      render(<PublicCampaignPage data={makeCampaignData()} />)

      fireEvent.click(screen.getByTestId('CampaignCopyLinkButton'))

      await waitFor(() =>
        expect(writeText).toHaveBeenCalledWith(
          'https://your.nextstep.is/you-belong-english'
        )
      )
      await waitFor(() =>
        expect(screen.getByTestId('CampaignCopyLinkButton')).toHaveTextContent(
          'Copied'
        )
      )
    })

    it('downloads the QR code as a PNG named after the journey slug', () => {
      const toDataURL = vi
        .spyOn(HTMLCanvasElement.prototype, 'toDataURL')
        .mockReturnValue('data:image/png;base64,abc')
      const click = vi
        .spyOn(HTMLAnchorElement.prototype, 'click')
        .mockImplementation(() => undefined)
      render(
        <PublicCampaignPage
          data={makeCampaignData({ shareJourneys: [mockShareJourney] })}
        />
      )

      fireEvent.click(screen.getByTestId('CampaignQrCodeButton'))

      expect(toDataURL).toHaveBeenCalledWith('image/png')
      expect(click).toHaveBeenCalledTimes(1)
      toDataURL.mockRestore()
      click.mockRestore()
    })

    it('renders empty states when nothing is attached and stats are unavailable', () => {
      render(
        <PublicCampaignPage
          data={makeCampaignData({
            shareJourneys: [],
            templates: [],
            countryStats: null
          })}
        />
      )

      expect(screen.getByRole('combobox')).toHaveAttribute(
        'aria-disabled',
        'true'
      )
      expect(screen.getByTestId('CampaignCopyLinkButton')).toBeDisabled()
      expect(screen.getByTestId('CampaignQrCodeButton')).toBeDisabled()
      expect(
        screen.getByText('Templates added to this campaign will appear here.')
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          'View counts are unavailable right now. Check back soon.'
        )
      ).toBeInTheDocument()
      expect(
        screen.getByTestId('CampaignJourneyFrame').querySelector('iframe')
      ).toBeNull()
    })

    it('hides the country section entirely when stats are omitted', () => {
      render(
        <PublicCampaignPage
          data={makeCampaignData({ countryStats: undefined })}
        />
      )
      expect(
        screen.queryByTestId('CampaignCountryViews')
      ).not.toBeInTheDocument()
    })

    it('renders the hero background image when supplied', () => {
      render(
        <PublicCampaignPage
          data={makeCampaignData({
            backgroundImageSrc: 'https://example.com/bg.jpg',
            backgroundImageAlt: 'Stadium'
          })}
        />
      )
      expect(screen.getByTestId('CampaignHeroBackground')).toHaveAttribute(
        'src',
        'https://example.com/bg.jpg'
      )
    })
  })

  describe('admin variant', () => {
    it('renders a hidden, non-interactive preview with the media slot', () => {
      render(
        <PublicCampaignPage
          variant="admin"
          data={makeCampaignData({
            shareJourneys: [mockShareJourney, mockShareJourneySpanish]
          })}
          mediaSlot={<div data-testid="MediaSlot" />}
        />
      )

      const root = screen.getByTestId('PublicCampaignPageAdminView')
      expect(root).toHaveAttribute('aria-hidden', 'true')
      expect(within(root).getByTestId('MediaSlot')).toBeInTheDocument()
      expect(root.querySelector('iframe')).toBeNull()
      expect(
        within(root).getByText(
          'The selected journey plays here on the live page.'
        )
      ).toBeInTheDocument()
      expect(within(root).getByTestId('CampaignCopyLinkButton')).toBeDisabled()
      expect(within(root).getByTestId('CampaignQrCodeButton')).toBeDisabled()
      expect(
        within(root).getByTestId('CampaignDiscoverTemplates')
      ).not.toHaveAttribute('href')
    })
  })
})
