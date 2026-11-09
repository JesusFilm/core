import { ThemeProvider } from '@mui/material/styles'
import { renderToString } from 'react-dom/server'

import { CampaignPageKind } from '../../../../__generated__/globalTypes'
import { CampaignProvider } from '../CampaignProvider'
import { createCampaignTheme } from '../libs/createCampaignTheme'
import { campaignPublic, heroVideoBlock } from '../testData'
import type { CampaignTreeOf } from '../types'

import { CampaignVideo } from './CampaignVideo'

// The modules below load with no `window`, as on the server, so `next/dynamic`
// takes its server branch. This file runs in its own worker, so no other spec
// has loaded `next/dynamic` before it.
vi.hoisted(() => {
  vi.stubGlobal('window', undefined)
})

describe('CampaignVideo on the server', () => {
  beforeAll(() => {
    vi.unstubAllGlobals()
  })

  it('renders the poster in the 16:9 frame, without the player', () => {
    const block = {
      ...heroVideoBlock,
      children: [],
      cover: null,
      media: null,
      logo: null
    } as CampaignTreeOf<'CampaignVideoBlock'>
    const html = renderToString(
      <ThemeProvider theme={createCampaignTheme(campaignPublic.theme, false)}>
        <CampaignProvider
          value={{
            campaign: campaignPublic,
            pageKind: CampaignPageKind.landing,
            region: null
          }}
        >
          <CampaignVideo block={block} />
        </CampaignProvider>
      </ThemeProvider>
    )
    expect(html).toContain(
      'src="https://imagedelivery.net/accountHash/storyVideoId/mobileCinematicHigh"'
    )
    expect(html).toContain('loading="lazy"')
    expect(html).not.toContain('JourneysVideo-heroVideoId')
  })
})
