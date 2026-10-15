import { render, screen } from '@testing-library/react'

import { CampaignTextSource } from '../../../../__generated__/globalTypes'
import { campaignWithRegions } from '../data'
import { StaticEditor } from '../testing'

import { Breadcrumb } from './Breadcrumb'

const translated = {
  ...campaignWithRegions,
  regions: campaignWithRegions.regions.map((region) =>
    region.id === 'eurRegionId'
      ? {
          ...region,
          nameTranslations: [
            {
              __typename: 'TranslatedValue' as const,
              languageId: '496',
              value: 'L’Europe',
              source: CampaignTextSource.human
            }
          ]
        }
      : region
  )
}

function renderBreadcrumb(previewLanguageId: string): void {
  render(
    <StaticEditor
      campaignProp={translated}
      initialState={{
        selectedRegionId: 'eurRegionId',
        previewLanguageId
      }}
    >
      <Breadcrumb />
    </StaticEditor>
  )
}

describe('Breadcrumb', () => {
  it('names the selected region in the previewed language', () => {
    renderBreadcrumb('496')

    expect(screen.getByTestId('CampaignBreadcrumb')).toHaveTextContent(
      'Campaign›L’Europe'
    )
  })

  it('names the selected region by its default name in the default language', () => {
    renderBreadcrumb('529')

    expect(screen.getByTestId('CampaignBreadcrumb')).toHaveTextContent(
      'Campaign›Europe'
    )
  })
})
