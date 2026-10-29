import { fireEvent, render, screen, within } from '@testing-library/react'

import { CampaignPageKind } from '../../../../__generated__/globalTypes'
import { campaign, campaignWithRegions } from '../data'
import { SelectionProbe, StaticEditor } from '../testing'

import { PagesPanel } from './PagesPanel'

function renderPanel(
  campaignProp = campaign,
  initialState = {}
): ReturnType<typeof render> {
  return render(
    <StaticEditor campaign={campaignProp} initialState={initialState}>
      <SelectionProbe />
      <PagesPanel />
    </StaticEditor>
  )
}

function pageNames(): string[] {
  return within(screen.getByTestId('CampaignPageList'))
    .getAllByRole('button')
    .map((button) => button.textContent ?? '')
}

describe('PagesPanel', () => {
  it('shows the campaign title as its header', () => {
    renderPanel()

    expect(screen.getByTestId('CampaignPagesPanelTitle')).toHaveTextContent(
      campaign.title
    )
  })

  it('lists the landing page and the Region Page when the campaign has no regions', () => {
    renderPanel()

    expect(pageNames()).toEqual(['Landing page', 'Region page'])
  })

  it('lists each region as the Region Page rendered for it, with " · not listed" for orphans and the Needs journey chip', () => {
    renderPanel(campaignWithRegions)

    expect(pageNames()).toEqual([
      'Landing page',
      'EuropeNeeds journey',
      'Africa · not listedNeeds journey'
    ])
  })

  it('drops the Needs journey chip once every language of a region is linked', () => {
    renderPanel({
      ...campaignWithRegions,
      regions: campaignWithRegions.regions.map((region) =>
        region.id === 'afrRegionId'
          ? {
              ...region,
              languages: [{ ...region.languages[0], journeyId: 'journeyId' }]
            }
          : region
      )
    })

    const europe = screen.getByRole('button', { name: /^Europe/ })
    expect(within(europe).getByTestId('RegionNeedsJourney')).toHaveTextContent(
      'Needs journey'
    )
    const africa = screen.getByRole('button', { name: /^Africa/ })
    expect(
      within(africa).queryByTestId('RegionNeedsJourney')
    ).not.toBeInTheDocument()
  })

  it('switches the page the canvas shows, as a view choice', () => {
    renderPanel(campaignWithRegions)
    expect(
      screen.getByRole('button', { name: 'Landing page' })
    ).toHaveAttribute('aria-current', 'page')

    fireEvent.click(screen.getByRole('button', { name: /Africa · not listed/ }))

    expect(screen.getByTestId('PageKind')).toHaveTextContent('regionTemplate')
    expect(screen.getByTestId('RegionId')).toHaveTextContent('afrRegionId')
    expect(
      screen.getByRole('button', { name: /Africa · not listed/ })
    ).toHaveAttribute('aria-current', 'page')

    fireEvent.click(screen.getByRole('button', { name: 'Landing page' }))
    expect(screen.getByTestId('PageKind')).toHaveTextContent(
      CampaignPageKind.landing
    )
  })

  it('lists the campaign languages by autonym as the Preview Language and changes it', () => {
    renderPanel()
    const select = screen.getByRole('combobox', { name: 'Preview language' })
    expect(select).toHaveTextContent('English')

    fireEvent.mouseDown(select)
    expect(
      screen.getAllByRole('option').map((option) => option.textContent)
    ).toEqual(['English', 'Français'])

    fireEvent.click(screen.getByRole('option', { name: 'Français' }))
    expect(
      screen.getByRole('combobox', { name: 'Preview language' })
    ).toHaveTextContent('Français')
  })
})
