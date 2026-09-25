import { render, screen } from '@testing-library/react'

import { TemplateGalleryPageMediaType } from '../../../../__generated__/globalTypes'
import {
  makeAdminJourney,
  mockCountryStats
} from '../../../libs/campaignFields/campaignFixture'
import { EMPTY_MEDIA } from '../../TemplateGalleryPageList/CollectionDialog/useCollectionForm/collectionMedia'
import { CampaignFormValues } from '../useCampaignForm'

import { CampaignPreviewPane, toPreviewData } from './CampaignPreviewPane'

const values: CampaignFormValues = {
  title: 'World Cup 2026',
  eyebrow: 'Outreach',
  tagline: '',
  description: 'Desc',
  slug: 'world-cup-2026',
  backgroundImageSrc: '',
  backgroundImageAlt: '',
  media: EMPTY_MEDIA,
  shareJourneyIds: ['journey-1'],
  templateJourneyIds: ['template-1']
}

describe('CampaignPreviewPane', () => {
  it('maps form values and journeys into the public page data', () => {
    const data = toPreviewData(
      values,
      [makeAdminJourney()],
      [
        makeAdminJourney({
          id: 'template-1',
          title: 'Template',
          template: true,
          customizable: true
        })
      ],
      mockCountryStats,
      'https://your.nextstep.is'
    )
    expect(data.title).toBe('World Cup 2026')
    expect(data.media).toBeNull()
    expect(data.shareJourneys).toEqual([
      expect.objectContaining({ id: 'journey-1', slug: 'where-you-belong' })
    ])
    expect(data.templates).toEqual([
      expect.objectContaining({ id: 'template-1', customizable: true })
    ])
    expect(data.countryStats).toEqual({
      totalVisitors: 120,
      countries: [
        { countryCode: 'NG', countryName: 'Nigeria', visitors: 80 },
        { countryCode: 'KE', countryName: 'Kenya', visitors: 40 }
      ]
    })
  })

  it('renders the admin variant of the public page', () => {
    render(
      <CampaignPreviewPane
        values={{
          ...values,
          media: { ...EMPTY_MEDIA, type: TemplateGalleryPageMediaType.none }
        }}
        shareJourneys={[makeAdminJourney()]}
        templateJourneys={[]}
        countryStats={null}
        publicOrigin="https://your.nextstep.is"
      />
    )
    expect(screen.getByTestId('CampaignPreviewPane')).toBeInTheDocument()
    expect(
      screen.getByTestId('PublicCampaignPageAdminView')
    ).toBeInTheDocument()
  })
})
